"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacher } from "@/lib/teacher-store";
import type { Exam, Difficulty } from "@/types";

const sections: Record<string, { id: string; label: string }[]> = {
  ssat: [
    { id: "verbal-synonyms", label: "Verbal - Synonyms" },
    { id: "verbal-analogies", label: "Verbal - Analogies" },
    { id: "reading", label: "Reading Comprehension" },
  ],
  act: [
    { id: "english", label: "English" },
    { id: "reading", label: "Reading" },
  ],
};

export default function NewAssignmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { createAssignment } = useTeacher();

  const [title, setTitle] = useState("");
  const [exam, setExam] = useState<Exam>("ssat");
  const [section, setSection] = useState("verbal-synonyms");
  const [difficulty, setDifficulty] = useState<Difficulty | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    createAssignment({
      classId: params.id,
      title: title.trim(),
      exam,
      section,
      difficulty,
      questionCount,
      dueDate,
    });
    router.push(`/t/classes/${params.id}`);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/t/classes/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Assignment</h1>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Week 3 - Grammar Practice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Exam</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["ssat", "act"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setExam(opt);
                      setSection(sections[opt][0].id);
                    }}
                    className={`rounded-lg border p-2.5 text-sm transition-colors ${
                      exam === opt
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <div className="grid gap-2">
                {sections[exam].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={`rounded-lg border p-2.5 text-left text-sm transition-colors ${
                      section === s.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <div className="grid grid-cols-4 gap-2">
                {(["easy", "medium", "hard", "mixed"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDifficulty(opt)}
                    className={`rounded-lg border p-2 text-xs capitalize transition-colors ${
                      difficulty === opt
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={50}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Create Assignment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
