"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Eye,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePractice } from "@/lib/practice-store";
import { useStats } from "@/lib/stats-store";
import { useNotes } from "@/lib/notes-store";
import type { AnswerChange, ErrorType, InactivityEvent } from "@/lib/stats-store";
import { splitPassageAndPrompt } from "@/lib/utils";
import { SplitPane } from "./split-pane";
import { ChoiceCard } from "./choice-card";
import { QuestionNavigator } from "./question-navigator";
import { HighlightablePassage } from "./highlightable-passage";
import { LineReader } from "./line-reader";
import { NoteEditor } from "./note-editor";
import { FormattedText } from "./formatted-text";
import type { Question } from "@/types";

const ERROR_TYPE_OPTIONS: { value: ErrorType; label: string }[] = [
  { value: "careless", label: "Careless mistake" },
  { value: "misread_passage", label: "Misread the passage" },
  { value: "vocabulary", label: "Didn't know the word" },
  { value: "grammar_rule", label: "Didn't know the grammar rule" },
  { value: "conceptual_gap", label: "Didn't understand the concept" },
  { value: "time_pressure", label: "Rushed / time pressure" },
  { value: "trap_answer", label: "Fell for a trap answer" },
  { value: "overthinking", label: "Overthought it" },
];

const CONFIDENCE_LABELS = ["Guessing", "Not sure", "Somewhat sure", "Confident", "Certain"];

interface PracticeViewProps {
  sectionName: string;
}

