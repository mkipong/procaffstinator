'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare, Clock, AlertTriangle, Zap,
  ArrowRight, Palette, Grid,
} from 'lucide-react';
import { FlatIcon } from '@/components/FlatIcon';
import { Board, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

import { BILUM_PATTERN, PATTERNS, BG_IMAGES, buildBackgroundStyle } from '@/lib/patterns';
import { EmojiDisplay } from '@/components/EmojiIconPicker';

// ── Dashboard appearance colours / themes (mirrors board settings) ────────────
const DASH_COLORS = [
  { label: 'Purple',  value: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)' },
  { label: 'Blue',    value: 'linear-gradient(135deg, #3b82f6, #2563eb, #0891b2)' },
  { label: 'Green',   value: 'linear-gradient(135deg, #10b981, #16a34a, #0f766e)' },
  { label: 'Red',     value: 'linear-gradient(135deg, #f43f5e, #dc2626, #be185d)' },
  { label: 'Orange',  value: 'linear-gradient(135deg, #fb923c, #f97316, #dc2626)' },
  { label: 'Teal',    value: 'linear-gradient(135deg, #2dd4bf, #06b6d4, #3b82f6)' },
  { label: 'Slate',   value: 'linear-gradient(135deg, #64748b, #334155, #1e293b)' },
  { label: 'Indigo',  value: 'linear-gradient(135deg, #6366f1, #7c3aed, #a855f7)' },
];

const DASH_THEMES = [
  { label: 'Cherry Blossom',     value: 'linear-gradient(135deg, #FFD9DA, #EA638C, #89023E)', text: '#89023E' },
  { label: 'Cotton Candy Skies', value: 'linear-gradient(135deg, #D782BA, #E18AD4, #EFC7E5)', text: '#3D2645' },
  { label: 'Earthy Tones',       value: 'linear-gradient(135deg, #2C6E49, #4C956C, #D68C45)', text: '#1a3d29' },
  { label: 'Gothic Glam',        value: 'linear-gradient(135deg, #1B2021, #3D2645, #832161)', text: '#DA4167' },
  { label: 'Soft Rainbow',       value: 'linear-gradient(135deg, #FBF8CC, #FFCFD2, #F1C0E8, #CFBAF0, #A3C4F3)', text: '#4a4a7a' },
  { label: 'Sunset Bliss',       value: 'linear-gradient(135deg, #FFBC42, #D81159, #8F2D56)', text: '#4a0a20' },
  { label: 'Velvet Plum',        value: 'linear-gradient(135deg, #25283D, #8F3985, #CEA2AC)', text: '#EFD9CE' },
];

// ── localStorage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = 'procaff_dashboard';

interface DashSettings {
  color: string;
  pattern: string; // 'none' | data URL
}

function loadDashSettings(): DashSettings {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    color:   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pattern: BILUM_PATTERN,
  };
}

function saveDashSettings(s: DashSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
      <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm flex-shrink-0">
        <FlatIcon name={icon} className="w-9 h-9 sm:w-7 sm:h-7 text-gray-600" />
      </div>
      <div>
        <p className="text-3xl sm:text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function BoardCard({ stat, onClick }: { stat: BoardStat; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-left h-44"
      style={buildBackgroundStyle(stat.color, stat.pattern)}
    >
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
      <div className="relative h-full p-5 flex flex-col justify-between">
        <div>
          {stat.emoji && <div className="mb-1.5"><EmojiDisplay value={stat.emoji} size={26} /></div>}
          <p className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow">{stat.title}</p>
          <p className="text-white/70 text-xs mt-1">{stat.listCount} {stat.listCount === 1 ? 'list' : 'lists'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <CheckSquare size={10} /> {stat.totalCards} task{stat.totalCards !== 1 ? 's' : ''}
          </span>
          {stat.overdueCards > 0 && (
            <span className="flex items-center gap-1 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full">
              <AlertTriangle size={10} /> {stat.overdueCards} overdue
            </span>
          )}
          {stat.dueToday > 0 && (
            <span className="flex items-center gap-1 bg-amber-400/80 text-white text-xs px-2 py-1 rounded-full">
              <Clock size={10} /> {stat.dueToday} today
            </span>
          )}
          {stat.highPriority > 0 && (
            <span className="flex items-center gap-1 bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
              <Zap size={10} /> {stat.highPriority} urgent
            </span>
          )}
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={18} className="text-white drop-shadow" />
      </div>
    </button>
  );
}

