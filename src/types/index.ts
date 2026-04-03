export type Exam = "ssat" | "act" | "sat";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  exam: Exam;
  section: string;
  type: string;
  difficulty: Difficulty;
  passage?: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  tags: string[];
  examSet?: string;
  questionNumber?: number;
}

export interface Attempt {
  id: string;
  user: string;
  question: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  created: string;
}

export interface Bookmark {
  id: string;
  user: string;
  question: string;
  note: string;
}

export interface MockExam {
  id: string;
  user: string;
  exam: Exam;
  status: "in_progress" | "completed";
  score: number;
  startedAt: string;
  completedAt?: string;
}

export type UserRole = "student" | "teacher";

export interface Class {
  id: string;
  teacher: string;
  name: string;
  exam: Exam | "both" | "all";
  description: string;
  inviteCode: string;
  isActive: boolean;
  created: string;
}

export interface ClassMember {
  id: string;
  class: string;
  student: string;
  joinedAt: string;
  status: "active" | "removed";
  expand?: {
    student?: { id: string; name: string; email: string };
  };
}

export interface Assignment {
  id: string;
  class: string;
  teacher: string;
  title: string;
  exam: Exam;
  section: string;
  difficulty: Difficulty | "mixed";
  questionCount: number;
  questions: string[];
  dueDate: string;
  status: "draft" | "assigned" | "closed";
  created: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment: string;
  student: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  correctCount: number;
  totalCount: number;
  startedAt?: string;
  completedAt?: string;
  expand?: {
    student?: { id: string; name: string; email: string };
  };
}
