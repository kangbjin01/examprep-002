"use client";

import { useState } from "react";
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
import { SplitPane } from "./split-pane";
import { ChoiceCard } from "./choice-card";
import { QuestionNavigator } from "./question-navigator";
import { HighlightablePassage } from "./highlightable-passage";
import { LineReader } from "./line-reader";
import type { Question } from "@/types";

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
  const [showNavigator, setShowNavigator] = useState(false);
  const [lineReaderActive, setLineReaderActive] = useState(false);
  const [startTime] = useState(() => Date.now());

  const question: Question | undefined = questions[currentIndex];
  if (!question) return null;

  const selectedAnswer = answers[currentIndex];
  const eliminatedChoices = eliminated[currentIndex] || [];
  const flagged = isFlagged(currentIndex);
  const revealed = isRevealed(currentIndex);
  const bookmarked = isBookmarked(question.id);
  const hasPassage = !!question.passage;

  const handleReveal = () => {
    revealAnswer();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    addAttempt({
      questionId: question.id,
      exam: question.exam,
      section: question.section,
      type: question.type,
      difficulty: question.difficulty,
      isCorrect: selectedAnswer === question.answer,
      timeSpent,
      timestamp: Date.now(),
    });
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
            <span className={`inline-block h-2 w-2 rounded-full ${flagged ? "bg-orange-500" : "bg-muted-foreground/40"}`} />
            {flagged ? "Flagged" : "Flag"}
          </button>
        </div>
      </div>

      {/* Question text */}
      <p className="text-base font-medium leading-relaxed">
        {question.question}
      </p>

      {/* Choices */}
      <div className="space-y-2">
        {question.choices.map((choice, i) => (
          <ChoiceCard
            key={i}
            index={i}
            text={choice}
            selected={selectedAnswer === i}
            eliminated={eliminatedChoices.includes(i)}
            revealed={revealed}
            isCorrect={i === question.answer}
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

        {!revealed && isAnswered(currentIndex) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReveal}
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
      {revealed && (
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Explanation
          </p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );

  const passageContent = (
    <HighlightablePassage questionId={question.id} text={question.passage || ""} />
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
              lineReaderActive ? "bg-foreground text-background" : "hover:text-foreground"
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
