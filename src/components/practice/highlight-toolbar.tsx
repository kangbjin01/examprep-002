"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";

interface HighlightToolbarProps {
  position: { x: number; y: number };
  onHighlight: (color: 1 | 2 | 3) => void;
  onAnnotate: (color: 1 | 2 | 3, note: string) => void;
  onClose: () => void;
}

const COLORS: { id: 1 | 2 | 3; light: string; dark: string; label: string }[] = [
  { id: 1, light: "bg-yellow-200", dark: "dark:bg-yellow-900", label: "Yellow" },
  { id: 2, light: "bg-green-200", dark: "dark:bg-green-900", label: "Green" },
  { id: 3, light: "bg-blue-200", dark: "dark:bg-blue-900", label: "Blue" },
];

export function HighlightToolbar({
  position,
  onHighlight,
  onAnnotate,
  onClose,
}: HighlightToolbarProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState<1 | 2 | 3>(1);
  const [note, setNote] = useState("");

  const handleColorClick = (color: 1 | 2 | 3) => {
    if (showNoteInput) {
      setSelectedColor(color);
    } else {
      onHighlight(color);
    }
  };

  const handleAnnotate = () => {
    if (showNoteInput && note.trim()) {
      onAnnotate(selectedColor, note.trim());
      setNote("");
      setShowNoteInput(false);
    } else {
      setShowNoteInput(true);
    }
  };

  return (
    <div
      className="fixed z-50 flex flex-col items-center gap-1"
      style={{ left: position.x, top: position.y - 48 }}
    >
      <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleColorClick(c.id)}
            className={`h-7 w-7 rounded-md ${c.light} ${c.dark} transition-transform hover:scale-110 ${
              showNoteInput && selectedColor === c.id ? "ring-2 ring-foreground ring-offset-1" : ""
            }`}
            title={`Highlight ${c.label}`}
          />
        ))}
        <div className="mx-0.5 h-5 w-px bg-border" />
        <button
          onClick={handleAnnotate}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="Add note"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {showNoteInput && (
        <div className="flex w-64 gap-1.5 rounded-lg border border-border bg-background p-2 shadow-lg">
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAnnotate();
              if (e.key === "Escape") { setShowNoteInput(false); onClose(); }
            }}
            placeholder="Add a note..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAnnotate}
            disabled={!note.trim()}
            className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background disabled:opacity-40"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
