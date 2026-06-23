'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

type AuthView = 'landing' | 'signin' | 'signup';

// ── Feature data ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '📋',
    title: 'Kanban Boards',
    desc: 'Visualise your work with drag-and-drop boards, lists, and cards. Move tasks across stages in seconds.',
  },
  {
    icon: '🍅',
    title: 'Pomodoro Timer',
    desc: 'Built-in focus timer with auto mode-switching. Stay in deep work for 25 minutes, then rest.',
  },
  {
    icon: '🎨',
    title: 'Custom Themes',
    desc: 'Pick from gradient colours, curated photo backgrounds, and overlay patterns to match your vibe.',
  },
  {
    icon: '📅',
    title: 'Due Dates & Priorities',
    desc: 'Set deadlines, mark tasks High / Medium / Low. Overdue cards turn red so nothing slips through.',
  },
  {
    icon: '💬',
    title: 'Card Comments',
    desc: 'Add notes, context, and updates directly on any card. Keep the conversation in one place.',
  },
  {
    icon: '☁️',
    title: 'Cloud Sync',
    desc: 'Your boards are saved to the cloud in real time. Open the app on any device and pick up where you left off.',
  },
];

const USE_CASES = [
  { emoji: '✈️', label: 'Travel Planning', desc: 'Itineraries, bookings, and packing lists — all in one board.' },
  { emoji: '💼', label: 'Work Projects',   desc: 'Manage tasks, track progress, and hit every deadline.' },
  { emoji: '📚', label: 'Study Plans',     desc: 'Break assignments into manageable cards and watch them move to Done.' },
  { emoji: '🏠', label: 'Home & Life',     desc: 'House chores, shopping, goals — your whole life, organised.' },
];

const STEPS = [
  { n: '1', title: 'Create a Board',   desc: 'Name your board and pick a background that matches the project mood.' },
  { n: '2', title: 'Add Lists & Cards', desc: 'Break your project into stages (To Do, In Progress, Done) and add tasks as cards.' },
  { n: '3', title: 'Drag & Get It Done', desc: 'Move cards between lists as you work, set priorities, and hit your goals.' },
];

// ── Auth form ────────────────────────────────────────────────────────────────────

const AuthForm: React.FC<{
  mode: 'signin' | 'signup';
  onBack: () => void;
  onSwitch: () => void;
}> = ({ mode, onBack, onSwitch }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/ProCaffstinator/12.png" alt="" className="w-20 h-20 mx-auto mb-3 object-contain drop-shadow-lg" />
          <h1 className="text-white font-bold text-3xl tracking-tight drop-shadow">ProCaffstinator</h1>
          <p className="text-white/60 text-sm mt-1">Procrastinate Productively</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 font-bold text-xl mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {mode === 'signin' ? 'Sign in to your workspace' : 'Get started for free — no card needed'}
          </p>

          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📧</div>
              <p className="text-sm text-gray-700 leading-relaxed">{success}</p>
              <button
                onClick={onSwitch}
                className="mt-5 text-purple-600 font-semibold text-sm hover:underline"
              >
                Go to Sign in →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Confirm password (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-colors"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <span className="text-base leading-none mt-0.5">⚠️</span>
                  <p className="text-xs leading-snug">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm mt-2"
              >
                {loading
                  ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                  : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>

              <p className="text-center text-sm text-gray-500 pt-1">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={onSwitch}
                  className="text-purple-600 font-semibold hover:underline"
                >
                  {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>

        <button
          onClick={onBack}
          className="block mx-auto text-center text-white/50 hover:text-white/80 text-xs mt-5 transition-colors"
        >
          ← Back to homepage
        </button>
      </div>
    </div>
  );
};

// ── Landing page ─────────────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('landing');

  if (view === 'signin') return <AuthForm mode="signin" onBack={() => setView('landing')} onSwitch={() => setView('signup')} />;
  if (view === 'signup') return <AuthForm mode="signup" onBack={() => setView('landing')} onSwitch={() => setView('signin')} />;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/branding/ProCaffstinator/12.png" alt="ProCaffstinator" className="h-11 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setView('signin')}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors px-3 py-1.5"
            >
              Sign in
            </button>
            <button
              onClick={() => setView('signup')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28 px-4"
        style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)' }}
      >
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/ProCaffstinator/12.png"
            alt="ProCaffstinator"
            className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 object-contain drop-shadow-2xl"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg mb-4">
            Procrastinate<br className="hidden sm:block" /> Productively
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            A beautiful Kanban workspace to organise your tasks, projects, and everything in between —
            with a built-in Pomodoro timer so you actually get things done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setView('signup')}
              className="bg-white text-purple-700 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => setView('signin')}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-base backdrop-blur-sm"
            >
              Sign in
            </button>
          </div>
          <p className="text-white/40 text-xs mt-5">No credit card required · Free to use</p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-purple-600 tracking-widest uppercase mb-3 bg-purple-50 px-3 py-1 rounded-full">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Everything you need to stay on top</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Built for people who want a simple, beautiful way to manage tasks without the corporate bloat.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-purple-600 tracking-widest uppercase mb-3 bg-purple-50 px-3 py-1 rounded-full">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg"
                  style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-purple-600 tracking-widest uppercase mb-3 bg-purple-50 px-3 py-1 rounded-full">Use Cases</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Works for everything you juggle</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((u) => (
              <div
                key={u.label}
                className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="text-4xl mb-3">{u.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">{u.label}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="py-20 px-4"
        style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed, #4338ca)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/ProCaffstinator/12.png" alt="" className="w-16 h-16 mx-auto mb-5 object-contain drop-shadow-xl" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to get (a little) more organised?
          </h2>
          <p className="text-white/70 mb-8 text-base">
            Join and start managing your tasks the way you actually think.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setView('signup')}
              className="bg-white text-purple-700 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base"
            >
              Create free account →
            </button>
            <button
              onClick={() => setView('signin')}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-base"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/branding/ProCaffstinator/12.png" alt="ProCaffstinator" className="h-8 w-auto object-contain opacity-60" />
          </div>
          <p className="text-gray-500 text-xs">Procrastinate Productively · Built with Next.js + Supabase</p>
          <div className="flex gap-4 text-xs">
            <button onClick={() => setView('signin')} className="hover:text-white transition-colors">Sign in</button>
            <button onClick={() => setView('signup')} className="hover:text-white transition-colors">Sign up</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
