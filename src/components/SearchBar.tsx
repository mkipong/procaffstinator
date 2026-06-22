import React from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/lib/store';

interface SearchBarProps {
  cards: Card[];
  onSearch: (results: Card[]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ cards, onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      onSearch(cards);
      return;
    }

    const results = cards.filter((card) =>
      card.title.toLowerCase().includes(value.toLowerCase()) ||
      card.description?.toLowerCase().includes(value.toLowerCase())
    );
    onSearch(results);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search cards..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};