const QUICK_EMOJIS = ['⭐','💼','📚','🎨','🏠','💪','✈️','🎯','🔥','❤️','🚀','🎉'];

interface BoardStat {
  id: string; title: string; color: string; pattern?: string; emoji?: string;
  listCount: number; totalCards: number; overdueCards: number; dueToday: number; highPriority: number;
}

interface DashboardProps {
  onSelectBoard: (id: string) => void;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ onSelectBoard }) => {
  const boards            = useBoardStore((s) => s.boards);
  const addBoard          = useBoardStore((s) => s.addBoard);
  const setCurrentBoardId = useBoardStore((s) => s.setCurrentBoardId);

  const [showForm, setShowForm]         = useState(false);
  const [title, setTitle]               = useState('');
  const [newEmoji, setNewEmoji]         = useState('');
  const [saving, setSaving]             = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dashSettings, setDashSettings] = useState<DashSettings>(loadDashSettings);
  const inputRef    = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (showForm) inputRef.current?.focus(); }, [showForm]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateDash = (updates: Partial<DashSettings>) => {
    const next = { ...dashSettings, ...updates };
    setDashSettings(next);
    saveDashSettings(next);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const boardStats: BoardStat[] = boards.map((board) => {
    const cards = board.lists?.flatMap((l) => l.cards || []) || [];
    return {
      id: board.id, title: board.title, color: board.color, pattern: board.pattern, emoji: board.emoji,
      listCount: board.lists?.length || 0,
      totalCards: cards.length,
      overdueCards: cards.filter((c) => c.due_date && c.due_date < todayStr).length,
      dueToday:     cards.filter((c) => c.due_date === todayStr).length,
      highPriority: cards.filter((c) => c.priority === 'high').length,
    };
  });

  const totals = boardStats.reduce(
    (acc, b) => ({ tasks: acc.tasks + b.totalCards, overdue: acc.overdue + b.overdueCards, dueToday: acc.dueToday + b.dueToday, high: acc.high + b.highPriority }),
    { tasks: 0, overdue: 0, dueToday: 0, high: 0 }
  );

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    const newBoard: Board = {
      id: Math.random().toString(36).substr(2, 9),
      title: t,
      color: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)',
      emoji: newEmoji || undefined,
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
    onSelectBoard(newBoard.id);
    setNewEmoji('');
  };

  const patternOn = dashSettings.pattern !== 'none';

  return (
    <div
      className="min-h-screen"
      style={buildBackgroundStyle(dashSettings.color, dashSettings.pattern)}
    >
      {/* ── Top nav ── */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icons8-kawaii-coffee-100.png" alt="" className="w-10 h-10 sm:w-9 sm:h-9 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900 leading-tight text-sm sm:text-base">ProCaffstinator</p>
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">Procrastinate Productively</p>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-gray-500 mr-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icons8-kawaii-folders-100.png" alt="" className="w-5 h-5 object-contain" />
              <span className="text-sm font-medium text-gray-600">Dashboard</span>
            </div>

            {/* ── Logout ── */}
            <button
              onClick={() => supabase.auth.signOut()}
              title="Sign out"
              className="p-2.5 rounded-lg transition-colors hover:bg-gray-100"
            >
              <FlatIcon name="sign-out-alt" className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400" />
            </button>

            {/* ── Settings gear ── */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`p-2.5 rounded-lg transition-colors ${showSettings ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <FlatIcon name="settings" className="w-7 h-7 sm:w-6 sm:h-6 text-gray-600" />
              </button>

              {showSettings && (
                <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-1rem))] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <span className="font-semibold text-gray-800 text-sm">Dashboard Settings</span>
                    <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <FlatIcon name="cross" className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Colors */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <Palette size={12} /> Background Color
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {DASH_COLORS.map((c) => (
                          <button
                            key={c.value}
                            title={c.label}
                            onClick={() => updateDash({ color: c.value })}
                            style={{ background: c.value }}
                            className={`h-10 rounded-lg transition-transform hover:scale-105 ${dashSettings.color === c.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Themes */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <Palette size={12} /> Themes
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {DASH_THEMES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => updateDash({ color: t.value })}
                            style={{ background: t.value }}
                            className={`h-14 rounded-xl flex items-end px-2 pb-1.5 transition-transform hover:scale-[1.03] ${dashSettings.color === t.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                          >
                            <span className="text-[10px] font-semibold leading-tight drop-shadow-sm" style={{ color: t.text }}>
                              {t.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Photos */}
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Photos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {BG_IMAGES.map((img) => {
                          const val = `url('${img.src}')`;
                          return (
                            <button
                              key={img.src}
                              title={img.label}
                              onClick={() => updateDash({ color: val })}
                              className={`h-16 rounded-lg overflow-hidden transition-transform hover:scale-105 ${dashSettings.color === val ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                              style={{ backgroundImage: `url('${img.src}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Patterns toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <Grid size={12} /> Patterns
                        </p>
                        <button
                          onClick={() => updateDash({ pattern: patternOn ? 'none' : BILUM_PATTERN })}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${patternOn ? 'bg-blue-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${patternOn ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </div>

                      {patternOn && (
                        <>
                          <div className="grid grid-cols-5 gap-2">
                            {PATTERNS.filter((p) => p.value !== 'none').map((p) => {
                              const isActive = dashSettings.pattern === p.value ||
                                (dashSettings.pattern === BILUM_PATTERN && p.label === 'Bilum (PNG)');
                              return (
                                <button
                                  key={p.label}
                                  title={p.label}
                                  onClick={() => updateDash({ pattern: p.value })}
                                  className={`h-12 rounded-lg overflow-hidden transition-transform hover:scale-105 ${isActive ? 'ring-2 ring-offset-1 ring-gray-800' : ''}`}
                                  style={{ backgroundImage: `${p.value}, ${dashSettings.color}` }}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                            {PATTERNS.find((p) => p.value === dashSettings.pattern)?.label ?? 'Bilum (PNG)'}
                          </p>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon="star"         label="Total Tasks"   value={totals.tasks}   />
          <StatCard icon="alarm-clock" label="Due Today"     value={totals.dueToday} />
          <StatCard icon="exclamation" label="Overdue"       value={totals.overdue}  />
          <StatCard icon="bolt"        label="High Priority" value={totals.high}     />
        </div>

        {/* Boards heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-xl drop-shadow">
            Your Boards
            <span className="ml-2 text-sm font-normal text-white/60">{boards.length} board{boards.length !== 1 ? 's' : ''}</span>
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors backdrop-blur-sm"
            >
              <FlatIcon name="add" className="w-4 h-4 text-white" />
              New Board
            </button>
          )}
        </div>

        {/* Board grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boardStats.map((b) => (
            <BoardCard key={b.id} stat={b} onClick={() => onSelectBoard(b.id)} />
          ))}

          {showForm ? (
            <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-5 flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">New Board</p>
                <button onClick={() => { setShowForm(false); setTitle(''); setNewEmoji(''); }}
                  className="p-1 text-white/60 hover:text-white rounded-lg transition-colors">
                  <FlatIcon name="cross" className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Quick emoji row */}
              <div className="flex gap-1 flex-wrap">
                {QUICK_EMOJIS.map((e) => (
                  <button key={e} onClick={() => setNewEmoji(newEmoji === e ? '' : e)}
                    className={`text-lg p-1 rounded-lg transition-colors ${
                      newEmoji === e ? 'bg-white/40 ring-1 ring-white' : 'hover:bg-white/20'
                    }`}
                  >{e}</button>
                ))}
              </div>

              {/* Name input with emoji preview */}
              <div className="flex items-center gap-2">
                {newEmoji && <span className="text-xl flex-shrink-0">{newEmoji}</span>}
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setShowForm(false); setTitle(''); setNewEmoji(''); }
                  }}
                  placeholder="Board name..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-gray-400"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={saving || !title.trim()}
                className="w-full bg-white text-purple-700 font-semibold text-sm py-2 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating…' : 'Create Board'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl border-2 border-dashed border-white/40 hover:border-white/70 hover:bg-white/10 transition-all h-44 flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white/90"
            >
              <FlatIcon name="add" className="w-8 h-8 text-white/60 group-hover:text-white/90" />
              <span className="text-sm font-medium">New Board</span>
            </button>
          )}
        </div>

        {boards.length === 0 && !showForm && (
          <div className="text-center py-16">
            <p className="text-white/70 text-lg mb-2">No boards yet</p>
            <p className="text-white/50 text-sm">Click &quot;New Board&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
