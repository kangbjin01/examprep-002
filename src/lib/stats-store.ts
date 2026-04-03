import { create } from "zustand";
import { pb } from "./pocketbase";

export interface AnswerChange {
  from: number;
  to: number;
  timestamp: number;
}

export interface PauseEvent {
  start: number;
  end: number;
}

export interface InactivityEvent {
  start: number;
  end: number;
  duration: number;
  questionId?: string;
}

export interface QuestionVisit {
  questionId: string;
  entryTimestamp: number;
  exitTimestamp: number;
  visitNumber: number;
}

export interface ChoiceHoverTimes {
  A: number;
  B: number;
  C: number;
  D: number;
}

export type ErrorType =
  | "careless"
  | "conceptual_gap"
  | "vocabulary"
  | "grammar_rule"
  | "misread_passage"
  | "time_pressure"
  | "trap_answer"
  | "elimination_failure"
  | "overthinking"
  | "";

export type DistractorType =
  | "opposite_meaning"
  | "partially_correct"
  | "out_of_scope"
  | "common_trap"
  | "";

export type AnswerChangeOutcome =
  | "changed_to_correct"
  | "changed_to_wrong"
  | "stayed_correct"
  | "stayed_wrong";

export interface AttemptRecord {
  id?: string;
  questionId: string;
  exam: string;
  section: string;
  type: string;
  difficulty: string;
  isCorrect: boolean;
  selectedAnswer: number;
  timeSpent: number;
  timestamp: number;
  // Session
  examSet?: string;
  mode?: "practice" | "mock";
  sessionId?: string;
  solveOrder?: number;
  // Behavior
  eliminated?: number[];
  flagged?: boolean;
  revealed?: boolean;
  isRetry?: boolean;
  answerChanges?: AnswerChange[];
  passageReadTime?: number;
  // SAT classification
  questionDomain?: string;
  skillTag?: string[];
  passageType?: string;
  moduleNumber?: number;
  // Session-level
  pauseEvents?: PauseEvent[];
  // Learning
  attemptNumber?: number;
  // Device
  deviceType?: string;
  // Error taxonomy
  errorType?: ErrorType;
  distractorChosen?: DistractorType;
  selfRatedConfidence?: number;
  // Post-answer behavior
  explanationReadTime?: number;
  passageRevisitedAfterReveal?: boolean;
  passageRevisitTimeAfterReveal?: number;
  // Navigation
  revisitCount?: number;
  skippedThenReturned?: boolean;
  navigationPattern?: string;
  questionVisitLog?: QuestionVisit[];
  timeRank?: number;
  // Fatigue
  inactivityEvents?: InactivityEvent[];
  // Micro-interactions
  choiceHoverTimes?: ChoiceHoverTimes;
  choiceSelectionOrder?: { choice: number; timestamp: number }[];
  highlightActions?: { text: string; timestamp: number }[];
  // Predictive
  answerChangeOutcome?: AnswerChangeOutcome;
  timeAllocationEfficiency?: number;
}

export interface BookmarkRecord {
  id?: string;
  questionId: string;
  note: string;
  timestamp: number;
}

let sessionCounter = 0;

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StatsState {
  attempts: AttemptRecord[];
  bookmarks: BookmarkRecord[];
  loaded: boolean;
  currentSessionId: string;

  loadFromPB: () => Promise<void>;
  startSession: () => string;
  addAttempt: (record: AttemptRecord) => Promise<void>;
  addBookmark: (questionId: string, note?: string) => Promise<void>;
  removeBookmark: (questionId: string) => Promise<void>;
  isBookmarked: (questionId: string) => boolean;
  getAccuracy: () => number;
  getAccuracyByExam: (exam: string) => number;
  getAccuracyBySection: (exam: string, section: string) => number;
  getRecentAttempts: (count: number) => AttemptRecord[];
  getWrongAttempts: () => AttemptRecord[];
  getStreak: () => number;
  getWeeklyTime: () => number;
}

