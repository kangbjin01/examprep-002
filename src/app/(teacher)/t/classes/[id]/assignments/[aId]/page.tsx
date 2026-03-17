"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTeacher } from "@/lib/teacher-store";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string; aId: string }>();
  const { assignments, getSubmissionsByAssignment, closeAssignment } = useTeacher();

  const assignment = assignments.find((a) => a.id === params.aId);
  const submissions = getSubmissionsByAssignment(params.aId);

  if (!assignment) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Assignment not found.
      </div>
    );
  }

  const completedCount = submissions.filter((s) => s.status === "completed").length;
  const completionRate = submissions.length > 0
    ? Math.round((completedCount / submissions.length) * 100)
    : 0;
  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/t/classes/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {assignment.title}
            </h1>
            <Badge
              variant={assignment.status === "assigned" ? "default" : "secondary"}
              className="text-xs"
            >
              {assignment.status}
            </Badge>
            {isOverdue && assignment.status === "assigned" && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {assignment.exam.toUpperCase()} {assignment.section} &middot;{" "}
            {assignment.difficulty} &middot; {assignment.questionCount} questions
            &middot; Due{" "}
            {new Date(assignment.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        {assignment.status === "assigned" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => closeAssignment(assignment.id)}
          >
            Close Assignment
          </Button>
        )}
      </div>

      {/* Completion overview */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>
              {completedCount} of {submissions.length} students completed
            </span>
            <span className="font-mono">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Student submissions */}
      <div>
        <h2 className="text-lg font-semibold">Student Results</h2>
        {submissions.length === 0 ? (
          <Card className="mt-4 shadow-none">
            <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No students in this class.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-2">
            {submissions.map((sub) => (
              <Card key={sub.studentId} className="shadow-none">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {sub.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : sub.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-orange-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{sub.studentName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sub.status.replace("_", " ")}
                        {sub.completedAt &&
                          ` on ${new Date(sub.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`}
                      </p>
                    </div>
                  </div>
                  {sub.status === "completed" && (
                    <span className="text-sm font-mono font-medium">
                      {sub.score}%
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
