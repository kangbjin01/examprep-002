"use client";

import { Bookmark, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockExam } from "@/lib/mock-exam-store";

interface ReviewScreenProps {
  onSubmit: () => void;
  onClose: () => void;
}

export function ReviewScreen({ onSubmit, onClose }: ReviewScreenProps) {
  const {
    questions,
    currentIndex,
    goTo,
    isAnswered,
    isFlagged,
    answeredCount,
    unansweredCount,
    isFinished,
  } = useMockExam();

  const handleGoTo = (index: number) => {
    goTo(index);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">
          {isFinished ? "Time\u2019s Up" : "Review Your Answers"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {answeredCount()} of {questions.length} answered
          {unansweredCount() > 0 && (
            <span className="text-red-500">
              {" "}
              ({unansweredCount()} unanswered)
            </span>
          )}
        </p>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-5 gap-2">
          {questions.map((_, index) => {
            const answered = isAnswered(index);
            const flagged = isFlagged(index);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={index}
                onClick={() => handleGoTo(index)}
                disabled={isFinished}
                className={`relative flex h-11 w-full items-center justify-center rounded-lg border text-sm font-mono font-medium transition-colors
                  ${isCurrent ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}
                  ${answered ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border"}
                  ${!isFinished ? "hover:bg-secondary" : ""}
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

        {/* Legend */}
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

        {/* Actions */}
        {!isFinished && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Continue Exam
            </Button>
            <div className="flex items-center gap-3">
              {unansweredCount() > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {unansweredCount()} unanswered
                </span>
              )}
              <Button size="sm" onClick={onSubmit}>
                Submit Exam
              </Button>
            </div>
          </div>
        )}

        {isFinished && (
          <div className="mt-6 flex justify-end">
            <Button size="sm" onClick={onSubmit}>
              View Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
