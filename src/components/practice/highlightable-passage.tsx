"use client";

import { useCallback, useRef, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { useHighlights, type Highlight } from "@/lib/highlight-store";
import { HighlightToolbar } from "./highlight-toolbar";
import { FormattedText } from "./formatted-text";

const COLOR_CLASSES: Record<number, string> = {
  1: "bg-yellow-200/60 dark:bg-yellow-900/40",
  2: "bg-green-200/60 dark:bg-green-900/40",
  3: "bg-blue-200/60 dark:bg-blue-900/40",
};

interface HighlightablePassageProps {
  questionId: string;
  text: string;
}

export function HighlightablePassage({
  questionId,
  text,
}: HighlightablePassageProps) {
  const passageRef = useRef<HTMLDivElement>(null);
  const { addHighlight, removeHighlight, getHighlights } = useHighlights();
  const highlights = getHighlights(questionId);

  const [toolbar, setToolbar] = useState<{
    x: number;
    y: number;
    start: number;
    end: number;
    selectedText: string;
  } | null>(null);

  const [activeNote, setActiveNote] = useState<string | null>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !passageRef.current) {
      return;
    }

    const range = sel.getRangeAt(0);
    const passageEl = passageRef.current;

    // Calculate offsets relative to the plain text
    const preRange = document.createRange();
    preRange.selectNodeContents(passageEl);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + range.toString().length;

    if (end - start < 1) return;

    const rect = range.getBoundingClientRect();
    setToolbar({
      x: rect.left + rect.width / 2 - 80,
      y: rect.top,
      start,
      end,
      selectedText: range.toString(),
    });
  }, []);

  const handleHighlight = (color: 1 | 2 | 3) => {
    if (!toolbar) return;
    addHighlight(questionId, {
      questionId,
      color,
      startOffset: toolbar.start,
      endOffset: toolbar.end,
      text: toolbar.selectedText,
      note: "",
    });
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  };

  const handleAnnotate = (color: 1 | 2 | 3, note: string) => {
    if (!toolbar) return;
    addHighlight(questionId, {
      questionId,
      color,
      startOffset: toolbar.start,
      endOffset: toolbar.end,
      text: toolbar.selectedText,
      note,
    });
    window.getSelection()?.removeAllRanges();
    setToolbar(null);
  };

  // Render text with highlights applied
  const renderHighlightedText = () => {
    if (highlights.length === 0) {
      return <FormattedText text={text} />;
    }

    // Sort highlights by startOffset
    const sorted = [...highlights].sort(
      (a, b) => a.startOffset - b.startOffset
    );

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((hl) => {
      // Skip overlapping highlights
      if (hl.startOffset < cursor) return;

      // Text before highlight
      if (hl.startOffset > cursor) {
        parts.push(
          <FormattedText key={`t-${cursor}`} text={text.slice(cursor, hl.startOffset)} />
        );
      }

      // Highlighted text
      parts.push(
        <span
          key={hl.id}
          className={`${COLOR_CLASSES[hl.color]} rounded-sm cursor-pointer relative group`}
          onClick={() => setActiveNote(activeNote === hl.id ? null : hl.id)}
        >
          <FormattedText text={text.slice(hl.startOffset, hl.endOffset)} />
          {hl.note && (
            <MessageSquare className="inline-block ml-0.5 h-3 w-3 text-muted-foreground" />
          )}
          {activeNote === hl.id && (
            <span
              className="absolute left-0 top-full mt-1 z-10 w-56 rounded-lg border border-border bg-background p-3 shadow-lg text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {hl.note && (
                <span className="block text-foreground mb-2 leading-relaxed">
                  {hl.note}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeHighlight(questionId, hl.id);
                  setActiveNote(null);
                }}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </span>
          )}
        </span>
      );

      cursor = hl.endOffset;
    });

    // Remaining text
    if (cursor < text.length) {
      parts.push(<FormattedText key={`t-${cursor}`} text={text.slice(cursor)} />);
    }

    return <>{parts}</>;
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground">Passage</p>
      <div
        ref={passageRef}
        onMouseUp={handleMouseUp}
        className="text-sm leading-relaxed whitespace-pre-line select-text cursor-text"
      >
        {renderHighlightedText()}
      </div>

      {toolbar && (
        <HighlightToolbar
          position={{ x: toolbar.x, y: toolbar.y }}
          onHighlight={handleHighlight}
          onAnnotate={handleAnnotate}
          onClose={() => {
            window.getSelection()?.removeAllRanges();
            setToolbar(null);
          }}
        />
      )}
    </div>
  );
}
