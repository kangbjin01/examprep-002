"use client";

import { useState, useEffect } from "react";
import { StickyNote, Check, X, Edit2, Trash2 } from "lucide-react";
import { useNotes, useIsTeacher } from "@/lib/notes-store";

interface NoteEditorProps {
  questionId: string;
  choiceIndex?: number; // undefined = question-level, 0-3 = choice-level
  compact?: boolean; // smaller UI for choice notes
}

export function NoteEditor({ questionId, choiceIndex, compact = false }: NoteEditorProps) {
  const isTeacher = useIsTeacher();
  const {
    questionNotes,
    choiceNotes,
    saveQuestionNote,
    deleteQuestionNote,
    saveChoiceNote,
    deleteChoiceNote,
  } = useNotes();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Get my own note
  const myNote =
    choiceIndex !== undefined
      ? choiceNotes[`${questionId}-${choiceIndex}`]?.[isTeacher ? "teacher" : "student"]
      : questionNotes[questionId]?.[isTeacher ? "teacher" : "student"];

  // Get the other party's note (teacher sees student's, student sees teacher's)
  const otherNote =
    choiceIndex !== undefined
      ? choiceNotes[`${questionId}-${choiceIndex}`]?.[isTeacher ? "student" : "teacher"]
      : questionNotes[questionId]?.[isTeacher ? "student" : "teacher"];

  useEffect(() => {
    setDraft(myNote?.content || "");
  }, [myNote?.content]);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      if (choiceIndex !== undefined) {
        await saveChoiceNote(questionId, choiceIndex, draft.trim());
      } else {
        await saveQuestionNote(questionId, draft.trim());
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("메모를 삭제하시겠어요?")) return;
    if (choiceIndex !== undefined) {
      await deleteChoiceNote(questionId, choiceIndex);
    } else {
      await deleteQuestionNote(questionId);
    }
    setDraft("");
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(myNote?.content || "");
    setEditing(false);
  };

  const textAreaClasses = compact
    ? "w-full min-h-[60px] rounded-md border border-border bg-background p-2 text-xs resize-y"
    : "w-full min-h-[100px] rounded-md border border-border bg-background p-2.5 text-sm resize-y";

  const roleLabel = isTeacher ? "선생님 메모" : "내 메모";
  const otherRoleLabel = isTeacher ? "학생 메모" : "선생님 메모";

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {/* My own note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <StickyNote className="h-3 w-3" />
            <span>{roleLabel}</span>
          </div>
          {myNote && !editing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="편집"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                title="삭제"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {editing || !myNote ? (
          <div className="space-y-1.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                choiceIndex !== undefined
                  ? "이 선택지에 대한 메모..."
                  : "이 문제에 대한 메모..."
              }
              className={textAreaClasses}
              autoFocus={editing}
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                disabled={!draft.trim() || saving}
                className="flex items-center gap-1 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                저장
              </button>
              {myNote && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                  취소
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditing(true)}
            className={
              compact
                ? "cursor-pointer rounded-md border border-border bg-muted/30 p-2 text-xs leading-relaxed whitespace-pre-wrap hover:bg-muted/50"
                : "cursor-pointer rounded-md border border-border bg-muted/30 p-2.5 text-sm leading-relaxed whitespace-pre-wrap hover:bg-muted/50"
            }
          >
            {myNote.content}
          </div>
        )}
      </div>

      {/* Other party's note (read-only) */}
      {otherNote && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <StickyNote className={`h-3 w-3 ${isTeacher ? "text-blue-500" : "text-amber-600"}`} />
            <span className={isTeacher ? "text-blue-500" : "text-amber-600"}>
              {otherRoleLabel}
            </span>
          </div>
          <div
            className={
              compact
                ? `rounded-md border p-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    isTeacher ? "border-blue-500/20 bg-blue-500/5" : "border-amber-500/20 bg-amber-500/5"
                  }`
                : `rounded-md border p-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    isTeacher ? "border-blue-500/20 bg-blue-500/5" : "border-amber-500/20 bg-amber-500/5"
                  }`
            }
          >
            {otherNote.content}
          </div>
        </div>
      )}
    </div>
  );
}
