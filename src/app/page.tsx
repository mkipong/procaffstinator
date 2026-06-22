'use client';

import React, { useEffect, useState } from 'react';
import { Loader, Database, Copy, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useBoardStore, Board } from '@/lib/store';
import { BoardPage } from '@/components/BoardPage';
import { Dashboard } from '@/components/Dashboard';
import { PomodoroTimer } from '@/components/PomodoroTimer';

const SETUP_SQL = `-- Run this in your Supabase SQL Editor (app.supabase.com → SQL Editor)

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'from-purple-500 via-purple-600 to-indigo-700',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  due_date DATE,
  label TEXT,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Allow public read/write (no auth required for demo)
ALTER TABLE boards  DISABLE ROW LEVEL SECURITY;
ALTER TABLE lists   DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards   DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;`;

type DbStatus = 'checking' | 'ok' | 'tables_missing' | 'error';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [dbError, setDbError] = useState('');
  const [copied, setCopied] = useState(false);
  const boards = useBoardStore((state) => state.boards);
  const currentBoardId = useBoardStore((state) => state.currentBoardId);
  const setBoards = useBoardStore((state) => state.setBoards);
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId);
  useEffect(() => {
    checkAndLoad();
  }, []);

  const checkAndLoad = async () => {
    setIsLoading(true);
    try {
      // Test connection & table existence
      const { error: testError } = await supabase.from('boards').select('id').limit(1);

      if (testError) {
        if (testError.code === '42P01' || testError.message?.includes('does not exist')) {
          setDbStatus('tables_missing');
        } else {
          setDbStatus('error');
          setDbError(testError.message);
        }
        setIsLoading(false);
        return;
      }

      setDbStatus('ok');
      await loadBoards();
    } catch (e: any) {
      setDbStatus('error');
      setDbError(e?.message || 'Unknown error');
      setIsLoading(false);
    }
  };

  const loadBoards = async () => {
    try {
      const { data: boardsData, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (boardsError) throw boardsError;

      if (boardsData && boardsData.length > 0) {
        const { data: listsData } = await supabase
          .from('lists')
          .select('*')
          .order('position', { ascending: true });

        const { data: cardsData } = await supabase
          .from('cards')
          .select('*')
          .order('position', { ascending: true });

        const boardsWithData = boardsData.map((board) => ({
          ...board,
          lists: (listsData || [])
            .filter((list) => list.board_id === board.id)
            .map((list) => ({
              ...list,
              cards: (cardsData || []).filter((card) => card.list_id === list.id),
            })),
        }));

        setBoards(boardsWithData as Board[]);
        // Stay on Dashboard — user picks a board from there
      }
    } catch (error: any) {
      console.error('Error loading boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-white" size={48} />
          <p className="text-white text-lg">Connecting to database...</p>
        </div>
      </div>
    );
  }

  // ── Tables missing ───────────────────────────────────────────────────────
  if (dbStatus === 'tables_missing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-2">
            <Database size={28} className="text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Database Setup Required</h1>
          </div>
          <p className="text-gray-500 mb-6">
            Your Supabase project is connected but the tables don't exist yet. Copy the SQL below and run it in your Supabase SQL Editor — it only takes 30 seconds.
          </p>

          <div className="bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SQL to run</span>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap max-h-72 overflow-y-auto">
              {SETUP_SQL}
            </pre>
          </div>

          <ol className="text-sm text-gray-600 space-y-1 mb-6 list-decimal list-inside">
            <li>Go to <strong>app.supabase.com</strong> → your project</li>
            <li>Click <strong>SQL Editor</strong> in the left sidebar</li>
            <li>Paste the copied SQL and click <strong>Run</strong></li>
            <li>Come back here and click <strong>Done, re-check</strong></li>
          </ol>

          <button
            onClick={checkAndLoad}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Done, re-check connection
          </button>
        </div>
      </div>
    );
  }

  // ── Connection error ─────────────────────────────────────────────────────
  if (dbStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h1>
          <p className="text-gray-500 mb-2">Could not reach Supabase.</p>
          <p className="text-xs text-red-500 bg-red-50 rounded p-3 mb-6 text-left font-mono">{dbError}</p>
          <p className="text-sm text-gray-500 mb-6">
            Check that <code className="bg-gray-100 px-1 rounded">.env.local</code> has the correct <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
          <button
            onClick={checkAndLoad}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard (home) or Board page ───────────────────────────────────────────
  const currentBoard = boards.find((b) => b.id === currentBoardId);

  return (
    <>
      {currentBoard
        ? <BoardPage board={currentBoard} />
        : <Dashboard onSelectBoard={(id) => setCurrentBoardId(id)} />
      }
      <PomodoroTimer />
    </>
  );
}
