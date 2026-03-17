"use client";

import Link from "next/link";
import { Plus, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeacher } from "@/lib/teacher-store";

export default function ClassesPage() {
  const { classes } = useTeacher();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Classes</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your classes and students.
          </p>
        </div>
        <Link href="/t/classes/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Class
          </Button>
        </Link>
      </div>

      {classes.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-sm text-muted-foreground gap-4">
            <p>No classes yet. Create your first class to get started.</p>
            <Link href="/t/classes/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Class
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-none">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{cls.name}</p>
                      <Badge variant="secondary" className="text-xs uppercase">
                        {cls.exam}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Code: <span className="font-mono font-medium">{cls.inviteCode}</span>
                      {" "}&middot; {cls.studentCount} student{cls.studentCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Link href={`/t/classes/${cls.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Manage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
