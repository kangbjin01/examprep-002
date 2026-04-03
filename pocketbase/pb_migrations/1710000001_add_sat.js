/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const questions = app.findCollectionByNameOrId("questions");

    // Add "sat" to exam select values
    const examField = questions.fields.find((f) => f.name === "exam");
    if (examField) {
      examField.options.values = ["ssat", "act", "sat"];
    }

    // Add examSet field for grouping questions by test round (회차)
    questions.fields.push(
      new Field({ name: "examSet", type: "text" })
    );

    // Add questionNumber field for ordering within a set
    questions.fields.push(
      new Field({ name: "questionNumber", type: "number" })
    );

    app.save(questions);

    // Update mock_exams to support SAT
    const mockExams = app.findCollectionByNameOrId("mock_exams");
    const mockExamField = mockExams.fields.find((f) => f.name === "exam");
    if (mockExamField) {
      mockExamField.options.values = ["ssat", "act", "sat"];
    }
    app.save(mockExams);
  },
  (app) => {
    const questions = app.findCollectionByNameOrId("questions");
    const examField = questions.fields.find((f) => f.name === "exam");
    if (examField) {
      examField.options.values = ["ssat", "act"];
    }
    questions.fields = questions.fields.filter(
      (f) => f.name !== "examSet" && f.name !== "questionNumber"
    );
    app.save(questions);

    const mockExams = app.findCollectionByNameOrId("mock_exams");
    const mockExamField = mockExams.fields.find((f) => f.name === "exam");
    if (mockExamField) {
      mockExamField.options.values = ["ssat", "act"];
    }
    app.save(mockExams);
  }
);
