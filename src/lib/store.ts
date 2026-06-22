import { create } from 'zustand';

export interface Card {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  label?: string;
  priority?: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  cards?: Card[];
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  pattern?: string;
  emoji?: string;
  font_heading?: string;
  font_card?: string;
  font_body?: string;
  lists?: List[];
  created_at: string;
  updated_at: string;
}

interface BoardStore {
  boards: Board[];
  currentBoardId: string | null;
  setBoards: (boards: Board[]) => void;
  setCurrentBoardId: (id: string | null) => void;
  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  addList: (list: List) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  deleteList: (id: string) => void;
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, newListId: string, newPosition: number) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  currentBoardId: null,

  setBoards: (boards) => set({ boards }),
  setCurrentBoardId: (id) => set({ currentBoardId: id }),

  addBoard: (board) => set((state) => ({ boards: [...state.boards, board] })),

  updateBoard: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    })),

  addList: (list) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === list.board_id ? { ...b, lists: [...(b.lists || []), list] } : b
      ),
    })),

  updateList: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        lists: b.lists?.map((l) => (l.id === id ? { ...l, ...updates } : l)) || [],
      })),
    })),

  deleteList: (id) =>
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        lists: b.lists?.filter((l) => l.id !== id) || [],
      })),
    })),

  addCard: (card) =>
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        lists: b.lists?.map((l) =>
          l.id === card.list_id ? { ...l, cards: [...(l.cards || []), card] } : l
        ) || [],
      })),
    })),

  updateCard: (id, updates) =>
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        lists: b.lists?.map((l) => ({
          ...l,
          cards: l.cards?.map((c) => (c.id === id ? { ...c, ...updates } : c)) || [],
        })) || [],
      })),
    })),

  deleteCard: (id) =>
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        lists: b.lists?.map((l) => ({
          ...l,
          cards: l.cards?.filter((c) => c.id !== id) || [],
        })) || [],
      })),
    })),

  moveCard: (cardId, newListId, newPosition) =>
    set((state) => {
      const newBoards = state.boards.map((b) => {
        let card: Card | undefined;

        // Find and remove card from old list
        const updatedLists = b.lists?.map((l) => {
          const cards = l.cards?.filter((c) => {
            if (c.id === cardId) {
              card = c;
              return false;
            }
            return true;
          }) || [];
          return { ...l, cards };
        }) || [];

        // Add card to new list
        if (card) {
          const foundCard = card; // capture narrowed Card (not Card | undefined) for closure
          const finalLists = updatedLists.map((l) =>
            l.id === newListId
              ? {
                  ...l,
                  cards: [...(l.cards || []), { ...foundCard, list_id: newListId, position: newPosition }],
                }
              : l
          );
          return { ...b, lists: finalLists };
        }

        return { ...b, lists: updatedLists };
      });

      return { boards: newBoards };
    }),
}));
