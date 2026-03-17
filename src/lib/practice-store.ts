import { create } from "zustand";
import type { Question } from "@/types";

interface PracticeState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>; // questionIndex -> selectedAnswer
  eliminated: Record<number, number[]>; // questionIndex -> eliminated choice indices
  flagged: Set<number>; // questionIndex set
  revealed: Set<number>; // questionIndex set (practice mode: show answer)
  splitRatio: number; // left pane percentage (0-100)

  // Actions
  setQuestions: (questions: Question[]) => void;
  goTo: (index: number) => void;
  goNext: () => void;
  goBack: () => void;
  selectAnswer: (choiceIndex: number) => void;
  toggleEliminate: (choiceIndex: number) => void;
  toggleFlag: () => void;
  revealAnswer: () => void;
  setSplitRatio: (ratio: number) => void;
  reset: () => void;

  // Derived
  isAnswered: (index: number) => boolean;
  isFlagged: (index: number) => boolean;
  isRevealed: (index: number) => boolean;
}

export const usePractice = create<PracticeState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  eliminated: {},
  flagged: new Set(),
  revealed: new Set(),
  splitRatio: 50,

  setQuestions: (questions) =>
    set({
      questions,
      currentIndex: 0,
      answers: {},
      eliminated: {},
      flagged: new Set(),
      revealed: new Set(),
    }),

  goTo: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
    }
  },

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  goBack: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  selectAnswer: (choiceIndex) => {
    const { currentIndex, answers } = get();
    set({ answers: { ...answers, [currentIndex]: choiceIndex } });
  },

  toggleEliminate: (choiceIndex) => {
    const { currentIndex, eliminated } = get();
    const current = eliminated[currentIndex] || [];
    const updated = current.includes(choiceIndex)
      ? current.filter((i) => i !== choiceIndex)
      : [...current, choiceIndex];
    set({ eliminated: { ...eliminated, [currentIndex]: updated } });
  },

  toggleFlag: () => {
    const { currentIndex, flagged } = get();
    const next = new Set(flagged);
    if (next.has(currentIndex)) {
      next.delete(currentIndex);
    } else {
      next.add(currentIndex);
    }
    set({ flagged: next });
  },

  revealAnswer: () => {
    const { currentIndex, revealed } = get();
    const next = new Set(revealed);
    next.add(currentIndex);
    set({ revealed: next });
  },

  setSplitRatio: (ratio) => set({ splitRatio: Math.max(25, Math.min(75, ratio)) }),

  reset: () =>
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      eliminated: {},
      flagged: new Set(),
      revealed: new Set(),
    }),

  isAnswered: (index) => get().answers[index] !== undefined,
  isFlagged: (index) => get().flagged.has(index),
  isRevealed: (index) => get().revealed.has(index),
}));
