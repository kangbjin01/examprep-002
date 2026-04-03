import { create } from "zustand";
import { pb } from "./pocketbase";
import type { Exam, Difficulty } from "@/types";

interface ClassRecord {
  id: string;
  name: string;
  exam: Exam | "both" | "all";
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
  id?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  completedAt?: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface TeacherState {
  classes: ClassRecord[];
  students: StudentRecord[];
  assignments: AssignmentRecord[];
  submissions: SubmissionRecord[];
  loaded: boolean;

  loadFromPB: () => Promise<void>;
  createClass: (name: string, exam: Exam | "both" | "all", description: string) => Promise<ClassRecord>;
  deleteClass: (classId: string) => Promise<void>;
  addStudent: (classId: string, name: string, email: string) => Promise<void>;
  removeStudent: (classId: string, studentId: string) => Promise<void>;
  createAssignment: (data: {
    classId: string;
    title: string;
    exam: Exam;
    section: string;
    difficulty: Difficulty | "mixed";
    questionCount: number;
    dueDate: string;
  }) => Promise<AssignmentRecord>;
  closeAssignment: (assignmentId: string) => Promise<void>;

  getClassById: (classId: string) => ClassRecord | undefined;
  getStudentsByClass: (classId: string) => StudentRecord[];
  getAssignmentsByClass: (classId: string) => AssignmentRecord[];
  getSubmissionsByAssignment: (assignmentId: string) => SubmissionRecord[];
}

export const useTeacher = create<TeacherState>((set, get) => ({
  classes: [],
  students: [],
  assignments: [],
  submissions: [],
  loaded: false,

  loadFromPB: async () => {
    if (get().loaded || !pb.authStore.isValid) return;
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    try {
      // Load classes
      const classRecords = await pb.collection("classes").getFullList({
        filter: `teacher = "${userId}"`,
      });

      const classes: ClassRecord[] = [];
      const allStudents: StudentRecord[] = [];
      const allAssignments: AssignmentRecord[] = [];
      const allSubmissions: SubmissionRecord[] = [];

      for (const c of classRecords) {
        // Count members
        const members = await pb.collection("class_members").getFullList({
          filter: `class = "${c.id}" && status = "active"`,
          expand: "student",
        });

        classes.push({
          id: c.id,
          name: c.name,
          exam: c.exam,
          description: c.description || "",
          inviteCode: c.inviteCode,
          isActive: c.isActive ?? true,
          created: c.created,
          studentCount: members.length,
        });

        for (const m of members) {
          const s = m.expand?.student;
          if (s) {
            allStudents.push({
              id: s.id,
              name: s.name || s.email,
              email: s.email,
              joinedAt: m.created,
              classId: c.id,
            });
          }
        }

        // Load assignments
        const assignmentRecords = await pb.collection("assignments").getFullList({
          filter: `class = "${c.id}"`,
          sort: "-created",
        });

        for (const a of assignmentRecords) {
          allAssignments.push({
            id: a.id,
            classId: c.id,
            title: a.title,
            exam: a.exam,
            section: a.section,
            difficulty: a.difficulty,
            questionCount: a.questionCount,
            dueDate: a.dueDate,
            status: a.status,
            created: a.created,
          });

          // Load submissions
          const subRecords = await pb.collection("assignment_submissions").getFullList({
            filter: `assignment = "${a.id}"`,
            expand: "student",
          });

          for (const sub of subRecords) {
            allSubmissions.push({
              id: sub.id,
              assignmentId: a.id,
              studentId: sub.student,
              studentName: sub.expand?.student?.name || sub.expand?.student?.email || "",
              status: sub.status,
              score: sub.score || 0,
              completedAt: sub.completedAt,
            });
          }
        }
      }

      set({
        classes,
        students: allStudents,
        assignments: allAssignments,
        submissions: allSubmissions,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  createClass: async (name, exam: Exam | "both" | "all", description) => {
    const inviteCode = generateCode();
    const cls: ClassRecord = {
      id: "",
      name,
      exam,
      description,
      inviteCode,
      isActive: true,
      created: new Date().toISOString(),
      studentCount: 0,
    };

    if (pb.authStore.isValid) {
      try {
        const created = await pb.collection("classes").create({
          teacher: pb.authStore.record?.id,
          name,
          exam,
          description,
          inviteCode,
          isActive: true,
        });
        cls.id = created.id;
        cls.created = created.created;
      } catch {
        cls.id = `local-${Date.now()}`;
      }
    } else {
      cls.id = `local-${Date.now()}`;
    }

    set((state) => ({ classes: [...state.classes, cls] }));
    return cls;
  },

  deleteClass: async (classId) => {
    set((state) => ({
      classes: state.classes.filter((c) => c.id !== classId),
      students: state.students.filter((s) => s.classId !== classId),
      assignments: state.assignments.filter((a) => a.classId !== classId),
    }));

    if (pb.authStore.isValid && !classId.startsWith("local-")) {
      try {
        await pb.collection("classes").delete(classId);
      } catch { /* silent */ }
    }
  },

  addStudent: async (classId, name, email) => {
    // In production, student joins via invite code. This is for manual add.
    const student: StudentRecord = {
      id: `manual-${Date.now()}`,
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

  removeStudent: async (classId, studentId) => {
    set((state) => ({
      students: state.students.filter((s) => s.id !== studentId),
      classes: state.classes.map((c) =>
        c.id === classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c
      ),
    }));

    if (pb.authStore.isValid && !studentId.startsWith("manual-")) {
      try {
        // Find and update class_member status
        const members = await pb.collection("class_members").getFullList({
          filter: `class = "${classId}" && student = "${studentId}"`,
        });
        for (const m of members) {
          await pb.collection("class_members").update(m.id, { status: "removed" });
        }
      } catch { /* silent */ }
    }
  },

  createAssignment: async (data) => {
    const assignment: AssignmentRecord = {
      id: "",
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

    if (pb.authStore.isValid && !data.classId.startsWith("local-")) {
      try {
        const created = await pb.collection("assignments").create({
          class: data.classId,
          teacher: pb.authStore.record?.id,
          title: data.title,
          exam: data.exam,
          section: data.section,
          difficulty: data.difficulty,
          questionCount: data.questionCount,
          dueDate: data.dueDate,
          status: "assigned",
        });
        assignment.id = created.id;
        assignment.created = created.created;

        // Create submissions for all students
        const students = get().students.filter((s) => s.classId === data.classId);
        const newSubs: SubmissionRecord[] = [];
        for (const s of students) {
          if (!s.id.startsWith("manual-")) {
            const sub = await pb.collection("assignment_submissions").create({
              assignment: assignment.id,
              student: s.id,
              status: "not_started",
              score: 0,
              correctCount: 0,
              totalCount: data.questionCount,
            });
            newSubs.push({
              id: sub.id,
              assignmentId: assignment.id,
              studentId: s.id,
              studentName: s.name,
              status: "not_started",
              score: 0,
            });
          }
        }

        set((state) => ({
          assignments: [...state.assignments, assignment],
          submissions: [...state.submissions, ...newSubs],
        }));
        return assignment;
      } catch { /* fall through to local */ }
    }

    assignment.id = `local-${Date.now()}`;
    const students = get().students.filter((s) => s.classId === data.classId);
    const newSubs: SubmissionRecord[] = students.map((s) => ({
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

  closeAssignment: async (assignmentId) => {
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === assignmentId ? { ...a, status: "closed" as const } : a
      ),
    }));

    if (pb.authStore.isValid && !assignmentId.startsWith("local-")) {
      try {
        await pb.collection("assignments").update(assignmentId, { status: "closed" });
      } catch { /* silent */ }
    }
  },

  getClassById: (classId) => get().classes.find((c) => c.id === classId),
  getStudentsByClass: (classId) => get().students.filter((s) => s.classId === classId),
  getAssignmentsByClass: (classId) => get().assignments.filter((a) => a.classId === classId),
  getSubmissionsByAssignment: (assignmentId) =>
    get().submissions.filter((s) => s.assignmentId === assignmentId),
}));
