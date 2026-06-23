import React, { useState } from 'react';
import { FlatIcon } from '@/components/FlatIcon';
import { List as ListType, Card as CardType, useBoardStore } from '@/lib/store';
import { Card } from './Card';
import { supabase } from '@/lib/supabase';
import { CardModal } from './CardModal';

interface ListProps {
  list: ListType;
  onEditCard: (card: CardType) => void;
  fontHeading?: string;
  fontCard?: string;
  fontBody?: string;
}

export const List: React.FC<ListProps> = ({ list, onEditCard, fontHeading, fontCard, fontBody }) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const addCard = useBoardStore((state) => state.addCard);
  const deleteList = useBoardStore((state) => state.deleteList);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const newCard: CardType = {
      id: Math.random().toString(36).substr(2, 9),
      list_id: list.id,
      title: newCardTitle,
      position: (list.cards?.length || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('cards').insert([newCard]);
    if (error) { alert(`Save failed: ${error.message}`); return; }
    addCard(newCard);
    setNewCardTitle('');
    setShowAddCard(false);
  };

  const handleDeleteList = async () => {
    if (window.confirm('Delete this list and all its cards?')) {
      await supabase.from('lists').delete().eq('id', list.id);
      deleteList(list.id);
    }
  };

  return (
    <>
      <div className="list bg-gray-100 rounded-lg p-3 min-h-96 w-[17rem] sm:w-80 flex-shrink-0 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: fontHeading }}>{list.title}</h2>
          <button
            onClick={handleDeleteList}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <FlatIcon name="trash" className="w-4 h-4 text-red-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-2">
          {list.cards?.map((card) => (
            <div key={card.id} onClick={() => setSelectedCard(card)}>
              <Card card={card} onEdit={onEditCard} fontCard={fontCard} fontBody={fontBody} />
            </div>
          ))}
        </div>

        {showAddCard ? (
          <form onSubmit={handleAddCard} className="mt-2">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="w-full px-3 py-2 rounded bg-white border border-gray-300 focus:outline-none focus:border-blue-500 text-sm mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            <FlatIcon name="add" className="w-4 h-4 text-gray-600" />
            Add a card
          </button>
        )}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={() => setSelectedCard(null)}
          fontCard={fontCard}
          fontBody={fontBody}
        />
      )}
    </>
  );
};
