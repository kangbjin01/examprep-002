"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Target, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-store";
import { useStats } from "@/lib/stats-store";

const examCards = [
  {
    exam: "SAT",
    description: "Reading & Writing — Multiple exam sets available",
    href: "/practice",
    sections: 1,
  },
  {
    exam: "SSAT",
    description: "Verbal Synonyms, Analogies, Reading Comprehension",
    href: "/practice",
    sections: 3,
  },
  {
    exam: "ACT",
    description: "English Grammar, Rhetoric, Reading Comprehension",
    href: "/practice",
    sections: 2,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { attempts, getAccuracy, getStreak, getWeeklyTime } = useStats();
  const firstName = user?.name?.split(" ")[0] || "there";

  const accuracy = getAccuracy();
  const streak = getStreak();
  const weeklyMinutes = Math.round(getWeeklyTime() / 60);

  const stats = [
    {
      label: "Questions Solved",
      value: attempts.length > 0 ? String(attempts.length) : "0",
      icon: BookOpen,
    },
    {
      label: "Accuracy",
      value: attempts.length > 0 ? `${Math.round(accuracy)}%` : "—",
      icon: Target,
    },
    {
      label: "Streak",
      value: `${streak} day${streak !== 1 ? "s" : ""}`,
      icon: TrendingUp,
    },
    {
      label: "This Week",
      value: `${weeklyMinutes}m`,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hi, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          Pick up where you left off or start a new practice session.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Practice */}
      <div>
        <h2 className="text-lg font-semibold">Start Practicing</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {examCards.map((card) => (
            <Card key={card.exam} className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{card.exam}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progress</span>
                    <span>0 / {card.sections} sections</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
                <Link href={card.href}>
                  <Button variant="outline" className="w-full gap-2">
                    Practice {card.exam}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Card className="mt-4 shadow-none">
          <CardContent className={attempts.length === 0 ? "flex items-center justify-center py-12 text-sm text-muted-foreground" : "p-5 space-y-3"}>
            {attempts.length === 0 ? (
              "No activity yet. Start a practice session to see your history here."
            ) : (
              [...attempts]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5)
                .map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          a.isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="uppercase text-xs font-medium text-muted-foreground">
                        {a.exam}
                      </span>
                      <span>{a.section} &middot; {a.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(a.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
