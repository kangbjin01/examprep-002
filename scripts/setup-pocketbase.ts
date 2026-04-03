/**
 * PocketBase Setup Script (v0.36+)
 * Run: npx tsx scripts/setup-pocketbase.ts
 */

import PocketBase from "pocketbase";
import seedData from "../pocketbase/seed.json";

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@examprep.com";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "Abcdef123456";

const pb = new PocketBase(PB_URL);

async function authenticate() {
  try {
    await pb.collection("_superusers").authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✓ Authenticated as admin");
  } catch {
    console.error("✗ Auth failed. Create superuser first:");
    console.log(`  docker compose exec pocketbase /usr/local/bin/pocketbase superuser upsert ${ADMIN_EMAIL} ${ADMIN_PASSWORD} --dir /pb_data`);
    process.exit(1);
  }
}

async function exists(name: string): Promise<boolean> {
  try {
    await pb.collections.getOne(name);
    return true;
  } catch {
    return false;
  }
}

async function getUsersId(): Promise<string> {
  return (await pb.collections.getOne("users")).id;
}

async function setup() {
  // 1. Add 'role' to users
  try {
    const users = await pb.collections.getOne("users");
    const hasRole = users.fields?.some((f: { name: string }) => f.name === "role");
    if (!hasRole) {
      const fields = [...(users.fields || [])];
      fields.push({
        name: "role",
        type: "select",
        hidden: false,
        required: false,
        presentable: false,
        system: false,
        values: ["student", "teacher"],
        maxSelect: 1,
      });
      await pb.collections.update("users", { fields });
      console.log("✓ Added role field to users");
    } else {
      console.log("✓ Users role field exists");
    }
  } catch (e: unknown) {
    console.error("✗ Users role:", (e as Error).message);
  }

  const usersId = await getUsersId();

  // 2. Questions
  if (!(await exists("questions"))) {
    await pb.collections.create({
      name: "questions",
      type: "base",
      listRule: "",
      viewRule: "",
      fields: [
        { name: "exam", type: "select", required: true, values: ["ssat", "act"], maxSelect: 1 },
        { name: "section", type: "text", required: true },
        { name: "type", type: "text", required: true },
        { name: "difficulty", type: "select", required: true, values: ["easy", "medium", "hard"], maxSelect: 1 },
        { name: "passage", type: "text" },
        { name: "question", type: "text", required: true },
        { name: "choices", type: "json", required: true },
        { name: "answer", type: "number", required: true },
        { name: "explanation", type: "text", required: true },
        { name: "tags", type: "json" },
      ],
    });
    console.log("✓ Created questions");
  } else {
    console.log("✓ questions exists");
  }

  const questionsId = (await pb.collections.getOne("questions")).id;

  // 3. Attempts
  if (!(await exists("attempts"))) {
    await pb.collections.create({
      name: "attempts",
      type: "base",
      listRule: "@request.auth.id = user",
      viewRule: "@request.auth.id = user",
      createRule: "@request.auth.id != ''",
      fields: [
        { name: "user", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "question", type: "relation", required: true, collectionId: questionsId, maxSelect: 1 },
        { name: "assignment", type: "text" },
        { name: "selectedAnswer", type: "number", required: true },
        { name: "isCorrect", type: "bool", required: true },
        { name: "timeSpent", type: "number" },
      ],
    });
    console.log("✓ Created attempts");
  } else {
    console.log("✓ attempts exists");
  }

  // 4. Bookmarks
  if (!(await exists("bookmarks"))) {
    await pb.collections.create({
      name: "bookmarks",
      type: "base",
      listRule: "@request.auth.id = user",
      viewRule: "@request.auth.id = user",
      createRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id = user",
      fields: [
        { name: "user", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "question", type: "relation", required: true, collectionId: questionsId, maxSelect: 1 },
        { name: "note", type: "text" },
      ],
    });
    console.log("✓ Created bookmarks");
  } else {
    console.log("✓ bookmarks exists");
  }

  // 5. Classes
  if (!(await exists("classes"))) {
    await pb.collections.create({
      name: "classes",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id = teacher",
      deleteRule: "@request.auth.id = teacher",
      fields: [
        { name: "teacher", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "name", type: "text", required: true },
        { name: "exam", type: "select", required: true, values: ["ssat", "act", "both"], maxSelect: 1 },
        { name: "description", type: "text" },
        { name: "inviteCode", type: "text", required: true },
        { name: "isActive", type: "bool" },
      ],
    });
    console.log("✓ Created classes");
  } else {
    console.log("✓ classes exists");
  }

  const classesId = (await pb.collections.getOne("classes")).id;

  // 6. Class Members
  if (!(await exists("class_members"))) {
    await pb.collections.create({
      name: "class_members",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: "class", type: "relation", required: true, collectionId: classesId, maxSelect: 1 },
        { name: "student", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "status", type: "select", required: true, values: ["active", "removed"], maxSelect: 1 },
      ],
    });
    console.log("✓ Created class_members");
  } else {
    console.log("✓ class_members exists");
  }

  // 7. Assignments
  if (!(await exists("assignments"))) {
    await pb.collections.create({
      name: "assignments",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id = teacher",
      fields: [
        { name: "class", type: "relation", required: true, collectionId: classesId, maxSelect: 1 },
        { name: "teacher", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "title", type: "text", required: true },
        { name: "exam", type: "select", required: true, values: ["ssat", "act"], maxSelect: 1 },
        { name: "section", type: "text", required: true },
        { name: "difficulty", type: "select", required: true, values: ["easy", "medium", "hard", "mixed"], maxSelect: 1 },
        { name: "questionCount", type: "number", required: true },
        { name: "questions", type: "relation", collectionId: questionsId, maxSelect: 999 },
        { name: "dueDate", type: "date", required: true },
        { name: "status", type: "select", required: true, values: ["draft", "assigned", "closed"], maxSelect: 1 },
      ],
    });
    console.log("✓ Created assignments");
  } else {
    console.log("✓ assignments exists");
  }

  const assignmentsId = (await pb.collections.getOne("assignments")).id;

  // 8. Assignment Submissions
  if (!(await exists("assignment_submissions"))) {
    await pb.collections.create({
      name: "assignment_submissions",
      type: "base",
      listRule: "@request.auth.id = student",
      viewRule: "@request.auth.id = student",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id = student",
      fields: [
        { name: "assignment", type: "relation", required: true, collectionId: assignmentsId, maxSelect: 1 },
        { name: "student", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
        { name: "status", type: "select", required: true, values: ["not_started", "in_progress", "completed"], maxSelect: 1 },
        { name: "score", type: "number" },
        { name: "correctCount", type: "number" },
        { name: "totalCount", type: "number" },
        { name: "startedAt", type: "date" },
        { name: "completedAt", type: "date" },
      ],
    });
    console.log("✓ Created assignment_submissions");
  } else {
    console.log("✓ assignment_submissions exists");
  }
}

async function seedQuestions() {
  const existing = await pb.collection("questions").getList(1, 1);
  if (existing.totalItems > 0) {
    console.log(`✓ Questions already seeded (${existing.totalItems})`);
    return;
  }

  for (const q of seedData.questions) {
    await pb.collection("questions").create({
      exam: q.exam,
      section: q.section,
      type: q.type,
      difficulty: q.difficulty,
      passage: q.passage || "",
      question: q.question,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
      tags: q.tags,
    });
  }
  console.log(`✓ Seeded ${seedData.questions.length} questions`);
}

async function main() {
  console.log(`\nPocketBase setup (${PB_URL})\n`);
  await authenticate();
  await setup();
  await seedQuestions();
  console.log("\n✓ Done!\n");
}

main().catch(console.error);
