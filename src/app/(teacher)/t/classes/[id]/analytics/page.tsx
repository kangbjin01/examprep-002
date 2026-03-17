"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacher } from "@/lib/teacher-store";

export default function ClassAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const { getClassById, getStudentsByClass, getAssignmentsByClass, getSubmissionsByAssignment } =
    useTeacher();

  const cls = getClassById(params.id);
  const students = getStudentsByClass(params.id);
  const assignments = getAssignmentsByClass(params.id);

  if (!cls) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Class not found.
      </div>
    );
  }

  // Calculate overall stats
  const allSubmissions = assignments.flatMap((a) =>
    getSubmissionsByAssignment(a.id)
  );
  const completedSubs = allSubmissions.filter((s) => s.status === "completed");
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
        <h1 className="text-2xl font-bold tracking-tight">
          {cls.name} - Analytics
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">{students.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Students</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">{assignments.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Assignments</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold font-mono">
              {avgScore > 0 ? `${avgScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Student leaderboard */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students enrolled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const studentSubs = allSubmissions.filter(
                  (s) => s.studentId === student.id && s.status === "completed"
                );
                const studentAvg =
                  studentSubs.length > 0
                    ? Math.round(
                        studentSubs.reduce((sum, s) => sum + s.score, 0) /
                          studentSubs.length
                      )
                    : 0;
                const completedCount = studentSubs.length;

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedCount} assignment{completedCount !== 1 ? "s" : ""}{" "}
                        completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium">
                        {studentAvg > 0 ? `${studentAvg}%` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
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
