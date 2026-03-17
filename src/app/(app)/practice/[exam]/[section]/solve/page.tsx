"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePractice } from "@/lib/practice-store";
import { getQuestions, getSectionName } from "@/lib/questions";
import { PracticeView } from "@/components/practice/practice-view";

export default function SolvePage() {
  const params = useParams<{ exam: string; section: string }>();
  const router = useRouter();
  const { setQuestions, questions } = usePractice();

  const exam = params.exam;
  const section = params.section;

  useEffect(() => {
    const qs = getQuestions(exam, section);
    if (qs.length === 0) {
      router.push("/practice");
      return;
    }
    setQuestions(qs);
  }, [exam, section, setQuestions, router]);

  if (questions.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading questions...
      </div>
    );
  }

  return <PracticeView sectionName={getSectionName(exam, section)} />;
}
