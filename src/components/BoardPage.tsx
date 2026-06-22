import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Board as BoardType, List as ListType, Card as CardType, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { BoardHeader } from '@/components/BoardHeader';
import { buildBackground } from '@/lib/patterns';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const addList = useBoardStore((state) => state.addList);
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId);
  const boards = useBoardStore((state) => state.boards);

  useEffect(() => {
    if (showAddList) inputRef.current?.focus();
  }, [showAddList]);

  const openAddList = () => {
    setNewListTitle('');
    setShowAddList(true);
  };

  const cancelAddList = () => {
    setShowAddList(false);
    setNewListTitle('');
  };

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

  const allCards = board.lists?.flatMap((list) => list.cards || []) || [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: buildBackground(board.color, board.pattern) }}
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

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          <SearchBar cards={allCards} onSearch={setFilteredCards} />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
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

          {/* Inline Add List */}
          {showAddList ? (
            <form
              onSubmit={handleAddList}
              className="flex-shrink-0 w-80 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col gap-2"
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
                  <X size={18} />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={openAddList}
              className="flex-shrink-0 w-80 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all"
            >
              <Plus size={18} />
              Add another list
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
