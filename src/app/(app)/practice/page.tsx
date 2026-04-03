"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchAllQuestions, getExamSets, getQuestionsByExamSet } from "@/lib/questions";

const otherExams = [
  {
    id: "ssat",
    name: "SSAT",
    fullName: "Secondary School Admission Test",
    sections: [
      {
        id: "verbal-synonyms",
        name: "Verbal - Synonyms",
        questionCount: 5,
        description: "Find the word closest in meaning",
      },
      {
        id: "verbal-analogies",
        name: "Verbal - Analogies",
        questionCount: 4,
        description: "Identify word relationships",
      },
      {
        id: "reading",
        name: "Reading Comprehension",
        questionCount: 3,
        description: "Read passages and answer questions",
      },
    ],
  },
  {
    id: "act",
    name: "ACT",
    fullName: "American College Testing",
    sections: [
      {
        id: "english",
        name: "English",
        questionCount: 6,
        description: "Grammar, punctuation, and rhetoric",
      },
      {
        id: "reading",
        name: "Reading",
        questionCount: 2,
        description: "Prose, social science, humanities, natural science",
      },
    ],
  },
];

function formatExamSetName(examSet: string): string {
  return examSet
    .replace(/^sat-/, "")
    .replace(/-/g, " ")
    .replace(/@/g, "@ ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PracticePage() {
  const [satSets, setSatSets] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllQuestions().then(() => {
      const sets = getExamSets("sat");
      const withCounts = sets.map((s) => ({
        name: s,
        count: getQuestionsByExamSet(s).length,
      }));
      setSatSets(withCounts);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="mt-1 text-muted-foreground">
          Choose an exam and section to start practicing.
        </p>
      </div>

      {/* SAT */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">SAT</h2>
          <Badge variant="secondary" className="text-xs font-normal">
            Scholastic Assessment Test
          </Badge>
          {satSets.length > 0 && (
            <Badge variant="outline" className="text-xs font-mono">
              {satSets.length} sets
            </Badge>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading exam sets...</p>
        ) : satSets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SAT questions available.</p>
        ) : (
          <div className="grid gap-3">
            {satSets.map((set) => (
              <Card key={set.name} className="shadow-none">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{formatExamSetName(set.name)}</p>
                      <p className="text-sm text-muted-foreground">
                        Reading & Writing &middot;{" "}
                        <span className="font-mono">{set.count}</span> questions
                      </p>
                    </div>
                  </div>
                  <Link href={`/practice/sat/reading-writing/solve?set=${encodeURIComponent(set.name)}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Start
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SSAT & ACT */}
      {otherExams.map((exam) => (
        <div key={exam.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{exam.name}</h2>
            <Badge variant="secondary" className="text-xs font-normal">
              {exam.fullName}
            </Badge>
          </div>

          <div className="grid gap-3">
            {exam.sections.map((section) => (
              <Card key={section.id} className="shadow-none">
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {section.description} &middot;{" "}
                        <span className="font-mono">{section.questionCount}</span>{" "}
                        questions
                      </p>
                    </div>
                  </div>
                  <Link href={`/practice/${exam.id}/${section.id}/solve`}>
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
      ))}
    </div>
  );
}