export function PracticeView({ sectionName }: PracticeViewProps) {
  const {
    questions,
    currentIndex,
    answers,
    eliminated,
    goNext,
    goBack,
    selectAnswer,
    toggleEliminate,
    toggleFlag,
    revealAnswer,
    isAnswered,
    isFlagged,
    isRevealed,
  } = usePractice();

  const { addAttempt, addBookmark, removeBookmark, isBookmarked } = useStats();
  const { loadNotes } = useNotes();
  const [showNavigator, setShowNavigator] = useState(false);
  const [lineReaderActive, setLineReaderActive] = useState(false);
  const [expandedChoiceNotes, setExpandedChoiceNotes] = useState<Set<number>>(new Set());
  const [startTime] = useState(() => Date.now());

  // Confidence rating state (shown before reveal)
  const [showConfidence, setShowConfidence] = useState(false);
  const [confidence, setConfidence] = useState(0);

  // Error type state (shown after wrong answer reveal)
  const [showErrorPicker, setShowErrorPicker] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState<ErrorType>("");

  // Data tracking refs
  const answerChangesRef = useRef<Map<number, AnswerChange[]>>(new Map());
  const firstInteractionRef = useRef<Map<number, number>>(new Map());
  const choiceSelectionOrderRef = useRef<Map<number, { choice: number; timestamp: number }[]>>(new Map());
  const choiceHoverStartRef = useRef<Map<string, number>>(new Map());
  const choiceHoverTimesRef = useRef<Map<number, { A: number; B: number; C: number; D: number }>>(new Map());
  const explanationRevealTimeRef = useRef<Map<number, number>>(new Map());
  const lastActivityRef = useRef(Date.now());
  const inactivityEventsRef = useRef<InactivityEvent[]>([]);
  const pendingAttemptRef = useRef<Parameters<typeof addAttempt>[0] | null>(null);

  // Inactivity detection (30s threshold)
  useEffect(() => {
    const THRESHOLD = 30000;
    let inactiveStart: number | null = null;

    const handleActivity = () => {
      const now = Date.now();
      if (inactiveStart && now - inactiveStart >= THRESHOLD) {
        inactivityEventsRef.current.push({
          start: inactiveStart,
          end: now,
          duration: now - inactiveStart,
        });
      }
      inactiveStart = null;
      lastActivityRef.current = now;
    };

    const checkInactivity = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= THRESHOLD && !inactiveStart) {
        inactiveStart = lastActivityRef.current;
      }
    }, 5000);

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity, true);

    return () => {
      clearInterval(checkInactivity);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity, true);
    };
  }, []);

  const question: Question | undefined = questions[currentIndex];

  // Load notes whenever current question changes
  useEffect(() => {
    if (question?.id) {
      loadNotes(question.id);
      setExpandedChoiceNotes(new Set());
    }
  }, [question?.id, loadNotes]);

  if (!question) return null;

  const selectedAnswer = answers[currentIndex];
  const eliminatedChoices = eliminated[currentIndex] || [];
  const flagged = isFlagged(currentIndex);
  const revealed = isRevealed(currentIndex);
  const bookmarked = isBookmarked(question.id);
  const isSAT = question.exam === "sat";
  const { passageText, promptText } = splitPassageAndPrompt(question);
  const hasPassage = isSAT || !!question.passage;

  // Track answer selection with changes and order
  const handleSelectAnswer = useCallback(
    (choiceIndex: number) => {
      const prev = answers[currentIndex];

      // Track answer changes
      if (prev !== undefined && prev !== choiceIndex) {
        const changes = answerChangesRef.current.get(currentIndex) || [];
        changes.push({ from: prev, to: choiceIndex, timestamp: Date.now() });
        answerChangesRef.current.set(currentIndex, changes);
      }

      // Track selection order
      const order = choiceSelectionOrderRef.current.get(currentIndex) || [];
      order.push({ choice: choiceIndex, timestamp: Date.now() });
      choiceSelectionOrderRef.current.set(currentIndex, order);

      // Track first interaction time (passage read time proxy)
      if (!firstInteractionRef.current.has(currentIndex)) {
        firstInteractionRef.current.set(currentIndex, Date.now() - startTime);
      }

      lastActivityRef.current = Date.now();
      selectAnswer(choiceIndex);
    },
    [answers, currentIndex, selectAnswer, startTime]
  );

  // Track choice hover times
  const handleChoiceHoverStart = useCallback(
    (choiceIndex: number) => {
      choiceHoverStartRef.current.set(`${currentIndex}-${choiceIndex}`, Date.now());
    },
    [currentIndex]
  );

  const handleChoiceHoverEnd = useCallback(
    (choiceIndex: number) => {
      const key = `${currentIndex}-${choiceIndex}`;
      const start = choiceHoverStartRef.current.get(key);
      if (start) {
        const duration = Date.now() - start;
        const times = choiceHoverTimesRef.current.get(currentIndex) || { A: 0, B: 0, C: 0, D: 0 };
        const labels = ["A", "B", "C", "D"] as const;
        times[labels[choiceIndex]] += duration;
        choiceHoverTimesRef.current.set(currentIndex, times);
        choiceHoverStartRef.current.delete(key);
      }
    },
    [currentIndex]
  );

  // Step 1: Click "Check Answer" → show confidence picker
  const handleCheckClick = () => {
    setShowConfidence(true);
    setConfidence(0);
  };

  // Step 2: Submit confidence → reveal answer
  const handleConfidenceSubmit = () => {
    setShowConfidence(false);
    revealAnswer();
    explanationRevealTimeRef.current.set(currentIndex, Date.now());

    const isCorrect = selectedAnswer === question.answer;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    const attempt: Parameters<typeof addAttempt>[0] = {
      questionId: question.id,
      exam: question.exam,
      section: question.section,
      type: question.type,
      difficulty: question.difficulty,
      isCorrect,
      selectedAnswer: selectedAnswer ?? -1,
      timeSpent,
      timestamp: Date.now(),
      examSet: question.examSet || "",
      mode: "practice",
      eliminated: eliminatedChoices,
      flagged,
      revealed: true,
      answerChanges: answerChangesRef.current.get(currentIndex) || [],
      passageReadTime: Math.round((firstInteractionRef.current.get(currentIndex) || 0) / 1000),
      moduleNumber: question.type?.includes("m1") ? 1 : question.type?.includes("m2") ? 2 : 0,
      selfRatedConfidence: confidence,
      choiceHoverTimes: choiceHoverTimesRef.current.get(currentIndex),
      choiceSelectionOrder: choiceSelectionOrderRef.current.get(currentIndex) || [],
      inactivityEvents: inactivityEventsRef.current,
    };

    if (!isCorrect) {
      // Show error type picker for wrong answers
      pendingAttemptRef.current = attempt;
      setShowErrorPicker(true);
    } else {
      addAttempt(attempt);
    }
  };

  // Step 3: Submit error type (wrong answers only)
  const handleErrorSubmit = (errorType: ErrorType) => {
    setShowErrorPicker(false);
    setSelectedErrorType(errorType);
    if (pendingAttemptRef.current) {
      addAttempt({
        ...pendingAttemptRef.current,
        errorType,
      });
      pendingAttemptRef.current = null;
    }
  };

  const handleSkipError = () => {
    setShowErrorPicker(false);
    if (pendingAttemptRef.current) {
      addAttempt(pendingAttemptRef.current);
      pendingAttemptRef.current = null;
    }
  };

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(question.id);
    } else {
      addBookmark(question.id);
    }
  };

  const questionContent = (
    <div className="space-y-5">
      {/* Mark for Review */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
              bookmarked
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            {bookmarked ? "Saved" : "Save"}
          </button>
          <button
            onClick={toggleFlag}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
              flagged
                ? "bg-orange-500/10 text-orange-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                flagged ? "bg-orange-500" : "bg-muted-foreground/40"
              }`}
            />
            {flagged ? "Flagged" : "Flag"}
          </button>
        </div>
      </div>

      {/* Question text */}
      <p className="text-base font-medium leading-relaxed">
        <FormattedText text={isSAT ? promptText || question.question : question.question} />
      </p>

      {/* Choices */}
      <div className="space-y-2">
        {question.choices.map((choice, i) => (
          <div
            key={i}
            onMouseEnter={() => handleChoiceHoverStart(i)}
            onMouseLeave={() => handleChoiceHoverEnd(i)}
          >
            <ChoiceCard
              index={i}
              text={choice}
              selected={selectedAnswer === i}
              eliminated={eliminatedChoices.includes(i)}
              revealed={revealed}
              isCorrect={i === question.answer}
              onSelect={() => handleSelectAnswer(i)}
              onEliminate={() => toggleEliminate(i)}
            />
            {revealed && (
              <div className="mt-1.5">
                <button
                  onClick={() => {
                    setExpandedChoiceNotes((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    });
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  {expandedChoiceNotes.has(i) ? "▼ 선택지 메모 접기" : "▶ 선택지 메모"}
                </button>
                {expandedChoiceNotes.has(i) && (
                  <div className="mt-1.5 pl-2 border-l-2 border-border">
                    <NoteEditor questionId={question.id} choiceIndex={i} compact />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confidence picker (before reveal) */}
      {showConfidence && (
        <div className="rounded-lg border border-border bg-muted p-4 space-y-3">
          <p className="text-sm font-medium">How confident are you?</p>
          <div className="flex gap-1">
            {CONFIDENCE_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => setConfidence(i + 1)}
                className={`flex-1 rounded-md px-2 py-2 text-xs transition-colors ${
                  confidence === i + 1
                    ? "bg-foreground text-background"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={handleConfidenceSubmit}
            disabled={confidence === 0}
            className="w-full"
          >
            Reveal Answer
          </Button>
        </div>
      )}

      {/* Error type picker (after wrong answer) */}
      {showErrorPicker && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
          <p className="text-sm font-medium">Why did you get it wrong?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ERROR_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleErrorSubmit(opt.value)}
                className="rounded-md border border-border px-3 py-2 text-xs text-left hover:bg-secondary transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSkipError}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
        </div>
      )}

      {/* Back / Next */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          disabled={currentIndex === 0}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {!revealed && !showConfidence && isAnswered(currentIndex) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckClick}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Check Answer
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={goNext}
          disabled={currentIndex === questions.length - 1}
          className="gap-1.5"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Explanation */}
      {revealed && !showErrorPicker && question.explanation && (
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Explanation
          </p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Question-level notes */}
      {revealed && !showErrorPicker && (
        <div className="rounded-lg border border-border p-4">
          <NoteEditor questionId={question.id} />
        </div>
      )}
    </div>
  );

  const passageContent = (
    <HighlightablePassage
      questionId={question.id}
      text={isSAT ? passageText : question.passage || ""}
    />
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
        <span className="text-sm font-medium">{sectionName}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => setLineReaderActive(!lineReaderActive)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              lineReaderActive
                ? "bg-foreground text-background"
                : "hover:text-foreground"
            }`}
            title="Line Reader"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Line Reader
          </button>
          <span className="text-muted-foreground">|</span>
          <span>Practice Mode</span>
        </div>
      </div>

      <LineReader active={lineReaderActive} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {hasPassage ? (
          <SplitPane left={passageContent} right={questionContent} />
        ) : (
          <div className="mx-auto max-w-2xl overflow-y-auto p-6">
            {questionContent}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center border-t border-border bg-background px-4 py-2.5">
        <button
          onClick={() => setShowNavigator(true)}
          className="rounded-md bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
        >
          Question {currentIndex + 1} of {questions.length}
        </button>
      </div>

      {/* Navigator overlay */}
      {showNavigator && (
        <QuestionNavigator onClose={() => setShowNavigator(false)} />
      )}
    </div>
  );
}
