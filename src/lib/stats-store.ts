import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AttemptRecord {
  questionId: string;
  exam: string;
  section: string;
  type: string;
  difficulty: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: number;
}

export interface BookmarkRecord {
  questionId: string;
  note: string;
  timestamp: number;
}

interface StatsState {
  attempts: AttemptRecord[];
  bookmarks: BookmarkRecord[];

  addAttempt: (record: AttemptRecord) => void;
  addBookmark: (questionId: string, note?: string) => void;
  removeBookmark: (questionId: string) => void;
  isBookmarked: (questionId: string) => boolean;
  getAccuracy: () => number;
  getAccuracyByExam: (exam: string) => number;
  getAccuracyBySection: (exam: string, section: string) => number;
  getRecentAttempts: (count: number) => AttemptRecord[];
  getWrongAttempts: () => AttemptRecord[];
  getStreak: () => number;
  getWeeklyTime: () => number;
}

export const useStats = create<StatsState>()(
  persist(
    (set, get) => ({
      attempts: [],
      bookmarks: [],

      addAttempt: (record) =>
        set((state) => ({ attempts: [...state.attempts, record] })),

      addBookmark: (questionId, note = "") =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks.filter((b) => b.questionId !== questionId),
            { questionId, note, timestamp: Date.now() },
          ],
        })),

      removeBookmark: (questionId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.questionId !== questionId),
        })),

      isBookmarked: (questionId) =>
        get().bookmarks.some((b) => b.questionId === questionId),

      getAccuracy: () => {
        const { attempts } = get();
        if (attempts.length === 0) return 0;
        return (
          (attempts.filter((a) => a.isCorrect).length / attempts.length) * 100
        );
      },

      getAccuracyByExam: (exam) => {
        const filtered = get().attempts.filter((a) => a.exam === exam);
        if (filtered.length === 0) return 0;
        return (
          (filtered.filter((a) => a.isCorrect).length / filtered.length) * 100
        );
      },

      getAccuracyBySection: (exam, section) => {
        const filtered = get().attempts.filter(
          (a) => a.exam === exam && a.section === section
        );
        if (filtered.length === 0) return 0;
        return (
          (filtered.filter((a) => a.isCorrect).length / filtered.length) * 100
        );
      },

      getRecentAttempts: (count) => {
        return [...get().attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, count);
      },

      getWrongAttempts: () => {
        return get().attempts.filter((a) => !a.isCorrect);
      },

      getStreak: () => {
        const { attempts } = get();
        if (attempts.length === 0) return 0;
        const days = new Set(
          attempts.map((a) =>
            new Date(a.timestamp).toISOString().slice(0, 10)
          )
        );
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          if (days.has(d.toISOString().slice(0, 10))) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      },

      getWeeklyTime: () => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return get()
          .attempts.filter((a) => a.timestamp >= weekAgo)
          .reduce((sum, a) => sum + a.timeSpent, 0);
      },
    }),
    { name: "examprep-stats" }
  )
);
