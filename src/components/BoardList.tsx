import React, { useState, useRef, useEffect } from 'react';
import { FlatIcon } from '@/components/FlatIcon';
import { Board, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface BoardListProps {
  boards: Board[];
  currentBoardId: string | null;
  onSelectBoard: (id: string) => void;
  onClose: () => void;
  onCreateBoard: () => void;
}

export const BoardList: React.FC<BoardListProps> = ({
  boards,
  currentBoardId,
  onSelectBoard,
  onClose,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const addBoard = useBoardStore((state) => state.addBoard);
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId);

  useEffect(() => {
    if (showForm) inputRef.current?.focus();
  }, [showForm]);

  const handleDeleteBoard = async (id: string) => {
    if (!window.confirm('Delete this board?')) return;
    await supabase.from('boards').delete().eq('id', id);
    deleteBoard(id);
    if (currentBoardId === id) {
      const remaining = boards.find((b) => b.id !== id);
      setCurrentBoardId(remaining ? remaining.id : null as any);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    setSaving(true);
    const newBoard: Board = {
      id: Math.random().toString(36).substr(2, 9),
      title: t,
      color: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)',
      lists: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { lists: _l, ...boardRow } = newBoard;
    const { error } = await supabase.from('boards').insert([boardRow]);
    setSaving(false);

    if (error) { alert(`Save failed: ${error.message}`); return; }

    addBoard(newBoard);
    setCurrentBoardId(newBoard.id);
    setTitle('');
    setShowForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-white w-80 h-full shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icons8-kawaii-coffee-100.png" alt="" className="w-8 h-8" />
            <div>
              <p className="text-xs font-bold text-gray-800 leading-tight">ProCaffstinator</p>
              <p className="text-xs text-gray-400 leading-tight">Your Boards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <FlatIcon name="cross" className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Board List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {boards.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No boards yet</p>
          ) : (
            boards.map((board) => (
              <div
                key={board.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center group ${
                  currentBoardId === board.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div
                  onClick={() => { onSelectBoard(board.id); onClose(); }}
                  className="flex-1"
                >
                  <h3 className="font-semibold">{board.title}</h3>
                  {board.description && (
                    <p className="text-xs opacity-75 mt-0.5">{board.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteBoard(board.id)}
                  className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FlatIcon name="trash" className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Create Board */}
        <div className="border-t p-4">
          {showForm ? (
            <form onSubmit={handleCreateBoard} className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setShowForm(false)}
                placeholder="Board name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? 'Creating…' : 'Create Board'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setTitle(''); }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <FlatIcon name="cross" className="w-[18px] h-[18px] text-gray-500" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FlatIcon name="add" className="w-[18px] h-[18px] text-white" />
              Create Board
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
