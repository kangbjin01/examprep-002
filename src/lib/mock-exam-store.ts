import { create } from "zustand";
import type { Question } from "@/types";

interface MockExamState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>;
  eliminated: Record<number, number[]>;
  flagged: Set<number>;

  // Timer (stopwatch — counts up)
  timeElapsed: number; // seconds
  timerVisible: boolean;
  timerInterval: ReturnType<typeof setInterval> | null;
  isFinished: boolean;

  // Review
  showReview: boolean;

  // Actions
  startExam: (questions: Question[]) => void;
  goTo: (index: number) => void;
  goNext: () => void;
  goBack: () => void;
  selectAnswer: (choiceIndex: number) => void;
  toggleEliminate: (choiceIndex: number) => void;
  toggleFlag: () => void;
  toggleTimer: () => void;
  openReview: () => void;
  closeReview: () => void;
  submit: () => void;
  reset: () => void;
  tick: () => void;

  // Derived
  isAnswered: (index: number) => boolean;
  isFlagged: (index: number) => boolean;
  answeredCount: () => number;
  unansweredCount: () => number;
  getScore: () => { correct: number; total: number; percentage: number };
}

export const useMockExam = create<MockExamState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  eliminated: {},
  flagged: new Set(),
  timeElapsed: 0,
  timerVisible: true,
  timerInterval: null,
  isFinished: false,
  showReview: false,

  startExam: (questions) => {
    const prev = get().timerInterval;
    if (prev) clearInterval(prev);

    const interval = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      questions,
      currentIndex: 0,
      answers: {},
      eliminated: {},
      flagged: new Set(),
      timeElapsed: 0,
      timerVisible: true,
      timerInterval: interval,
      isFinished: false,
      showReview: false,
    });
  },

  tick: () => {
    set((s) => ({ timeElapsed: s.timeElapsed + 1 }));
  },

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
    const { currentIndex, answers, isFinished } = get();
    if (isFinished) return;
    set({ answers: { ...answers, [currentIndex]: choiceIndex } });
  },

  toggleEliminate: (choiceIndex) => {
    const { currentIndex, eliminated, isFinished } = get();
    if (isFinished) return;
    const current = eliminated[currentIndex] || [];
    const updated = current.includes(choiceIndex)
      ? current.filter((i) => i !== choiceIndex)
      : [...current, choiceIndex];
    set({ eliminated: { ...eliminated, [currentIndex]: updated } });
  },

  toggleFlag: () => {
    const { currentIndex, flagged } = get();
    const next = new Set(flagged);
    if (next.has(currentIndex)) next.delete(currentIndex);
    else next.add(currentIndex);
    set({ flagged: next });
  },

  toggleTimer: () => set((s) => ({ timerVisible: !s.timerVisible })),

  openReview: () => set({ showReview: true }),
  closeReview: () => set({ showReview: false }),

  submit: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({ isFinished: true, timerInterval: null, showReview: false });
  },

  reset: () => {
    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      eliminated: {},
      flagged: new Set(),
      timeElapsed: 0,
      timerVisible: true,
      timerInterval: null,
      isFinished: false,
      showReview: false,
    });
  },

  isAnswered: (index) => get().answers[index] !== undefined,
  isFlagged: (index) => get().flagged.has(index),

  answeredCount: () => Object.keys(get().answers).length,
  unansweredCount: () => get().questions.length - Object.keys(get().answers).length,

  getScore: () => {
    const { questions, answers } = get();
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  },
}));
