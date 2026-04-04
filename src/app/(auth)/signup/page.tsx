"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight">
            ExamPrep
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Registration closed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New sign-ups are currently unavailable.
            <br />
            Please contact your administrator to get an account.
          </p>
        </div>

        <Link href="/login">
          <Button className="w-full">Go to log in</Button>
        </Link>
      </div>
    </div>
  );
}
