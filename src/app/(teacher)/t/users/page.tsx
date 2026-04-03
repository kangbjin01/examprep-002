"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { pb } from "@/lib/pocketbase";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  created: string;
  attemptCount: number;
  accuracy: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const records = await pb.collection("users").getFullList({
          sort: "-created",
        });

        const userList: UserRecord[] = [];

        for (const u of records) {
          // Count attempts for each user
          let attemptCount = 0;
          let correctCount = 0;
          try {
            const attempts = await pb.collection("attempts").getList(1, 1, {
              filter: `user = "${u.id}"`,
              skipTotal: false,
            });
            attemptCount = attempts.totalItems;

            if (attemptCount > 0) {
              const correct = await pb.collection("attempts").getList(1, 1, {
                filter: `user = "${u.id}" && isCorrect = true`,
                skipTotal: false,
              });
              correctCount = correct.totalItems;
            }
          } catch {
            // attempts collection might not have data
          }

          userList.push({
            id: u.id,
            email: u.email,
            name: u.name || u.email,
            role: u.role || "student",
            created: u.created,
            attemptCount,
            accuracy: attemptCount > 0 ? Math.round((correctCount / attemptCount) * 100) : 0,
          });
        }

        setUsers(userList);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage users and view their learning progress.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold font-mono">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-mono text-xs font-bold">
              Q
            </div>
            <div>
              <p className="text-xl font-bold font-mono">
                {users.reduce((sum, u) => sum + u.attemptCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-mono text-xs font-bold">
              %
            </div>
            <div>
              <p className="text-xl font-bold font-mono">
                {users.length > 0 && users.some((u) => u.attemptCount > 0)
                  ? Math.round(
                      users
                        .filter((u) => u.attemptCount > 0)
                        .reduce((sum, u) => sum + u.accuracy, 0) /
                        users.filter((u) => u.attemptCount > 0).length
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            {search ? "No users matching search." : "No users yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <Card key={user.id} className="shadow-none">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
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
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-mono font-medium">
                      {user.attemptCount} solved
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.attemptCount > 0 ? `${user.accuracy}% accuracy` : "No activity"}
                    </p>
                  </div>
                  <Link href={`/t/users/${user.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
