"use client";

import { StrikethroughIcon } from "lucide-react";

interface ChoiceCardProps {
  index: number;
  text: string;
  selected: boolean;
  eliminated: boolean;
  revealed: boolean;
  isCorrect: boolean;
  onSelect: () => void;
  onEliminate: () => void;
}

const LABELS = ["A", "B", "C", "D", "E"];

export function ChoiceCard({
  index,
  text,
  selected,
  eliminated,
  revealed,
  isCorrect,
  onSelect,
  onEliminate,
}: ChoiceCardProps) {
  let borderClass = "border-border";
  let bgClass = "bg-background";
  let textClass = "";

  if (revealed) {
    if (isCorrect) {
      borderClass = "border-green-500";
      bgClass = "bg-green-500/10";
    } else if (selected && !isCorrect) {
      borderClass = "border-red-500";
      bgClass = "bg-red-500/10";
    }
  } else if (selected) {
    borderClass = "border-foreground";
    bgClass = "bg-foreground";
    textClass = "text-background";
  }

  return (
    <div className="group flex items-center gap-2">
      <button
        onClick={onSelect}
        disabled={revealed}
        className={`flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${borderClass} ${bgClass} ${textClass} ${
          eliminated && !revealed ? "opacity-40" : ""
        } ${!revealed ? "hover:border-foreground/50" : ""}`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
            selected && !revealed
              ? "border-background/30 text-background"
              : "border-border"
          }`}
        >
          {LABELS[index]}
        </span>
        <span className={eliminated && !revealed ? "line-through" : ""}>
          {text}
        </span>
        {revealed && isCorrect && (
          <span className="ml-auto text-xs font-medium text-green-600">
            Correct
          </span>
        )}
        {revealed && selected && !isCorrect && (
          <span className="ml-auto text-xs font-medium text-red-500">
            Your answer
          </span>
        )}
      </button>
      {!revealed && (
        <button
          onClick={onEliminate}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 ${
            eliminated ? "!opacity-100 bg-secondary" : ""
          }`}
          title="Eliminate option"
        >
          <StrikethroughIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
