"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Plus,
  UserMinus,
  ClipboardList,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeacher } from "@/lib/teacher-store";

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    getClassById,
    getStudentsByClass,
    getAssignmentsByClass,
    addStudent,
    removeStudent,
  } = useTeacher();

  const cls = getClassById(params.id);
  const students = getStudentsByClass(params.id);
  const assignments = getAssignmentsByClass(params.id);

  const [copied, setCopied] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  if (!cls) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Class not found.
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cls.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    addStudent(params.id, newName.trim(), newEmail.trim());
    setNewName("");
    setNewEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/t/classes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{cls.name}</h1>
            <Badge variant="secondary" className="text-xs uppercase">
              {cls.exam}
            </Badge>
          </div>
          {cls.description && (
            <p className="text-sm text-muted-foreground">{cls.description}</p>
          )}
        </div>
      </div>

      {/* Invite Code */}
      <Card className="shadow-none">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Invite Code</p>
            <p className="text-2xl font-bold font-mono tracking-widest">
              {cls.inviteCode}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold font-mono">{students.length}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold font-mono">
                {assignments.filter((a) => a.status === "assigned").length}
              </p>
              <p className="text-xs text-muted-foreground">Active Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Link href={`/t/classes/${params.id}/analytics`}>
          <Card className="shadow-none hover:bg-secondary/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Class Analytics</p>
                <p className="text-xs text-muted-foreground">View performance</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4 space-y-4">
          {/* Add student form */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add Student Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          {students.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No students yet. Share the invite code or add manually.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <Card key={student.id} className="shadow-none">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.email} &middot; Joined{" "}
                        {new Date(student.joinedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/t/classes/${params.id}/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent(params.id, student.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 space-y-4">
          <Link href={`/t/classes/${params.id}/assignments/new`}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </Link>

          {assignments.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                No assignments yet. Create one to assign work to students.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {assignments
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                .map((assignment) => (
                  <Card key={assignment.id} className="shadow-none">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <Badge
                            variant={assignment.status === "assigned" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {assignment.exam.toUpperCase()} {assignment.section} &middot;{" "}
                          {assignment.questionCount} questions &middot; Due{" "}
                          {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Link href={`/t/classes/${params.id}/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
