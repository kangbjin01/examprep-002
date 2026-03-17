"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types";

interface ScoreReportProps {
  questions: Question[];
  answers: Record<number, number>;
  sectionName: string;
  timeUsed: number; // seconds
}

export function ScoreReport({
  questions,
  answers,
  sectionName,
  timeUsed,
}: ScoreReportProps) {
  const results = questions.map((q, i) => ({
    question: q,
    selected: answers[i],
    isCorrect: answers[i] === q.answer,
    isUnanswered: answers[i] === undefined,
  }));

  const correct = results.filter((r) => r.isCorrect).length;
  const total = questions.length;
  const percentage = Math.round((correct / total) * 100);
  const minutes = Math.floor(timeUsed / 60);
  const seconds = timeUsed % 60;

  // Difficulty breakdown
  const byDifficulty = ["easy", "medium", "hard"].map((d) => {
    const filtered = results.filter((r) => r.question.difficulty === d);
    const c = filtered.filter((r) => r.isCorrect).length;
    return { difficulty: d, correct: c, total: filtered.length };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Score Report</h1>
        <p className="text-muted-foreground">{sectionName}</p>
      </div>

      {/* Score */}
      <Card className="shadow-none">
        <CardContent className="flex flex-col items-center py-10 space-y-4">
          <div className="text-6xl font-bold font-mono">{percentage}%</div>
          <p className="text-lg text-muted-foreground">
            {correct} out of {total} correct
          </p>
          <Progress value={percentage} className="h-3 w-64" />
          <p className="text-sm text-muted-foreground">
            Time used: {minutes}m {String(seconds).padStart(2, "0")}s
          </p>
        </CardContent>
      </Card>

      {/* Difficulty breakdown */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">By Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byDifficulty
            .filter((d) => d.total > 0)
            .map((d) => (
              <div key={d.difficulty} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {d.difficulty}
                  </Badge>
                </div>
                <span className="text-sm font-mono">
                  {d.correct}/{d.total} (
                  {Math.round((d.correct / d.total) * 100)}%)
                </span>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Question-by-question */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Question Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((r, i) => (
            <div key={i} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {r.isCorrect ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      <span className="font-mono text-muted-foreground mr-2">
                        Q{i + 1}
                      </span>
                      {r.question.question}
                    </p>
                    {!r.isCorrect && (
                      <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                        {r.isUnanswered ? (
                          <p>
                            Unanswered. Correct:{" "}
                            <span className="font-medium text-green-600">
                              {r.question.choices[r.question.answer]}
                            </span>
                          </p>
                        ) : (
                          <>
                            <p>
                              Your answer:{" "}
                              <span className="text-red-500">
                                {r.question.choices[r.selected]}
                              </span>
                            </p>
                            <p>
                              Correct:{" "}
                              <span className="font-medium text-green-600">
                                {r.question.choices[r.question.answer]}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-7 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {r.question.explanation}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/mock-exam">
          <Button variant="outline" size="lg">
            Back to Mock Exams
          </Button>
        </Link>
        <Link href="/analytics">
          <Button size="lg" className="gap-2">
            View Analytics
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
