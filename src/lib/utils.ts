import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Question } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const QUESTION_PROMPT_PATTERNS = [
  /^(Which (?:choice|statement|finding)[\s\S]+)/,
  /^(Based on the texts?[\s\S]+)/,
  /^(What is the (?:main|most)[\s\S]+)/,
  /^(According to the [\s\S]+)/,
  /^(How would the author[\s\S]+)/,
  /^(The (?:main|primary) (?:purpose|function|idea)[\s\S]+)/,
  /^(If the (?:researcher|scientist|student|author)[\s\S]+)/,
];

export function splitPassageAndPrompt(question: Question): {
  passageText: string;
  promptText: string;
} {
  if (question.passage) {
    return { passageText: question.passage, promptText: question.question };
  }

  const text = question.question;
  const lines = text.split("\n");

  // Search line by line for a question prompt pattern
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const pattern of QUESTION_PROMPT_PATTERNS) {
      if (pattern.test(line)) {
        return {
          passageText: lines.slice(0, i).join("\n").trim(),
          promptText: lines.slice(i).join("\n").trim(),
        };
      }
    }
  }

  // Fallback: put everything as passage
  return { passageText: text, promptText: "" };
}
