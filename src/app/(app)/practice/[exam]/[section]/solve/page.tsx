"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePractice } from "@/lib/practice-store";
import { fetchAllQuestions, getQuestions, getQuestionsByExamSet, getSectionName } from "@/lib/questions";
import { PracticeView } from "@/components/practice/practice-view";

export default function SolvePage() {
  const params = useParams<{ exam: string; section: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setQuestions, questions } = usePractice();

  const exam = params.exam;
  const section = params.section;
  const examSet = searchParams.get("set");

  useEffect(() => {
    fetchAllQuestions().then(() => {
      let qs;
      if (examSet) {
        qs = getQuestionsByExamSet(examSet);
      } else {
        qs = getQuestions(exam, section);
      }
      if (qs.length === 0) {
        router.push("/practice");
        return;
      }
      setQuestions(qs);
    });
  }, [exam, section, examSet, setQuestions, router]);

  if (questions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading questions...
      </div>
    );
  }

  const sectionName = examSet
    ? `SAT — ${examSet.replace(/^sat-/, "").replace(/-/g, " ")}`
    : getSectionName(exam, section);

  return <PracticeView sectionName={sectionName} />;
}
