"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { pb } from "@/lib/pocketbase";

export default function JoinClassPage() {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Invite code must be 6 characters.");
      return;
    }

    if (!pb.authStore.isValid) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);
    try {
      // Find class by invite code
      const classes = await pb.collection("classes").getFullList({
        filter: `inviteCode = "${code.trim()}" && isActive = true`,
      });

      if (classes.length === 0) {
        setError("Invalid invite code. Please check and try again.");
        return;
      }

      const cls = classes[0];

      // Check if already a member
      const existing = await pb.collection("class_members").getFullList({
        filter: `class = "${cls.id}" && student = "${pb.authStore.record?.id}" && status = "active"`,
      });

      if (existing.length > 0) {
        setError("You are already a member of this class.");
        return;
      }

      // Join the class
      await pb.collection("class_members").create({
        class: cls.id,
        student: pb.authStore.record?.id,
        status: "active",
      });

      setClassName(cls.name);
      setJoined(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ExamPrep
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Join a Class
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the invite code from your teacher.
          </p>
        </div>

        {joined ? (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold">You&apos;re in!</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve joined <span className="font-medium text-foreground">{className}</span>.
              Your teacher can now assign you practice sets.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                placeholder="e.g., ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Joining..." : "Join Class"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="font-medium text-foreground underline">
            Back to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
