"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, BookOpen, TrendingUp, Clock } from "lucide-react";
import { useStats } from "@/lib/stats-store";

const sections = [
  { exam: "sat", section: "reading-writing", label: "SAT Reading & Writing" },
  { exam: "act", section: "english", label: "ACT English" },
  { exam: "act", section: "reading", label: "ACT Reading" },
];

export default function AnalyticsPage() {
  const { attempts, getAccuracy, getStreak, getWeeklyTime } = useStats();

  const accuracy = getAccuracy();
  const streak = getStreak();
  const weeklyMinutes = Math.round(getWeeklyTime() / 60);
  const totalQuestions = attempts.length;

  const sectionStats = useMemo(() => {
    return sections.map((s) => {
      const filtered = attempts.filter(
        (a) => a.exam === s.exam && a.section === s.section
      );
      const correct = filtered.filter((a) => a.isCorrect).length;
      const total = filtered.length;
      const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { ...s, correct, total, accuracy: acc };
    });
  }, [attempts]);

  const recentActivity = useMemo(() => {
    const byDay: Record<string, { correct: number; total: number }> = {};
    [...attempts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100)
      .forEach((a) => {
        const day = new Date(a.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!byDay[day]) byDay[day] = { correct: 0, total: 0 };
        byDay[day].total++;
        if (a.isCorrect) byDay[day].correct++;
      });
    return Object.entries(byDay).slice(0, 7);
  }, [attempts]);

  const difficultyBreakdown = useMemo(() => {
    const byDiff: Record<string, { correct: number; total: number }> = {};
    attempts.forEach((a) => {
      if (!byDiff[a.difficulty]) byDiff[a.difficulty] = { correct: 0, total: 0 };
      byDiff[a.difficulty].total++;
      if (a.isCorrect) byDiff[a.difficulty].correct++;
    });
    return ["easy", "medium", "hard"].map((d) => ({
      difficulty: d,
      correct: byDiff[d]?.correct ?? 0,
      total: byDiff[d]?.total ?? 0,
      accuracy: byDiff[d]
        ? Math.round((byDiff[d].correct / byDiff[d].total) * 100)
        : 0,
    }));
  }, [attempts]);

  if (attempts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your performance and identify areas for improvement.
          </p>
        </div>
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Complete some practice sessions to see your analytics here.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track your performance and identify areas for improvement.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions Solved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {Math.round(accuracy)}%
              </p>
              <p className="text-xs text-muted-foreground">Overall Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {streak} day{streak !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{weeklyMinutes}m</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section breakdown */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Accuracy by Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionStats.map((s) => (
            <div key={s.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {s.total > 0
                    ? `${s.correct}/${s.total} (${s.accuracy}%)`
                    : "No data"}
                </span>
              </div>
              <Progress value={s.accuracy} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Difficulty breakdown */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">By Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {difficultyBreakdown.map((d) => (
              <div
                key={d.difficulty}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {d.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-mono">
                    {d.total > 0 ? `${d.correct}/${d.total}` : "—"}
                  </span>
                </div>
                <span className="text-sm font-medium font-mono">
                  {d.total > 0 ? `${d.accuracy}%` : "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(([day, data]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm">{day}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {data.correct}/{data.total} correct
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
