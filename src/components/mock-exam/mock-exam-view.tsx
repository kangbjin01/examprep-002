"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockExam } from "@/lib/mock-exam-store";
import { splitPassageAndPrompt } from "@/lib/utils";
import { SplitPane } from "@/components/practice/split-pane";
import { ChoiceCard } from "@/components/practice/choice-card";
import { HighlightablePassage } from "@/components/practice/highlightable-passage";
import { LineReader } from "@/components/practice/line-reader";
import { TimerDisplay } from "./timer-display";
import { ReviewScreen } from "./review-screen";
import type { Question } from "@/types";

interface MockExamViewProps {
  sectionName: string;
  onFinish: () => void;
}

export function MockExamView({ sectionName, onFinish }: MockExamViewProps) {
  const {
    questions,
    currentIndex,
    answers,
    eliminated,
    isFinished,
    showReview,
    goNext,
    goBack,
    selectAnswer,
    toggleEliminate,
    toggleFlag,
    openReview,
    closeReview,
    submit,
    isFlagged,
    isAnswered,
  } = useMockExam();

  const [confirming, setConfirming] = useState(false);
  const [lineReaderActive, setLineReaderActive] = useState(false);

  const question: Question | undefined = questions[currentIndex];
  if (!question) return null;

  const selectedAnswer = answers[currentIndex];
  const eliminatedChoices = eliminated[currentIndex] || [];
  const flagged = isFlagged(currentIndex);
  const isSAT = question.exam === "sat";
  const { passageText, promptText } = splitPassageAndPrompt(question);
  const hasPassage = isSAT || !!question.passage;

  const handleSubmit = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    submit();
    onFinish();
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      openReview();
    } else {
      goNext();
    }
  };

  const questionContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <button
          onClick={toggleFlag}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
            flagged
              ? "bg-orange-500/10 text-orange-500"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {flagged ? (
            <BookmarkCheck className="h-3.5 w-3.5" />
          ) : (
            <Bookmark className="h-3.5 w-3.5" />
          )}
          {flagged ? "Flagged" : "Flag"}
        </button>
      </div>

      <p className="text-base font-medium leading-relaxed">
        {isSAT ? (promptText || question.question) : question.question}
      </p>

      <div className="space-y-2">
        {question.choices.map((choice, i) => (
          <ChoiceCard
            key={i}
            index={i}
            text={choice}
            selected={selectedAnswer === i}
            eliminated={eliminatedChoices.includes(i)}
            revealed={false}
            isCorrect={false}
            onSelect={() => selectAnswer(i)}
            onEliminate={() => toggleEliminate(i)}
          />
        ))}
      </div>

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="gap-1.5"
        >
          {currentIndex === questions.length - 1 ? "Review" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const passageContent = (
    <HighlightablePassage questionId={question.id} text={isSAT ? passageText : (question.passage || "")} />
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
        <span className="text-sm font-medium">{sectionName}</span>
        <TimerDisplay />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => setLineReaderActive(!lineReaderActive)}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              lineReaderActive ? "bg-foreground text-background" : "hover:text-foreground"
            }`}
            title="Line Reader"
          >
            <ScanLine className="h-3.5 w-3.5" />
          </button>
          <span>Mock Exam</span>
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
      <div className="flex items-center justify-between border-t border-border bg-background px-4 py-2.5">
        <button
          onClick={openReview}
          className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
        >
          Question {currentIndex + 1} of {questions.length}
        </button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirming(true)}
          className="gap-1.5 text-xs"
        >
          Submit Exam
        </Button>
      </div>

      {/* Review screen overlay */}
      {showReview && (
        <ReviewScreen
          onSubmit={handleSubmit}
          onClose={closeReview}
        />
      )}

      {/* Confirm dialog */}
      {confirming && !showReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Submit Exam?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Once submitted, you cannot change your answers. Are you sure?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => { submit(); onFinish(); }}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
