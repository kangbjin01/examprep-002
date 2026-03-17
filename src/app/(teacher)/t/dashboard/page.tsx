"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-store";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Teacher";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your classes, assignments, and track student progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">0</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">0</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">0</p>
              <p className="text-xs text-muted-foreground">Active Assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Create a Class</CardTitle>
              <p className="text-sm text-muted-foreground">
                Set up a new class and invite students with a code.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/t/classes/new">
                <Button variant="outline" className="w-full gap-2">
                  New Class
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">View Classes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage existing classes and monitor student progress.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/t/classes">
                <Button variant="outline" className="w-full gap-2">
                  My Classes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
