import React, { useState } from 'react';
import { MessageSquare, Tag } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FlatIcon } from '@/components/FlatIcon';
import { Card as CardType } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useBoardStore } from '@/lib/store';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  fontCard?: string;
  fontBody?: string;
}

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' },
  low:    { label: 'Low',    cls: 'bg-green-100 text-green-700' },
};

export const STATUS_CONFIG: Record<string, { label: string; cardBg: string; badge: string; strip: string }> = {
  not_started: { label: 'Not Started', cardBg: 'bg-white',    badge: 'bg-gray-100 text-gray-500',   strip: 'bg-gray-300'   },
  in_progress: { label: 'In Progress', cardBg: 'bg-blue-50',  badge: 'bg-blue-100 text-blue-700',   strip: 'bg-blue-400'   },
  on_hold:     { label: 'On Hold',     cardBg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', strip: 'bg-amber-400'  },
  blocked:     { label: 'Blocked',     cardBg: 'bg-red-50',   badge: 'bg-red-100 text-red-700',     strip: 'bg-red-400'    },
  cancelled:   { label: 'Cancelled',   cardBg: 'bg-gray-100', badge: 'bg-gray-200 text-gray-500',   strip: 'bg-gray-400'   },
  completed:   { label: 'Completed',   cardBg: 'bg-green-50', badge: 'bg-green-100 text-green-700', strip: 'bg-green-400'  },
};

function dueDateStyle(dateStr: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  if (due < today) return 'bg-red-100 text-red-700';
  if (due.getTime() === today.getTime()) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

export const Card: React.FC<CardProps> = ({ card, onEdit, fontCard, fontBody }) => {
  const [isHovered, setIsHovered] = useState(false);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: card.id, data: { type: 'card' } });

  const dragStyle = { transform: CSS.Transform.toString(transform), transition };

  const handleDelete = async () => {
    if (window.confirm('Delete this card?')) {
      await supabase.from('cards').delete().eq('id', card.id);
      deleteCard(card.id);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const priorityBadge = card.priority ? PRIORITY_BADGE[card.priority] : null;
  const statusCfg = card.status ? STATUS_CONFIG[card.status] : STATUS_CONFIG.not_started;
  const isCancelled = card.status === 'cancelled';
  const isCompleted = card.status === 'completed';
  const showProgress = typeof card.progress === 'number' && card.progress > 0;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
      className={`${statusCfg.cardBg} rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''} ${isCancelled ? 'opacity-60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status colour strip */}
      <div className={`-mx-3 -mt-3 mb-2 h-1 rounded-t-lg ${statusCfg.strip}`} />

      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 cursor-pointer" onClick={() => onEdit(card)}>
          <h3
            className={`font-semibold text-sm mb-1 ${isCancelled ? 'line-through text-gray-400' : isCompleted ? 'text-green-800' : 'text-gray-900'}`}
            style={{ fontFamily: fontCard }}
          >
            {card.title}
          </h3>
          {card.description && (
            <p className="text-xs text-gray-500 mb-1.5 line-clamp-2" style={{ fontFamily: fontBody }}>{card.description}</p>
          )}
        </div>
        {isHovered && (
          <button onClick={handleDelete} className="p-1 hover:bg-red-100 rounded transition-colors">
            <FlatIcon name="trash" className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-gray-400">Progress</span>
            <span className="text-[10px] font-semibold text-gray-600">{card.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${card.progress === 100 ? 'bg-green-500' : card.progress! >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
              style={{ width: `${card.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {/* Status badge — only show non-default statuses */}
        {card.status && card.status !== 'not_started' && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusCfg.badge}`}>
            {statusCfg.label}
          </span>
        )}
        {priorityBadge && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityBadge.cls}`}>
            {priorityBadge.label}
          </span>
        )}
        {card.due_date && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${dueDateStyle(card.due_date)}`}>
            <FlatIcon name="calendar" className="w-3 h-3" />
            <span>{formatDate(card.due_date)}</span>
          </div>
        )}
        {card.label && (
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded text-[10px] text-blue-800">
            <Tag size={10} />
            <span>{card.label}</span>
          </div>
        )}
        {card.recurring && card.recurring !== 'none' && (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
            ↻ {card.recurring}
          </span>
        )}
        <div className="ml-auto">
          <MessageSquare size={11} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};
