"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMockExam, getSectionTime } from "@/lib/mock-exam-store";
import { useStats } from "@/lib/stats-store";
import { getQuestions, getSectionName } from "@/lib/questions";
import { MockExamView } from "@/components/mock-exam/mock-exam-view";
import { ScoreReport } from "@/components/mock-exam/score-report";

export default function MockExamSessionPage() {
  const params = useParams<{ exam: string; section: string }>();
  const router = useRouter();
  const { startExam, questions, answers, isFinished, reset } = useMockExam();
  const { addAttempt } = useStats();
  const [showReport, setShowReport] = useState(false);
  const startTimeRef = useRef(Date.now());
  const recordedRef = useRef(false);

  const exam = params.exam;
  const section = params.section;
  const sectionName = getSectionName(exam, section);

  useEffect(() => {
    const qs = getQuestions(exam, section);
    if (qs.length === 0) {
      router.push("/mock-exam");
      return;
    }
    const totalTime = getSectionTime(exam, section);
    startExam(qs, totalTime);
    startTimeRef.current = Date.now();
    recordedRef.current = false;

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, section]);

  const handleFinish = () => {
    // Record attempts to stats
    if (!recordedRef.current) {
      recordedRef.current = true;
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const currentQuestions = useMockExam.getState().questions;
      const currentAnswers = useMockExam.getState().answers;

      currentQuestions.forEach((q, i) => {
        addAttempt({
          questionId: q.id,
          exam: q.exam,
          section: q.section,
          type: q.type,
          difficulty: q.difficulty,
          isCorrect: currentAnswers[i] === q.answer,
          timeSpent: Math.round(timeSpent / currentQuestions.length),
          timestamp: Date.now(),
        });
      });
    }
    setShowReport(true);
  };

  if (questions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading exam...
      </div>
    );
  }

  if (showReport) {
    const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <ScoreReport
        questions={questions}
        answers={answers}
        sectionName={sectionName}
        timeUsed={timeUsed}
      />
    );
  }

  return <MockExamView sectionName={sectionName} onFinish={handleFinish} />;
}
