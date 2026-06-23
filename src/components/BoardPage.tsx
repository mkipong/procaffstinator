'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { FlatIcon } from '@/components/FlatIcon';
import { Board as BoardType, List as ListType, Card as CardType, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { BoardHeader } from '@/components/BoardHeader';
import { buildBackgroundStyle } from '@/lib/patterns';
import { BoardList } from '@/components/BoardList';
import { List } from '@/components/List';
import { SearchBar } from '@/components/SearchBar';

interface BoardPageProps {
  board: BoardType;
}

export const BoardPage: React.FC<BoardPageProps> = ({ board }) => {
  const [showBoardList, setShowBoardList] = useState(false);
  const [filteredCards, setFilteredCards] = useState<CardType[]>([]);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'card' | 'list' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addList = useBoardStore((state) => state.addList);
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId);
  const boards = useBoardStore((state) => state.boards);
  const reorderLists = useBoardStore((state) => state.reorderLists);
  const reorderCards = useBoardStore((state) => state.reorderCards);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  useEffect(() => {
    if (showAddList) inputRef.current?.focus();
  }, [showAddList]);

  const openAddList = () => { setNewListTitle(''); setShowAddList(true); };
  const cancelAddList = () => { setShowAddList(false); setNewListTitle(''); };

  const handleAddList = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;

    setSaving(true);
    const newList: ListType = {
      id: Math.random().toString(36).substr(2, 9),
      board_id: board.id,
      title,
      position: (board.lists?.length || 0) + 1,
      cards: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { cards: _cards, ...listRow } = newList;
    const { error } = await supabase.from('lists').insert([listRow]);
    setSaving(false);

    if (error) { alert(`Save failed: ${error.message}`); return; }
    addList(newList);
    setNewListTitle('');
    inputRef.current?.focus();
  };

  // ─── Drag handlers ──────────────────────────────────────────────────────

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDragId(active.id as string);
    setActiveDragType(active.data.current?.type ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragType(null);

    if (!over || active.id === over.id) return;

    const lists = board.lists ?? [];
    const activeId = active.id as string;
    const overId = over.id as string;

    // ── Reorder lists ──
    if (active.data.current?.type === 'list') {
      const oldIdx = lists.findIndex((l) => l.id === activeId);
      const newIdx = lists.findIndex((l) => l.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      const reordered = arrayMove(lists, oldIdx, newIdx).map((l, i) => ({ ...l, position: i + 1 }));
      reorderLists(board.id, reordered);
      reordered.forEach((l) => supabase.from('lists').update({ position: l.position }).eq('id', l.id));
      return;
    }

    // ── Move / reorder cards ──
    if (active.data.current?.type === 'card') {
      const sourceList = lists.find((l) => l.cards?.some((c) => c.id === activeId));
      if (!sourceList) return;

      // Target can be a list (drop on empty list) or a list containing the over card
      const targetList =
        lists.find((l) => l.id === overId) ??
        lists.find((l) => l.cards?.some((c) => c.id === overId));
      if (!targetList) return;

      if (sourceList.id === targetList.id) {
        // Same list — reorder
        const cards = sourceList.cards ?? [];
        const oldIdx = cards.findIndex((c) => c.id === activeId);
        const newIdx = cards.findIndex((c) => c.id === overId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

        const newCards = arrayMove(cards, oldIdx, newIdx).map((c, i) => ({ ...c, position: i + 1 }));
        reorderCards(sourceList.id, newCards);
        newCards.forEach((c) => supabase.from('cards').update({ position: c.position }).eq('id', c.id));
      } else {
        // Cross-list move
        const card = sourceList.cards?.find((c) => c.id === activeId)!;
        const newSourceCards = (sourceList.cards ?? [])
          .filter((c) => c.id !== activeId)
          .map((c, i) => ({ ...c, position: i + 1 }));

        const targetCards = targetList.cards ?? [];
        const overIdx = targetCards.findIndex((c) => c.id === overId);
        const insertAt = overIdx >= 0 ? overIdx : targetCards.length;
        const newTargetCards = [...targetCards];
        newTargetCards.splice(insertAt, 0, { ...card, list_id: targetList.id });
        const finalTargetCards = newTargetCards.map((c, i) => ({ ...c, position: i + 1 }));

        reorderCards(sourceList.id, newSourceCards);
        reorderCards(targetList.id, finalTargetCards);

        newSourceCards.forEach((c) =>
          supabase.from('cards').update({ position: c.position }).eq('id', c.id),
        );
        finalTargetCards.forEach((c) =>
          supabase.from('cards').update({ position: c.position, list_id: c.list_id }).eq('id', c.id),
        );
      }
    }
  };

  // ─── Active items for DragOverlay ───────────────────────────────────────

  const activeCard = activeDragType === 'card'
    ? board.lists?.flatMap((l) => l.cards ?? []).find((c) => c.id === activeDragId)
    : null;

  const activeList = activeDragType === 'list'
    ? board.lists?.find((l) => l.id === activeDragId)
    : null;

  const allCards = board.lists?.flatMap((list) => list.cards || []) || [];
  void filteredCards;

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={buildBackgroundStyle(board.color, board.pattern)}
    >
      <BoardHeader
        board={board}
        onAddList={openAddList}
        onShowBoardList={() => setShowBoardList(true)}
      />

      {showBoardList && (
        <BoardList
          boards={boards}
          currentBoardId={board.id}
          onSelectBoard={(id) => setCurrentBoardId(id)}
          onClose={() => setShowBoardList(false)}
          onCreateBoard={() => {}}
        />
      )}

      <div className="p-3 sm:p-6">
        <div className="flex gap-4 mb-4 sm:mb-6">
          <SearchBar cards={allCards} onSearch={setFilteredCards} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={board.lists?.map((l) => l.id) ?? []}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 items-start">
              {board.lists && board.lists.length > 0 ? (
                board.lists.map((list) => (
                  <List
                    key={list.id}
                    list={list}
                    onEditCard={() => {}}
                    fontHeading={board.font_heading}
                    fontCard={board.font_card}
                    fontBody={board.font_body}
                  />
                ))
              ) : (
                !showAddList && (
                  <p className="text-white/80 py-12 text-sm">No lists yet — add one to get started.</p>
                )
              )}

              {showAddList ? (
                <form
                  onSubmit={handleAddList}
                  className="flex-shrink-0 w-[17rem] sm:w-80 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && cancelAddList()}
                    placeholder="Enter list name..."
                    className="w-full px-3 py-2 rounded-lg bg-white text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-gray-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || !newListTitle.trim()}
                      className="flex-1 bg-white text-purple-700 font-semibold text-sm px-3 py-2 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving…' : 'Add list'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAddList}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <FlatIcon name="cross" className="w-[18px] h-[18px] text-white" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={openAddList}
                  className="flex-shrink-0 w-[17rem] sm:w-80 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all"
                >
                  <FlatIcon name="add" className="w-[18px] h-[18px] text-white" />
                  Add another list
                </button>
              )}
            </div>
          </SortableContext>

          {/* Drag overlay — simplified preview, no hooks */}
          <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
            {activeCard && (
              <div className="rotate-2 w-[17rem] sm:w-80">
                <div className="bg-white rounded-lg p-3 shadow-2xl opacity-95">
                  {activeCard.priority && (
                    <div className={`-mx-3 -mt-3 mb-2 h-1 rounded-t-lg ${
                      activeCard.priority === 'high' ? 'bg-red-400' :
                      activeCard.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                  )}
                  <h3 className="font-semibold text-sm text-gray-900" style={{ fontFamily: board.font_card }}>
                    {activeCard.title}
                  </h3>
                  {activeCard.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2" style={{ fontFamily: board.font_body }}>
                      {activeCard.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            {activeList && (
              <div className="rotate-1 bg-gray-100 rounded-lg p-3 w-[17rem] sm:w-80 shadow-2xl opacity-90">
                <h2 className="font-bold text-gray-900">{activeList.title}</h2>
                <p className="text-xs text-gray-400 mt-1">{activeList.cards?.length ?? 0} cards</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
