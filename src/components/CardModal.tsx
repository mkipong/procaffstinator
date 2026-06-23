import React, { useState } from 'react';
import { MessageSquare, Tag } from 'lucide-react';
import { FlatIcon } from '@/components/FlatIcon';
import { Card as CardType, useBoardStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface CardModalProps {
  card: CardType;
  onClose: () => void;
  onSave: (updated: CardType) => void;
  fontCard?: string;
  fontBody?: string;
}

interface Comment {
  id: string;
  text: string;
  created_at: string;
}

const PRIORITY_OPTIONS: { value: 'high' | 'medium' | 'low'; label: string; cls: string }[] = [
  { value: 'high',   label: 'High',   cls: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
  { value: 'medium', label: 'Medium', cls: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { value: 'low',    label: 'Low',    cls: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
];

const STATUS_OPTIONS: { value: CardType['status']; label: string; cls: string }[] = [
  { value: 'not_started', label: 'Not Started', cls: 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' },
  { value: 'in_progress', label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
  { value: 'on_hold',     label: 'On Hold',     cls: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' },
  { value: 'blocked',     label: 'Blocked',     cls: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
  { value: 'cancelled',   label: 'Cancelled',   cls: 'bg-gray-200 text-gray-500 border-gray-400 hover:bg-gray-300' },
  { value: 'completed',   label: 'Completed',   cls: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
];

const RECURRING_OPTIONS: { value: CardType['recurring']; label: string }[] = [
  { value: 'none',    label: 'None'    },
  { value: 'daily',   label: 'Daily'   },
  { value: 'weekly',  label: 'Weekly'  },
  { value: 'monthly', label: 'Monthly' },
];

function nextDueDate(current: string, recurring: string): string {
  const d = new Date(current);
  if (recurring === 'daily')   d.setDate(d.getDate() + 1);
  if (recurring === 'weekly')  d.setDate(d.getDate() + 7);
  if (recurring === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose, onSave, fontCard, fontBody }) => {
  const [title,       setTitle]       = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [label,       setLabel]       = useState(card.label || '');
  const [dueDate,     setDueDate]     = useState(card.due_date || '');
  const [priority,    setPriority]    = useState<'high' | 'medium' | 'low'>(card.priority || 'medium');
  const [status,      setStatus]      = useState<CardType['status']>(card.status || 'not_started');
  const [progress,    setProgress]    = useState<number>(card.progress ?? 0);
  const [recurring,   setRecurring]   = useState<CardType['recurring']>(card.recurring || 'none');
  const [newComment,  setNewComment]  = useState('');
  const [comments,    setComments]    = useState<Comment[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);

  const updateCard = useBoardStore((state) => state.updateCard);
  const addCard    = useBoardStore((state) => state.addCard);

  React.useEffect(() => {
    loadComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('card_id', card.id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsLoading(true);
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      card_id: card.id,
      text: newComment,
      created_at: new Date().toISOString(),
    };
    await supabase.from('comments').insert([comment]);
    setComments([...comments, comment as Comment]);
    setNewComment('');
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const updated: CardType = {
      ...card,
      title, description, label, priority, status, progress, recurring,
      due_date: dueDate || undefined,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('cards').update(updated).eq('id', card.id);
    updateCard(card.id, updated);

    // Recurring: completing a recurring card auto-spawns the next one
    const wasNotCompleted = card.status !== 'completed';
    if (status === 'completed' && wasNotCompleted && recurring !== 'none' && dueDate) {
      const nextCard: CardType = {
        id: Math.random().toString(36).substr(2, 9),
        list_id: card.list_id,
        title: card.title,
        description: card.description,
        position: card.position + 1,
        due_date: nextDueDate(dueDate, recurring!),
        label: card.label,
        priority: card.priority,
        status: 'not_started',
        progress: 0,
        recurring,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data } = await supabase.from('cards').insert([nextCard]).select();
      if (data?.[0]) addCard(data[0] as CardType);
    }

    onSave(updated);
    onClose();
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-w-2xl max-h-[92vh] sm:max-h-screen overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 sm:p-6 border-b bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Card Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FlatIcon name="cross" className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              style={{ fontFamily: fontCard }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              style={{ fontFamily: fontBody }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-colors ${opt.cls} ${
                    status === opt.value ? 'ring-2 ring-offset-1 ring-gray-500' : 'opacity-70'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FlatIcon name="exclamation" className="w-4 h-4 text-gray-500" />
              Priority
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${opt.cls} ${
                    priority === opt.value ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Progress — <span className="font-bold text-blue-600">{progress}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Due Date, Label, Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FlatIcon name="calendar" className="w-4 h-4 text-gray-500" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} />
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Bug, Feature, Urgent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ↻ Recurring Task
            </label>
            <div className="flex gap-2">
              {RECURRING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRecurring(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    recurring === opt.value
                      ? 'bg-purple-100 text-purple-700 border-purple-300 ring-2 ring-offset-1 ring-purple-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {recurring !== 'none' && dueDate && (
              <p className="text-xs text-purple-600 mt-1.5">
                When completed, a new card will auto-appear due {nextDueDate(dueDate, recurring!)}.
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MessageSquare size={16} />
              Comments ({comments.length})
            </h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet. Add one!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-900" style={{ fontFamily: fontBody }}>{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Post
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t pt-6">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
