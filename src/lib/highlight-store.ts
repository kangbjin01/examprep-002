import { create } from "zustand";

export interface Highlight {
  id: string;
  questionId: string;
  color: 1 | 2 | 3;
  startOffset: number;
  endOffset: number;
  text: string;
  note: string;
}

interface HighlightState {
  highlights: Record<string, Highlight[]>; // questionId -> highlights
  addHighlight: (questionId: string, highlight: Omit<Highlight, "id">) => void;
  removeHighlight: (questionId: string, highlightId: string) => void;
  updateNote: (questionId: string, highlightId: string, note: string) => void;
  getHighlights: (questionId: string) => Highlight[];
}

let counter = 0;

export const useHighlights = create<HighlightState>((set, get) => ({
  highlights: {},

  addHighlight: (questionId, highlight) => {
    const id = `hl-${++counter}-${Date.now()}`;
    const entry: Highlight = { ...highlight, id };
    set((state) => ({
      highlights: {
        ...state.highlights,
        [questionId]: [...(state.highlights[questionId] || []), entry],
      },
    }));
  },

  removeHighlight: (questionId, highlightId) => {
    set((state) => ({
      highlights: {
        ...state.highlights,
        [questionId]: (state.highlights[questionId] || []).filter(
          (h) => h.id !== highlightId
        ),
      },
    }));
  },

  updateNote: (questionId, highlightId, note) => {
    set((state) => ({
      highlights: {
        ...state.highlights,
        [questionId]: (state.highlights[questionId] || []).map((h) =>
          h.id === highlightId ? { ...h, note } : h
        ),
      },
    }));
  },

  getHighlights: (questionId) => get().highlights[questionId] || [],
}));
