"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const exams = [
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

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
        <p className="mt-1 text-muted-foreground">
          Choose an exam and section to start practicing.
        </p>
      </div>

      {exams.map((exam) => (
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
                        <span className="font-mono">
                          {section.questionCount}
                        </span>{" "}
                        questions
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/practice/${exam.id}/${section.id}/solve`}
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
      ))}
    </div>
  );
}
