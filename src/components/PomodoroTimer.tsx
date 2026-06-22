'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

type Mode = 'work' | 'short' | 'long';

const DURATIONS: Record<Mode, number> = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODE_LABEL: Record<Mode, string> = { work: 'Focus', short: 'Short Break', long: 'Long Break' };
const MODE_COLOR: Record<Mode, string> = { work: '#ef4444', short: '#22c55e', long: '#3b82f6' };
const MODE_BG: Record<Mode, string>    = { work: 'bg-red-50',   short: 'bg-green-50',  long: 'bg-blue-50' };
const MODE_TEXT: Record<Mode, string>  = { work: 'text-red-600', short: 'text-green-600', long: 'text-blue-600' };
const MODE_BTN: Record<Mode, string>   = { work: 'bg-red-500 hover:bg-red-600', short: 'bg-green-500 hover:bg-green-600', long: 'bg-blue-500 hover:bg-blue-600' };

const RADIUS = 54;
const CIRC   = 2 * Math.PI * RADIUS;

export const PomodoroTimer: React.FC = () => {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [count, setCount]     = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const switchMode = useCallback((m: Mode) => {
    stop();
    setMode(m);
    setTimeLeft(DURATIONS[m]);
    setRunning(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) { stop(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) return t - 1;
        stop();
        setRunning(false);
        if (mode === 'work') {
          setCount((c) => {
            const next = c + 1;
            setTimeout(() => switchMode(next % 4 === 0 ? 'long' : 'short'), 400);
            return next;
          });
        } else {
          setTimeout(() => switchMode('work'), 400);
        }
        return 0;
      });
    }, 1000);
    return stop;
  }, [running, mode, switchMode]);

  const mins   = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs   = String(timeLeft % 60).padStart(2, '0');
  const pct    = timeLeft / DURATIONS[mode];
  const offset = CIRC * (1 - pct);

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-3">

      {/* ── Expanded panel ── */}
      {open && (
        <div className="w-[min(18rem,calc(100vw-3.5rem))] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${MODE_BG[mode]} border-b`}>
            <div className="flex items-center gap-2">
              <span className="text-base">🍅</span>
              <span className={`font-bold text-sm ${MODE_TEXT[mode]}`}>Pomodoro Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <ChevronDown size={15} />
              </button>
              <button onClick={() => { setOpen(false); stop(); setRunning(false); }} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex border-b">
            {(['work', 'short', 'long'] as Mode[]).map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-[10px] font-semibold transition-colors ${
                  mode === m ? `border-b-2 border-current ${MODE_TEXT[m]} bg-gray-50` : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          {/* Timer face */}
          <div className="flex flex-col items-center py-5 gap-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="60" cy="60" r={RADIUS} fill="none"
                  stroke={MODE_COLOR[mode]} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold tabular-nums ${MODE_TEXT[mode]}`}>{mins}:{secs}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{MODE_LABEL[mode]}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setTimeLeft(DURATIONS[mode]); setRunning(false); }}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title="Reset"
              >
                <RotateCcw size={17} />
              </button>
              <button
                onClick={() => setRunning((v) => !v)}
                className={`w-14 h-14 rounded-full font-bold text-white shadow-md flex items-center justify-center transition-colors ${MODE_BTN[mode]}`}
              >
                {running ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div className="w-10" />
            </div>

            {/* Pomodoro dots + count */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i < (count % 4) ? 'bg-red-400' : 'bg-gray-200'
                }`} />
              ))}
              <span className="text-[10px] text-gray-400 ml-1.5">
                {count} pomodoro{count !== 1 ? 's' : ''} done
              </span>
            </div>

            {/* Custom durations hint */}
            <p className="text-[9px] text-gray-300 pb-1">Focus 25 · Short 5 · Long 15 min</p>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Minimise timer' : 'Open Pomodoro Timer'}
        className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          running
            ? 'bg-red-500 ring-2 ring-red-300 ring-offset-2'
            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
        }`}
      >
        {running ? (
          <span className="text-white text-[11px] font-bold tabular-nums leading-none">{mins}:{secs}</span>
        ) : (
          <span className="text-2xl leading-none">🍅</span>
        )}
        {/* Tiny up indicator when open */}
        {open && !running && (
          <ChevronUp size={10} className="absolute -top-0.5 text-gray-400" />
        )}
      </button>
    </div>
  );
};
