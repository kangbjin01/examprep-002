/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // questions collection
    const questions = new Collection({
      name: "questions",
      type: "base",
      schema: [
        { name: "exam", type: "select", required: true, options: { values: ["ssat", "act"] } },
        { name: "section", type: "text", required: true },
        { name: "type", type: "text", required: true },
        { name: "difficulty", type: "select", required: true, options: { values: ["easy", "medium", "hard"] } },
        { name: "passage", type: "text" },
        { name: "question", type: "text", required: true },
        { name: "choices", type: "json", required: true },
        { name: "answer", type: "number", required: true },
        { name: "explanation", type: "text", required: true },
        { name: "tags", type: "json" },
      ],
    });
    app.save(questions);

    // attempts collection
    const attempts = new Collection({
      name: "attempts",
      type: "base",
      schema: [
        { name: "user", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
        { name: "question", type: "relation", required: true, options: { collectionId: questions.id, maxSelect: 1 } },
        { name: "selectedAnswer", type: "number", required: true },
        { name: "isCorrect", type: "bool", required: true },
        { name: "timeSpent", type: "number" },
      ],
    });
    app.save(attempts);

    // bookmarks collection
    const bookmarks = new Collection({
      name: "bookmarks",
      type: "base",
      schema: [
        { name: "user", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
        { name: "question", type: "relation", required: true, options: { collectionId: questions.id, maxSelect: 1 } },
        { name: "note", type: "text" },
      ],
    });
    app.save(bookmarks);

    // mock_exams collection
    const mockExams = new Collection({
      name: "mock_exams",
      type: "base",
      schema: [
        { name: "user", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
        { name: "exam", type: "select", required: true, options: { values: ["ssat", "act"] } },
        { name: "status", type: "select", required: true, options: { values: ["in_progress", "completed"] } },
        { name: "score", type: "number" },
        { name: "startedAt", type: "date", required: true },
        { name: "completedAt", type: "date" },
      ],
    });
    app.save(mockExams);
  },
  (app) => {
    app.findCollectionByNameOrId("mock_exams")?.delete();
    app.findCollectionByNameOrId("bookmarks")?.delete();
    app.findCollectionByNameOrId("attempts")?.delete();
    app.findCollectionByNameOrId("questions")?.delete();
  }
);
