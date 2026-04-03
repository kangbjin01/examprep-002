"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacher } from "@/lib/teacher-store";

export default function NewClassPage() {
  const router = useRouter();
  const { createClass } = useTeacher();
  const [name, setName] = useState("");
  const [exam, setExam] = useState<"ssat" | "act" | "sat" | "both" | "all">("sat");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cls = await createClass(name.trim(), exam, description.trim());
    router.push(`/t/classes/${cls.id}`);
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/t/classes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create Class</h1>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Class Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                placeholder="e.g., SAT Prep - Spring 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Exam Type</Label>
              <div className="grid grid-cols-5 gap-2">
                {(["sat", "ssat", "act", "both", "all"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setExam(opt)}
                    className={`rounded-lg border p-2.5 text-sm transition-colors ${
                      exam === opt
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {opt === "both" ? "SSAT+ACT" : opt === "all" ? "All" : opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Create Class
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
