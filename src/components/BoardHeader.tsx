'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, AlignLeft, Type, Grid } from 'lucide-react';
import { FlatIcon } from '@/components/FlatIcon';
import { Board, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { PATTERNS, BILUM_PATTERN } from '@/lib/patterns';
import { EmojiIconPicker, EmojiDisplay } from '@/components/EmojiIconPicker';

interface BoardHeaderProps {
  board: Board;
  onAddList: () => void;
  onShowBoardList: () => void;
}

// ── Font registry ─────────────────────────────────────────────────────────────
// To add a DaFont font:
//  1. Place the .ttf/.otf file in /public/fonts/
//  2. Add a @font-face rule in globals.css
//  3. Add an entry here: { label: 'My Font', value: '"My Font", sans-serif' }
export const FONTS = [
  // ── Google Fonts ──────────────────────────────────────────────────────────
  { label: 'Inter',            value: 'Inter, sans-serif' },
  { label: 'Poppins',         value: 'Poppins, sans-serif' },
  { label: 'Montserrat',      value: 'Montserrat, sans-serif' },
  { label: 'Raleway',         value: 'Raleway, sans-serif' },
  { label: 'Nunito',          value: 'Nunito, sans-serif' },
  { label: 'Quicksand',       value: 'Quicksand, sans-serif' },
  { label: 'Josefin Sans',    value: '"Josefin Sans", sans-serif' },
  { label: 'Lato',            value: 'Lato, sans-serif' },
  { label: 'Playfair Display',value: '"Playfair Display", serif' },
  { label: 'Dancing Script',  value: '"Dancing Script", cursive' },
  // ── DaFont ────────────────────────────────────────────────────────────────
  { label: 'Anns Handwriting', value: '"Anns Handwriting", cursive' },
  { label: 'Autography',       value: 'Autography, cursive' },
  { label: 'Barbie Girl',      value: '"Barbie Girl", cursive' },
  { label: 'Barbie Mood',      value: '"Barbie Mood", cursive' },
  { label: 'Barbie Town',      value: '"Barbie Town", cursive' },
  { label: 'Bingtea',          value: 'Bingtea, cursive' },
  { label: 'Bright Aura',      value: '"Bright Aura", cursive' },
  { label: 'Cafe Coffee',      value: '"Cafe Coffee", cursive' },
  { label: 'Calligraphy',      value: 'Calligraphy, cursive' },
  { label: 'Cloudy Weather',   value: '"Cloudy Weather", cursive' },
  { label: 'Daddy',            value: 'Daddy, cursive' },
  { label: 'Diving Board',     value: '"Diving Board", cursive' },
  { label: 'Handwriting',      value: 'Handwriting, cursive' },
  { label: 'Happy Night',      value: '"Happy Night", cursive' },
  { label: 'Hawaii',           value: 'Hawaii, cursive' },
  { label: 'Homework',         value: 'Homework, cursive' },
  { label: 'Late Spring',      value: '"Late Spring", cursive' },
  { label: 'Midjourney',       value: 'Midjourney, sans-serif' },
  { label: 'Ocean',            value: 'Ocean, cursive' },
  { label: 'Photography',      value: 'Photography, cursive' },
  { label: 'Quick Stand',      value: '"Quick Stand", cursive' },
  { label: 'Rainbow Season',   value: '"Rainbow Season", cursive' },
  { label: 'Sand Beach',       value: '"Sand Beach", cursive' },
  { label: 'Simple Food',      value: '"Simple Food", cursive' },
  { label: 'Simple Mandala',   value: '"Simple Mandala", cursive' },
  { label: 'Sticky Paper',     value: '"Sticky Paper", cursive' },
  { label: 'Take Print',       value: '"Take Print", cursive' },
  { label: 'The Natures',      value: '"The Natures", cursive' },
  { label: 'The Smile',        value: '"The Smile", cursive' },
  { label: 'Toasty Milk',      value: '"Toasty Milk", cursive' },
  { label: 'Water Bubble',     value: '"Water Bubble", cursive' },
  { label: 'Wedding',          value: 'Wedding, cursive' },
];

export const DEFAULT_FONTS = {
  heading: 'Inter, sans-serif',
  card:    'Inter, sans-serif',
  body:    'Inter, sans-serif',
};

const COLORS = [
  { label: 'Purple',  value: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)' },
  { label: 'Blue',    value: 'linear-gradient(135deg, #3b82f6, #2563eb, #0891b2)' },
  { label: 'Green',   value: 'linear-gradient(135deg, #10b981, #16a34a, #0f766e)' },
  { label: 'Red',     value: 'linear-gradient(135deg, #f43f5e, #dc2626, #be185d)' },
  { label: 'Orange',  value: 'linear-gradient(135deg, #fb923c, #f97316, #dc2626)' },
  { label: 'Teal',    value: 'linear-gradient(135deg, #2dd4bf, #06b6d4, #3b82f6)' },
  { label: 'Slate',   value: 'linear-gradient(135deg, #64748b, #334155, #1e293b)' },
  { label: 'Indigo',  value: 'linear-gradient(135deg, #6366f1, #7c3aed, #a855f7)' },
];

const THEMES = [
  { label: 'Cherry Blossom',      value: 'linear-gradient(135deg, #FFD9DA, #EA638C, #89023E)', text: '#89023E' },
  { label: 'Cotton Candy Skies',  value: 'linear-gradient(135deg, #D782BA, #E18AD4, #EFC7E5)', text: '#3D2645' },
  { label: 'Earthy Tones',        value: 'linear-gradient(135deg, #2C6E49, #4C956C, #D68C45)', text: '#1a3d29' },
  { label: 'Gothic Glam',         value: 'linear-gradient(135deg, #1B2021, #3D2645, #832161)', text: '#DA4167' },
  { label: 'Soft Rainbow',        value: 'linear-gradient(135deg, #FBF8CC, #FFCFD2, #F1C0E8, #CFBAF0, #A3C4F3)', text: '#4a4a7a' },
  { label: 'Sunset Bliss',        value: 'linear-gradient(135deg, #FFBC42, #D81159, #8F2D56)', text: '#4a0a20' },
  { label: 'Velvet Plum',         value: 'linear-gradient(135deg, #25283D, #8F3985, #CEA2AC)', text: '#EFD9CE' },
];

type SettingsTab = 'background' | 'fonts' | 'board';

export const BoardHeader: React.FC<BoardHeaderProps> = ({ board, onAddList, onShowBoardList }) => {
  const [editingTitle, setEditingTitle]   = useState(false);
  const [newTitle, setNewTitle]           = useState(board.title);
  const [showSettings, setShowSettings]   = useState(false);
  const [settingsTab, setSettingsTab]     = useState<SettingsTab>('background');
  const [description, setDescription]    = useState(board.description || '');
  const settingsRef = useRef<HTMLDivElement>(null);

  const updateBoard       = useBoardStore((s) => s.updateBoard);
  const deleteBoard       = useBoardStore((s) => s.deleteBoard);
  const setCurrentBoardId = useBoardStore((s) => s.setCurrentBoardId);
  const boards            = useBoardStore((s) => s.boards);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleUpdateTitle = async () => {
    if (newTitle.trim() && newTitle !== board.title) {
      await supabase.from('boards').update({ title: newTitle }).eq('id', board.id);
      updateBoard(board.id, { title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    await supabase.from('boards').update({ description }).eq('id', board.id);
    updateBoard(board.id, { description });
  };

  const handleChangeColor = async (color: string) => {
    await supabase.from('boards').update({ color }).eq('id', board.id);
    updateBoard(board.id, { color });
  };

  const handleChangePattern = async (pattern: string) => {
    await supabase.from('boards').update({ pattern }).eq('id', board.id);
    updateBoard(board.id, { pattern });
  };

  const handleChangeEmoji = async (emoji: string) => {
    await supabase.from('boards').update({ emoji }).eq('id', board.id);
    updateBoard(board.id, { emoji });
  };

  const handleChangeFont = async (role: 'font_heading' | 'font_card' | 'font_body', value: string) => {
    await supabase.from('boards').update({ [role]: value }).eq('id', board.id);
    updateBoard(board.id, { [role]: value });
  };

  const handleDeleteBoard = async () => {
    if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return;
    await supabase.from('boards').delete().eq('id', board.id);
    deleteBoard(board.id);
    const remaining = boards.filter((b) => b.id !== board.id);
    setCurrentBoardId(remaining.length > 0 ? remaining[0].id : null);
    setShowSettings(false);
  };

  const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'background', label: 'Background', icon: <Palette size={13} /> },
    { key: 'fonts',      label: 'Fonts',      icon: <Type size={13} /> },
    { key: 'board',      label: 'Board',      icon: <AlignLeft size={13} /> },
  ];

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex justify-between items-center gap-2">

        {/* ── Left ── */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* App brand */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-gray-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icons8-kawaii-coffee-100.png" alt="ProCaffstinator" className="w-9 h-9 sm:w-8 sm:h-8" />
            <span className="font-bold text-gray-800 text-sm hidden md:block tracking-tight">ProCaffstinator</span>
          </div>

          {/* Home / dashboard button */}
          <button
            onClick={() => setCurrentBoardId(null)}
            title="Back to Dashboard"
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <FlatIcon name="home" className="w-5 h-5 opacity-60" />
          </button>

          <button onClick={onShowBoardList} className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <FlatIcon name="menu-burger" className="w-5 h-5 opacity-60" />
          </button>

          {editingTitle ? (
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-base sm:text-xl min-w-0 flex-1"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {board.emoji && <EmojiDisplay value={board.emoji} size={24} />}
              <h1
                onClick={() => setEditingTitle(true)}
                className="text-base sm:text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-xs md:max-w-none"
                style={{ fontFamily: board.font_heading || DEFAULT_FONTS.heading }}
              >
                {board.title}
              </h1>
            </div>
          )}
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full font-medium">
            <FlatIcon name="globe" className="w-3 h-3" />
            Saved to DB
          </span>

          <button
            onClick={onAddList}
            className="hidden sm:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FlatIcon name="add" className="w-5 h-5 invert" />
            Add List
          </button>

          {/* ── Logout ── */}
          <button
            onClick={() => supabase.auth.signOut()}
            title="Sign out"
            className="p-2.5 rounded-lg transition-colors hover:bg-gray-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <FlatIcon name="sign-out-alt" className="w-6 h-6 sm:w-5 sm:h-5 opacity-60" />
          </button>

          {/* ── Settings panel ── */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`p-2.5 rounded-lg transition-colors ${showSettings ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <FlatIcon name="settings" className="w-6 h-6 opacity-60" />
            </button>

            {showSettings && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 w-[min(24rem,calc(100vw-1rem))] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <span className="font-semibold text-gray-800 text-sm">Board Settings</span>
                  <button onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <FlatIcon name="cross" className="w-4 h-4 opacity-60" />
                  </button>
                </div>

                {/* Tab bar */}
                <div className="flex border-b">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSettingsTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                        settingsTab === tab.key
                          ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ─────────────── BACKGROUND TAB ─────────────── */}
                {settingsTab === 'background' && (
                  <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Solid Gradients */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Colors</p>
                      <div className="grid grid-cols-4 gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c.value}
                            title={c.label}
                            onClick={() => handleChangeColor(c.value)}
                            style={{ background: c.value }}
                            className={`h-10 rounded-lg transition-transform hover:scale-105 ${board.color === c.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Themed Palettes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Themes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {THEMES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => handleChangeColor(t.value)}
                            style={{ background: t.value }}
                            className={`h-14 rounded-xl flex items-end px-2 pb-1.5 transition-transform hover:scale-[1.03] ${board.color === t.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                          >
                            <span className="text-[10px] font-semibold leading-tight drop-shadow-sm" style={{ color: t.text }}>
                              {t.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Patterns — toggle + grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <Grid size={12} /> Patterns
                        </p>
                        {/* Toggle */}
                        <button
                          onClick={() => {
                            const off = board.pattern === 'none';
                            handleChangePattern(off ? BILUM_PATTERN : 'none');
                          }}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                            board.pattern !== 'none' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              board.pattern !== 'none' ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Grid only visible when patterns are ON */}
                      {board.pattern !== 'none' && (
                        <>
                          <div className="grid grid-cols-5 gap-2">
                            {PATTERNS.filter((p) => p.value !== 'none').map((p) => {
                              const isActive = board.pattern === p.value ||
                                (board.pattern === undefined && p.label === 'Bilum (PNG)');
                              return (
                                <button
                                  key={p.label}
                                  title={p.label}
                                  onClick={() => handleChangePattern(p.value)}
                                  className={`h-12 rounded-lg overflow-hidden transition-transform hover:scale-105 ${
                                    isActive ? 'ring-2 ring-offset-1 ring-gray-800' : ''
                                  }`}
                                  style={{
                                    backgroundImage: `${p.value}, linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)`,
                                  }}
                                />
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                            {PATTERNS.find((p) => p.value === board.pattern)?.label ?? 'Bilum (PNG)'}
                          </p>
                        </>
                      )}
                    </div>

                  </div>
                )}

                {/* ─────────────── FONTS TAB ─────────────── */}
                {settingsTab === 'fonts' && (
                  <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {(
                      [
                        { role: 'font_heading', label: 'Headings',   hint: 'Board title & list names',   current: board.font_heading || DEFAULT_FONTS.heading },
                        { role: 'font_card',    label: 'Card Titles', hint: 'Text on card face',         current: board.font_card    || DEFAULT_FONTS.card    },
                        { role: 'font_body',    label: 'Body Text',   hint: 'Descriptions & comments',   current: board.font_body    || DEFAULT_FONTS.body    },
                      ] as const
                    ).map(({ role, label, hint, current }) => (
                      <div key={role}>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700">{label}</span>
                          <span className="text-[10px] text-gray-400">{hint}</span>
                        </div>
                        <div className="relative">
                          <select
                            value={current}
                            onChange={(e) => handleChangeFont(role, e.target.value)}
                            className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
                            style={{ fontFamily: current }}
                          >
                            {FONTS.map((f) => (
                              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-500 truncate" style={{ fontFamily: current }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─────────────── BOARD TAB ─────────────── */}
                {settingsTab === 'board' && (
                  <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Emoji / Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-700">Board Icon</label>
                        {board.emoji && (
                          <button onClick={() => handleChangeEmoji('')}
                            className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                            Remove
                          </button>
                        )}
                      </div>
                      {board.emoji && (
                        <div className="flex justify-center mb-3">
                          <EmojiDisplay value={board.emoji} size={40} />
                        </div>
                      )}
                      <EmojiIconPicker value={board.emoji} onChange={handleChangeEmoji} />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Board Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleSaveDescription}
                        placeholder="Add a description for this board..."
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                      />
                    </div>

                    {/* Danger zone */}
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Danger Zone</p>
                      <button
                        onClick={handleDeleteBoard}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-sm font-medium"
                      >
                        <FlatIcon name="trash" className="w-4 h-4 opacity-70" />
                        Delete this board permanently
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
