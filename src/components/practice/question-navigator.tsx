"use client";

import { Bookmark } from "lucide-react";
import { usePractice } from "@/lib/practice-store";

interface QuestionNavigatorProps {
  onClose: () => void;
}

export function QuestionNavigator({ onClose }: QuestionNavigatorProps) {
  const { questions, currentIndex, goTo, isAnswered, isFlagged } =
    usePractice();

  const handleSelect = (index: number) => {
    goTo(index);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Question Navigator</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {Object.keys(usePractice.getState().answers).length} of{" "}
          {questions.length} answered
        </p>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            const answered = isAnswered(index);
            const flagged = isFlagged(index);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`relative flex h-11 w-full items-center justify-center rounded-lg border text-sm font-mono font-medium transition-colors
                  ${isCurrent ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}
                  ${answered ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:bg-secondary"}
                `}
              >
                {index + 1}
                {flagged && (
                  <Bookmark className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-foreground bg-foreground" />
            Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-border" />
            Unanswered
          </span>
          <span className="flex items-center gap-1.5">
            <Bookmark className="h-3 w-3 fill-orange-500 text-orange-500" />
            Flagged
          </span>
        </div>
      </div>
    </div>
  );
}
