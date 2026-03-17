"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeacher } from "@/lib/teacher-store";

export default function StudentDetailPage() {
  const params = useParams<{ id: string; sId: string }>();
  const { students, assignments, submissions, getClassById } = useTeacher();

  const cls = getClassById(params.id);
  const student = students.find((s) => s.id === params.sId);
  const classAssignments = assignments.filter((a) => a.classId === params.id);
  const studentSubs = submissions.filter((s) => s.studentId === params.sId);

  if (!student || !cls) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Student not found.
      </div>
    );
  }

  const completedSubs = studentSubs.filter((s) => s.status === "completed");
  const avgScore =
    completedSubs.length > 0
      ? Math.round(
          completedSubs.reduce((sum, s) => sum + s.score, 0) / completedSubs.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/t/classes/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
          <p className="text-sm text-muted-foreground">
            {student.email} &middot; {cls.name}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">
              {avgScore > 0 ? `${avgScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">
              {completedSubs.length}/{classAssignments.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Assignments Done</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">
              {new Date(student.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Joined</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignment history */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Assignment History</CardTitle>
        </CardHeader>
        <CardContent>
          {classAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No assignments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {classAssignments.map((assignment) => {
                const sub = studentSubs.find(
                  (s) => s.assignmentId === assignment.id
                );
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {sub?.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.exam.toUpperCase()} {assignment.section}{" "}
                          &middot;{" "}
                          <Badge variant="secondary" className="text-xs capitalize">
                            {sub?.status?.replace("_", " ") ?? "not started"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    {sub?.status === "completed" && (
                      <span className="text-sm font-mono font-medium">
                        {sub.score}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
