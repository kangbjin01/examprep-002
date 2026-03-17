"use client";

import { Eye, EyeOff } from "lucide-react";
import { useMockExam } from "@/lib/mock-exam-store";

export function TimerDisplay() {
  const { timeRemaining, timerVisible, toggleTimer } = useMockExam();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLow = timeRemaining <= 5 * 60;

  return (
    <div className="flex items-center gap-2">
      {timerVisible ? (
        <span
          className={`font-mono text-sm font-medium tabular-nums ${
            isLow ? "text-red-500" : ""
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Timer hidden</span>
      )}
      <button
        onClick={toggleTimer}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title={timerVisible ? "Hide timer" : "Show timer"}
      >
        {timerVisible ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
