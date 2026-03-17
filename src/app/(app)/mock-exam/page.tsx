"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockExams = [
  {
    id: "ssat-verbal-synonyms",
    exam: "SSAT",
    section: "Verbal - Synonyms",
    sectionSlug: "verbal-synonyms",
    examSlug: "ssat",
    time: "15 min",
    questionCount: 5,
  },
  {
    id: "ssat-verbal-analogies",
    exam: "SSAT",
    section: "Verbal - Analogies",
    sectionSlug: "verbal-analogies",
    examSlug: "ssat",
    time: "15 min",
    questionCount: 4,
  },
  {
    id: "ssat-reading",
    exam: "SSAT",
    section: "Reading Comprehension",
    sectionSlug: "reading",
    examSlug: "ssat",
    time: "40 min",
    questionCount: 3,
  },
  {
    id: "act-english",
    exam: "ACT",
    section: "English",
    sectionSlug: "english",
    examSlug: "act",
    time: "45 min",
    questionCount: 6,
  },
  {
    id: "act-reading",
    exam: "ACT",
    section: "Reading",
    sectionSlug: "reading",
    examSlug: "act",
    time: "35 min",
    questionCount: 2,
  },
];

export default function MockExamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mock Exam</h1>
        <p className="mt-1 text-muted-foreground">
          Simulate real test conditions with a timed exam.
        </p>
      </div>

      <div className="grid gap-3">
        {mockExams.map((exam) => (
          <Card key={exam.id} className="shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{exam.section}</p>
                    <Badge variant="secondary" className="text-xs">
                      {exam.exam}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {exam.time} &middot;{" "}
                    <span className="font-mono">{exam.questionCount}</span>{" "}
                    questions
                  </p>
                </div>
              </div>
              <Link
                href={`/mock-exam/${exam.examSlug}/${exam.sectionSlug}`}
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  Start
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
