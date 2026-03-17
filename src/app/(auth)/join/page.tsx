"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export default function JoinClassPage() {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Invite code must be 6 characters.");
      return;
    }

    // MVP: Just show success. In production, validate against PocketBase.
    setJoined(true);
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
              You&apos;ve joined the class. Your teacher can now assign you practice sets.
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

            <Button type="submit" className="w-full">
              Join Class
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
