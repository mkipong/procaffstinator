import React, { useState } from 'react';
import { Trash2, MessageSquare, Calendar, Tag } from 'lucide-react';
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

function dueDateStyle(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 'bg-red-100 text-red-700';
  if (due.getTime() === today.getTime()) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

export const Card: React.FC<CardProps> = ({ card, onEdit, fontCard, fontBody }) => {
  const [isHovered, setIsHovered] = useState(false);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  const handleDelete = async () => {
    if (window.confirm('Delete this card?')) {
      await supabase.from('cards').delete().eq('id', card.id);
      deleteCard(card.id);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const priorityBadge = card.priority ? PRIORITY_BADGE[card.priority] : null;

  return (
    <div
      className="bg-white rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
    >
      {/* Priority strip at top */}
      {card.priority && (
        <div
          className={`-mx-3 -mt-3 mb-2 h-1 rounded-t-lg ${
            card.priority === 'high' ? 'bg-red-400' :
            card.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
          }`}
        />
      )}

      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 cursor-pointer" onClick={() => onEdit(card)}>
          <h3 className="font-semibold text-sm text-gray-900 mb-1" style={{ fontFamily: fontCard }}>{card.title}</h3>
          {card.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2" style={{ fontFamily: fontBody }}>{card.description}</p>
          )}
        </div>
        {isHovered && (
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-1">
        {priorityBadge && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityBadge.cls}`}>
            {priorityBadge.label}
          </span>
        )}
        {card.due_date && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${dueDateStyle(card.due_date)}`}>
            <Calendar size={11} />
            <span>{formatDate(card.due_date)}</span>
          </div>
        )}
        {card.label && (
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded text-xs text-blue-800">
            <Tag size={11} />
            <span>{card.label}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <MessageSquare size={11} />
        </div>
      </div>
    </div>
  );
};
