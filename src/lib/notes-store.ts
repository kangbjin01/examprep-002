"use client";

import { create } from "zustand";
import { pb } from "./pocketbase";
import type { QuestionNote, ChoiceNote } from "@/types";

interface NotesState {
  // Question-level notes keyed by questionId: { student: note, teacher: note }
  questionNotes: Record<string, { student?: QuestionNote; teacher?: QuestionNote }>;

  // Choice-level notes keyed by `${questionId}-${choiceIndex}`: { student, teacher }
  choiceNotes: Record<string, { student?: ChoiceNote; teacher?: ChoiceNote }>;

  // Loading state
  loading: boolean;

  // Actions
  loadNotes: (questionId: string) => Promise<void>;
  saveQuestionNote: (questionId: string, content: string) => Promise<void>;
  deleteQuestionNote: (questionId: string) => Promise<void>;
  saveChoiceNote: (questionId: string, choiceIndex: number, content: string) => Promise<void>;
  deleteChoiceNote: (questionId: string, choiceIndex: number) => Promise<void>;
  reset: () => void;
}

function isTeacher(): boolean {
  return pb.authStore.record?.role === "teacher";
}

export const useNotes = create<NotesState>((set, get) => ({
  questionNotes: {},
  choiceNotes: {},
  loading: false,

  loadNotes: async (questionId) => {
    if (!pb.authStore.isValid) return;
    set({ loading: true });
    try {
      // Load question-level notes (my own + teacher notes)
      const qNotes = await pb.collection("question_notes").getFullList({
        filter: `question="${questionId}"`,
        expand: "user",
        sort: "-created",
      });

      const qNoteMap: { student?: QuestionNote; teacher?: QuestionNote } = {};
      for (const note of qNotes as unknown as QuestionNote[]) {
        if (note.isTeacherNote) qNoteMap.teacher = note;
        else if (note.user === pb.authStore.record?.id) qNoteMap.student = note;
      }

      // Load choice-level notes
      const cNotes = await pb.collection("choice_notes").getFullList({
        filter: `question="${questionId}"`,
        expand: "user",
        sort: "-created",
      });

      const cNoteMap: Record<string, { student?: ChoiceNote; teacher?: ChoiceNote }> = {};
      for (const note of cNotes as unknown as ChoiceNote[]) {
        const key = `${questionId}-${note.choiceIndex}`;
        if (!cNoteMap[key]) cNoteMap[key] = {};
        if (note.isTeacherNote) cNoteMap[key].teacher = note;
        else if (note.user === pb.authStore.record?.id) cNoteMap[key].student = note;
      }

      set((state) => ({
        questionNotes: { ...state.questionNotes, [questionId]: qNoteMap },
        choiceNotes: { ...state.choiceNotes, ...cNoteMap },
        loading: false,
      }));
    } catch (err) {
      console.error("Failed to load notes:", err);
      set({ loading: false });
    }
  },

  saveQuestionNote: async (questionId, content) => {
    if (!pb.authStore.isValid) return;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    const isT = isTeacher();
    const existing = get().questionNotes[questionId];
    const current = isT ? existing?.teacher : existing?.student;

    try {
      if (current) {
        // Update existing
        const updated = (await pb.collection("question_notes").update(current.id, {
          content,
        }, { expand: "user" })) as unknown as QuestionNote;
        set((state) => ({
          questionNotes: {
            ...state.questionNotes,
            [questionId]: {
              ...state.questionNotes[questionId],
              [isT ? "teacher" : "student"]: updated,
            },
          },
        }));
      } else {
        // Create new
        const created = (await pb.collection("question_notes").create({
          user: userId,
          question: questionId,
          content,
          isTeacherNote: isT,
        }, { expand: "user" })) as unknown as QuestionNote;
        set((state) => ({
          questionNotes: {
            ...state.questionNotes,
            [questionId]: {
              ...state.questionNotes[questionId],
              [isT ? "teacher" : "student"]: created,
            },
          },
        }));
      }
    } catch (err) {
      console.error("Failed to save question note:", err);
    }
  },

  deleteQuestionNote: async (questionId) => {
    if (!pb.authStore.isValid) return;
    const isT = isTeacher();
    const existing = get().questionNotes[questionId];
    const current = isT ? existing?.teacher : existing?.student;
    if (!current) return;

    try {
      await pb.collection("question_notes").delete(current.id);
      set((state) => {
        const map = { ...state.questionNotes[questionId] };
        delete map[isT ? "teacher" : "student"];
        return {
          questionNotes: { ...state.questionNotes, [questionId]: map },
        };
      });
    } catch (err) {
      console.error("Failed to delete question note:", err);
    }
  },

  saveChoiceNote: async (questionId, choiceIndex, content) => {
    if (!pb.authStore.isValid) return;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    const isT = isTeacher();
    const key = `${questionId}-${choiceIndex}`;
    const existing = get().choiceNotes[key];
    const current = isT ? existing?.teacher : existing?.student;

    try {
      if (current) {
        const updated = (await pb.collection("choice_notes").update(current.id, {
          content,
        }, { expand: "user" })) as unknown as ChoiceNote;
        set((state) => ({
          choiceNotes: {
            ...state.choiceNotes,
            [key]: {
              ...state.choiceNotes[key],
              [isT ? "teacher" : "student"]: updated,
            },
          },
        }));
      } else {
        const created = (await pb.collection("choice_notes").create({
          user: userId,
          question: questionId,
          choiceIndex,
          content,
          isTeacherNote: isT,
        }, { expand: "user" })) as unknown as ChoiceNote;
        set((state) => ({
          choiceNotes: {
            ...state.choiceNotes,
            [key]: {
              ...state.choiceNotes[key],
              [isT ? "teacher" : "student"]: created,
            },
          },
        }));
      }
    } catch (err) {
      console.error("Failed to save choice note:", err);
    }
  },

  deleteChoiceNote: async (questionId, choiceIndex) => {
    if (!pb.authStore.isValid) return;
    const isT = isTeacher();
    const key = `${questionId}-${choiceIndex}`;
    const existing = get().choiceNotes[key];
    const current = isT ? existing?.teacher : existing?.student;
    if (!current) return;

    try {
      await pb.collection("choice_notes").delete(current.id);
      set((state) => {
        const map = { ...state.choiceNotes[key] };
        delete map[isT ? "teacher" : "student"];
        return {
          choiceNotes: { ...state.choiceNotes, [key]: map },
        };
      });
    } catch (err) {
      console.error("Failed to delete choice note:", err);
    }
  },

  reset: () => set({ questionNotes: {}, choiceNotes: {}, loading: false }),
}));

export function useIsTeacher() {
  return pb.authStore.record?.role === "teacher";
}
