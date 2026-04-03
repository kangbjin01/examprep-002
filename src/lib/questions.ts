import { pb } from "./pocketbase";
import type { Question, Exam } from "@/types";

// Cache questions locally after first fetch
let cachedQuestions: Question[] = [];

export async function fetchAllQuestions(): Promise<Question[]> {
  if (cachedQuestions.length > 0) return cachedQuestions;

  try {
    const records = await pb.collection("questions").getFullList({ sort: "exam,section,type" });
    cachedQuestions = records.map((r) => ({
      id: r.id,
      exam: r.exam as Exam,
      section: r.section,
      type: r.type,
      difficulty: r.difficulty as Question["difficulty"],
      passage: r.passage || undefined,
      question: r.question,
      choices: r.choices as string[],
      answer: r.answer,
      explanation: r.explanation,
      tags: (r.tags as string[]) || [],
      examSet: r.examSet || undefined,
      questionNumber: r.questionNumber || undefined,
    }));
    return cachedQuestions;
  } catch {
    // Fallback to local seed data if PocketBase is unavailable
    const seedData = await import("../../pocketbase/seed.json");
    cachedQuestions = seedData.questions.map((q, i) => ({
      ...q,
      id: `seed-${i}`,
      passage: q.passage ?? undefined,
      exam: q.exam as Exam,
      difficulty: q.difficulty as Question["difficulty"],
    }));
    return cachedQuestions;
  }
}

export function getQuestionsSync(): Question[] {
  return cachedQuestions;
}

export function getQuestionById(id: string): Question | undefined {
  return cachedQuestions.find((q) => q.id === id);
}

export function getQuestions(exam: string, section: string): Question[] {
  return cachedQuestions.filter((q) => {
    if (q.exam !== exam) return false;

    switch (section) {
      case "verbal-synonyms":
        return q.section === "verbal" && q.type === "synonym";
      case "verbal-analogies":
        return q.section === "verbal" && q.type === "analogy";
      case "reading":
        return q.section === "reading";
      case "english":
        return q.section === "english";
      case "reading-writing":
        return q.section === "reading-writing";
      default:
        return q.section === section;
    }
  });
}

export function getQuestionsByExamSet(examSet: string): Question[] {
  return cachedQuestions
    .filter((q) => q.examSet === examSet)
    .sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0));
}

export function getExamSets(exam: string): string[] {
  const sets = new Set<string>();
  cachedQuestions.forEach((q) => {
    if (q.exam === exam && q.examSet) {
      sets.add(q.examSet);
    }
  });
  return Array.from(sets).sort();
}

export function getSectionName(exam: string, section: string): string {
  const names: Record<string, Record<string, string>> = {
    ssat: {
      "verbal-synonyms": "SSAT Verbal - Synonyms",
      "verbal-analogies": "SSAT Verbal - Analogies",
      reading: "SSAT Reading Comprehension",
    },
    act: {
      english: "ACT English",
      reading: "ACT Reading",
    },
    sat: {
      "reading-writing": "SAT Reading & Writing",
    },
  };
  return names[exam]?.[section] ?? `${exam.toUpperCase()} ${section}`;
}