export const useStats = create<StatsState>((set, get) => ({
  attempts: [],
  bookmarks: [],
  loaded: false,
  currentSessionId: generateSessionId(),

  loadFromPB: async () => {
    if (get().loaded || !pb.authStore.isValid) return;

    try {
      const userId = pb.authStore.record?.id;
      if (!userId) return;

      // Load attempts
      const attemptRecords = await pb.collection("attempts").getFullList({
        filter: `user = "${userId}"`,
        sort: "-created",
      });
      const attempts: AttemptRecord[] = attemptRecords.map((r) => ({
        id: r.id,
        questionId: r.question,
        exam: r.expand?.question?.exam || "",
        section: r.expand?.question?.section || "",
        type: r.expand?.question?.type || "",
        difficulty: r.expand?.question?.difficulty || "",
        isCorrect: r.isCorrect,
        selectedAnswer: r.selectedAnswer ?? -1,
        timeSpent: r.timeSpent || 0,
        timestamp: new Date(r.created).getTime(),
        examSet: r.examSet || "",
        mode: r.mode || undefined,
        sessionId: r.sessionId || "",
        flagged: r.flagged || false,
        isRetry: r.isRetry || false,
      }));

      // Load bookmarks
      const bookmarkRecords = await pb.collection("bookmarks").getFullList({
        filter: `user = "${userId}"`,
      });
      const bookmarks: BookmarkRecord[] = bookmarkRecords.map((r) => ({
        id: r.id,
        questionId: r.question,
        note: r.note || "",
        timestamp: new Date(r.created).getTime(),
      }));

      set({ attempts, bookmarks, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  startSession: () => {
    const sid = generateSessionId();
    sessionCounter = 0;
    set({ currentSessionId: sid });
    return sid;
  },

  addAttempt: async (record) => {
    // Check if this is a retry and count attempts
    const prevAttempts = get().attempts.filter(
      (a) => a.questionId === record.questionId
    );
    const isRetry = prevAttempts.length > 0;
    const attemptNumber = prevAttempts.length + 1;

    // Detect device type
    const deviceType = typeof window !== "undefined"
      ? window.innerWidth < 768 ? "phone" : window.innerWidth < 1024 ? "tablet" : "desktop"
      : "unknown";

    sessionCounter++;
    const enriched: AttemptRecord = {
      ...record,
      sessionId: record.sessionId || get().currentSessionId,
      solveOrder: record.solveOrder ?? sessionCounter,
      isRetry,
      attemptNumber,
      deviceType,
    };

    set((state) => ({ attempts: [...state.attempts, enriched] }));

    // Compute answer change outcome
    let answerChangeOutcome: AnswerChangeOutcome = "stayed_correct";
    const changes = record.answerChanges || [];
    if (changes.length > 0) {
      answerChangeOutcome = record.isCorrect ? "changed_to_correct" : "changed_to_wrong";
    } else {
      answerChangeOutcome = record.isCorrect ? "stayed_correct" : "stayed_wrong";
    }

    if (pb.authStore.isValid) {
      try {
        await pb.collection("attempts").create({
          user: pb.authStore.record?.id,
          question: record.questionId,
          selectedAnswer: record.selectedAnswer ?? -1,
          isCorrect: record.isCorrect,
          timeSpent: record.timeSpent,
          // Session
          examSet: record.examSet || "",
          mode: record.mode || "",
          sessionId: enriched.sessionId,
          solveOrder: enriched.solveOrder,
          // Behavior
          eliminated: record.eliminated || [],
          flagged: record.flagged || false,
          revealed: record.revealed || false,
          isRetry,
          answerChanges: record.answerChanges || [],
          passageReadTime: record.passageReadTime || 0,
          // SAT classification
          questionDomain: record.questionDomain || "",
          skillTag: record.skillTag || [],
          passageType: record.passageType || "",
          moduleNumber: record.moduleNumber || 0,
          // Session-level
          pauseEvents: record.pauseEvents || [],
          // Learning
          attemptNumber,
          deviceType,
          // Error taxonomy
          errorType: record.errorType || "",
          distractorChosen: record.distractorChosen || "",
          selfRatedConfidence: record.selfRatedConfidence || 0,
          // Post-answer
          explanationReadTime: record.explanationReadTime || 0,
          passageRevisitedAfterReveal: record.passageRevisitedAfterReveal || false,
          passageRevisitTimeAfterReveal: record.passageRevisitTimeAfterReveal || 0,
          // Navigation
          revisitCount: record.revisitCount || 0,
          skippedThenReturned: record.skippedThenReturned || false,
          navigationPattern: record.navigationPattern || "",
          questionVisitLog: record.questionVisitLog || [],
          timeRank: record.timeRank || 0,
          // Fatigue
          inactivityEvents: record.inactivityEvents || [],
          // Micro-interactions
          choiceHoverTimes: record.choiceHoverTimes || {},
          choiceSelectionOrder: record.choiceSelectionOrder || [],
          highlightActions: record.highlightActions || [],
          // Predictive
          answerChangeOutcome,
        });
      } catch {
        // Silent fail - local state is already updated
      }
    }
  },

  addBookmark: async (questionId, note = "") => {
    const bookmark: BookmarkRecord = { questionId, note, timestamp: Date.now() };
    set((state) => ({
      bookmarks: [
        ...state.bookmarks.filter((b) => b.questionId !== questionId),
        bookmark,
      ],
    }));

    if (pb.authStore.isValid) {
      try {
        const created = await pb.collection("bookmarks").create({
          user: pb.authStore.record?.id,
          question: questionId,
          note,
        });
        bookmark.id = created.id;
      } catch {
        // Silent fail
      }
    }
  },

  removeBookmark: async (questionId) => {
    const bookmark = get().bookmarks.find((b) => b.questionId === questionId);
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.questionId !== questionId),
    }));

    if (pb.authStore.isValid && bookmark?.id) {
      try {
        await pb.collection("bookmarks").delete(bookmark.id);
      } catch {
        // Silent fail
      }
    }
  },

  isBookmarked: (questionId) =>
    get().bookmarks.some((b) => b.questionId === questionId),

  getAccuracy: () => {
    const { attempts } = get();
    if (attempts.length === 0) return 0;
    return (attempts.filter((a) => a.isCorrect).length / attempts.length) * 100;
  },

  getAccuracyByExam: (exam) => {
    const filtered = get().attempts.filter((a) => a.exam === exam);
    if (filtered.length === 0) return 0;
    return (filtered.filter((a) => a.isCorrect).length / filtered.length) * 100;
  },

  getAccuracyBySection: (exam, section) => {
    const filtered = get().attempts.filter(
      (a) => a.exam === exam && a.section === section
    );
    if (filtered.length === 0) return 0;
    return (filtered.filter((a) => a.isCorrect).length / filtered.length) * 100;
  },

  getRecentAttempts: (count) =>
    [...get().attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, count),

  getWrongAttempts: () => get().attempts.filter((a) => !a.isCorrect),

  getStreak: () => {
    const { attempts } = get();
    if (attempts.length === 0) return 0;
    const days = new Set(
      attempts.map((a) => new Date(a.timestamp).toISOString().slice(0, 10))
    );
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().slice(0, 10))) streak++;
      else break;
    }
    return streak;
  },

  getWeeklyTime: () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return get()
      .attempts.filter((a) => a.timestamp >= weekAgo)
      .reduce((sum, a) => sum + a.timeSpent, 0);
  },
}));
