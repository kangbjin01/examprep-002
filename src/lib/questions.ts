import seedData from "../../pocketbase/seed.json";
import type { Question, Exam } from "@/types";

// In MVP, load from local seed data.
// Later, replace with PocketBase API calls.
const allQuestions: Question[] = seedData.questions.map((q, i) => ({
  ...q,
  id: `seed-${i}`,
  passage: q.passage ?? undefined,
  exam: q.exam as Exam,
  difficulty: q.difficulty as Question["difficulty"],
}));

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function getQuestions(exam: string, section: string): Question[] {
  return allQuestions.filter((q) => {
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
      default:
        return false;
    }
  });
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
  };
  return names[exam]?.[section] ?? `${exam.toUpperCase()} ${section}`;
}
