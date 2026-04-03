"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Clock,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { pb } from "@/lib/pocketbase";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  created: string;
}

interface AttemptDetail {
  id: string;
  questionId: string;
  isCorrect: boolean;
  timeSpent: number;
  created: string;
  questionData?: {
    exam: string;
    section: string;
    type: string;
    examSet: string;
    questionNumber: number;
    question: string;
  };
}

interface ExamSetStats {
  examSet: string;
  total: number;
  correct: number;
  accuracy: number;
  avgTime: number;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load user
        const u = await pb.collection("users").getOne(params.id);
        setUser({
          id: u.id,
          email: u.email,
          name: u.name || u.email,
          role: u.role || "student",
          created: u.created,
        });

        // Load attempts with question expansion
        const attemptRecords = await pb.collection("attempts").getFullList({
          filter: `user = "${params.id}"`,
          sort: "-created",
          expand: "question",
        });

        const attemptList: AttemptDetail[] = attemptRecords.map((a) => {
          const q = a.expand?.question;
          return {
            id: a.id,
            questionId: a.question,
            isCorrect: a.isCorrect,
            timeSpent: a.timeSpent || 0,
            created: a.created,
            questionData: q
              ? {
                  exam: q.exam,
                  section: q.section,
                  type: q.type,
                  examSet: q.examSet || "",
                  questionNumber: q.questionNumber || 0,
                  question: q.question || "",
                }
              : undefined,
          };
        });

        setAttempts(attemptList);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        User not found.
      </div>
    );
  }

  // Compute stats
  const totalAttempts = attempts.length;
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

  // Stats by examSet
  const examSetMap = new Map<string, { total: number; correct: number; time: number }>();
  for (const a of attempts) {
    const key = a.questionData?.examSet || "unknown";
    const entry = examSetMap.get(key) || { total: 0, correct: 0, time: 0 };
    entry.total++;
    if (a.isCorrect) entry.correct++;
    entry.time += a.timeSpent;
    examSetMap.set(key, entry);
  }
  const examSetStats: ExamSetStats[] = Array.from(examSetMap.entries())
    .map(([examSet, s]) => ({
      examSet,
      total: s.total,
      correct: s.correct,
      accuracy: Math.round((s.correct / s.total) * 100),
      avgTime: Math.round(s.time / s.total),
    }))
    .sort((a, b) => b.total - a.total);

  // Days active
  const activeDays = new Set(
    attempts.map((a) => new Date(a.created).toISOString().slice(0, 10))
  ).size;

  // Recent activity (last 20)
  const recentAttempts = attempts.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/t/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <Badge
              variant={user.role === "teacher" ? "default" : "secondary"}
              className="text-xs"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {user.email} &middot; Joined{" "}
            {new Date(user.created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{totalAttempts}</p>
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
                {totalAttempts > 0 ? `${accuracy}%` : "--"}
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {Math.round(totalTime / 60)}m
              </p>
              <p className="text-xs text-muted-foreground">Total Time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">{activeDays}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Exam Set */}
      {examSetStats.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Performance by Exam Set</h2>
          <div className="mt-4 space-y-3">
            {examSetStats.map((stat) => (
              <Card key={stat.examSet} className="shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        {stat.examSet.replace(/^sat-/, "").replace(/-/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.correct}/{stat.total} correct &middot; avg{" "}
                        {stat.avgTime}s per question
                      </p>
                    </div>
                    <span className="text-lg font-bold font-mono">
                      {stat.accuracy}%
                    </span>
                  </div>
                  <Progress value={stat.accuracy} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card className="mt-4 shadow-none">
          <CardContent
            className={
              recentAttempts.length === 0
                ? "flex items-center justify-center py-12 text-sm text-muted-foreground"
                : "p-0"
            }
          >
            {recentAttempts.length === 0 ? (
              "No activity yet."
            ) : (
              <div className="divide-y divide-border">
                {recentAttempts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {a.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm">
                          {a.questionData?.examSet
                            ? a.questionData.examSet
                                .replace(/^sat-/, "")
                                .replace(/-/g, " ")
                            : "Unknown set"}{" "}
                          <span className="text-muted-foreground">
                            Q{a.questionData?.questionNumber || "?"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.questionData?.question?.slice(0, 60)}
                          {(a.questionData?.question?.length || 0) > 60
                            ? "..."
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-muted-foreground">
                        {a.timeSpent}s
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
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
