import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Exam, Difficulty } from "@/types";

// MVP: localStorage-based. Replace with PocketBase API later.

interface ClassRecord {
  id: string;
  name: string;
  exam: Exam | "both";
  description: string;
  inviteCode: string;
  isActive: boolean;
  created: string;
  studentCount: number;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  classId: string;
}

interface AssignmentRecord {
  id: string;
  classId: string;
  title: string;
  exam: Exam;
  section: string;
  difficulty: Difficulty | "mixed";
  questionCount: number;
  dueDate: string;
  status: "draft" | "assigned" | "closed";
  created: string;
}

interface SubmissionRecord {
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  completedAt?: string;
}

interface TeacherState {
  classes: ClassRecord[];
  students: StudentRecord[];
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];

  createClass: (name: string, exam: Exam | "both", description: string) => ClassRecord;
  deleteClass: (classId: string) => void;
  addStudent: (classId: string, name: string, email: string) => void;
  removeStudent: (classId: string, studentId: string) => void;
  createAssignment: (data: {
    classId: string;
    title: string;
    exam: Exam;
    section: string;
    difficulty: Difficulty | "mixed";
    questionCount: number;
    dueDate: string;
  }) => AssignmentRecord;
  closeAssignment: (assignmentId: string) => void;

  getClassById: (classId: string) => ClassRecord | undefined;
  getStudentsByClass: (classId: string) => StudentRecord[];
  getAssignmentsByClass: (classId: string) => AssignmentRecord[];
  getSubmissionsByAssignment: (assignmentId: string) => SubmissionRecord[];
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTeacher = create<TeacherState>()(
  persist(
    (set, get) => ({
      classes: [],
      students: [],
      assignments: [],
      submissions: [],

      createClass: (name, exam, description) => {
        const cls: ClassRecord = {
          id: generateId(),
          name,
          exam,
          description,
          inviteCode: generateCode(),
          isActive: true,
          created: new Date().toISOString(),
          studentCount: 0,
        };
        set((state) => ({ classes: [...state.classes, cls] }));
        return cls;
      },

      deleteClass: (classId) => {
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== classId),
          students: state.students.filter((s) => s.classId !== classId),
          assignments: state.assignments.filter((a) => a.classId !== classId),
        }));
      },

      addStudent: (classId, name, email) => {
        const student: StudentRecord = {
          id: generateId(),
          name,
          email,
          joinedAt: new Date().toISOString(),
          classId,
        };
        set((state) => ({
          students: [...state.students, student],
          classes: state.classes.map((c) =>
            c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c
          ),
        }));
      },

      removeStudent: (classId, studentId) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== studentId),
          classes: state.classes.map((c) =>
            c.id === classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c
          ),
        }));
      },

      createAssignment: (data) => {
        const assignment: AssignmentRecord = {
          id: generateId(),
          classId: data.classId,
          title: data.title,
          exam: data.exam,
          section: data.section,
          difficulty: data.difficulty,
          questionCount: data.questionCount,
          dueDate: data.dueDate,
          status: "assigned",
          created: new Date().toISOString(),
        };
        // Create submissions for all students in class
        const classStudents = get().students.filter((s) => s.classId === data.classId);
        const newSubs: SubmissionRecord[] = classStudents.map((s) => ({
          assignmentId: assignment.id,
          studentId: s.id,
          studentName: s.name,
          status: "not_started" as const,
          score: 0,
        }));
        set((state) => ({
          assignments: [...state.assignments, assignment],
          submissions: [...state.submissions, ...newSubs],
        }));
        return assignment;
      },

      closeAssignment: (assignmentId) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, status: "closed" as const } : a
          ),
        }));
      },

      getClassById: (classId) => get().classes.find((c) => c.id === classId),
      getStudentsByClass: (classId) => get().students.filter((s) => s.classId === classId),
      getAssignmentsByClass: (classId) => get().assignments.filter((a) => a.classId === classId),
      getSubmissionsByAssignment: (assignmentId) =>
        get().submissions.filter((s) => s.assignmentId === assignmentId),
    }),
    { name: "examprep-teacher" }
  )
);
