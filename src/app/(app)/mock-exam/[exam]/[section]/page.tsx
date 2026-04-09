"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMockExam } from "@/lib/mock-exam-store";
import { useStats } from "@/lib/stats-store";
import { fetchAllQuestions, getQuestions, getQuestionsByExamSet, getSectionName } from "@/lib/questions";
import { MockExamView } from "@/components/mock-exam/mock-exam-view";
import { ScoreReport } from "@/components/mock-exam/score-report";

export default function MockExamSessionPage() {
  const params = useParams<{ exam: string; section: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { startExam, questions, answers, isFinished, reset } = useMockExam();
  const { addAttempt } = useStats();
  const [showReport, setShowReport] = useState(false);
  const startTimeRef = useRef(Date.now());
  const recordedRef = useRef(false);

  const exam = params.exam;
  const section = params.section;
  const examSet = searchParams.get("set");

  const sectionName = examSet
    ? `SAT — ${examSet.replace(/^sat-/, "").replace(/-/g, " ")}`
    : getSectionName(exam, section);

  useEffect(() => {
    fetchAllQuestions().then(() => {
    let qs;
    if (examSet) {
      qs = getQuestionsByExamSet(examSet);
    } else {
      qs = getQuestions(exam, section);
    }
    if (qs.length === 0) {
      router.push("/mock-exam");
      return;
    }
    startExam(qs);
    startTimeRef.current = Date.now();
    recordedRef.current = false;

    return () => {
      reset();
    };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, section, examSet]);

  const handleFinish = useCallback(() => {
    if (!recordedRef.current) {
      recordedRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const state = useMockExam.getState();
      const { questions: currentQuestions, answers: currentAnswers, eliminated, flagged } = state;
      const mockSessionId = `mock-${Date.now()}`;

      currentQuestions.forEach((q, i) => {
        addAttempt({
          questionId: q.id,
          exam: q.exam,
          section: q.section,
          type: q.type,
          difficulty: q.difficulty,
          isCorrect: currentAnswers[i] === q.answer,
          selectedAnswer: currentAnswers[i] ?? -1,
          timeSpent: Math.round(timeSpent / currentQuestions.length),
          timestamp: Date.now(),
          examSet: q.examSet || examSet || "",
          mode: "mock",
          sessionId: mockSessionId,
          eliminated: eliminated[i] || [],
          flagged: flagged.has(i),
          solveOrder: i + 1,
          revealed: false,
        });
      });
    }
    setShowReport(true);
  }, [addAttempt, examSet]);

  // Handle submission (from MockExamView submit button)
  useEffect(() => {
    if (isFinished && !showReport) {
      handleFinish();
    }
  }, [isFinished, showReport, handleFinish]);

  if (questions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading exam...
      </div>
    );
  }

  if (showReport) {
    return (
      <ScoreReport
        questions={questions}
        answers={answers}
        sectionName={sectionName}
        timeUsed={useMockExam.getState().timeElapsed}
      />
    );
  }

  return <MockExamView sectionName={sectionName} onFinish={handleFinish} />;
}
