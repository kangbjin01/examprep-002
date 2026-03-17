"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkX, RotateCcw } from "lucide-react";
import { useStats } from "@/lib/stats-store";
import { getQuestionById } from "@/lib/questions";

function QuestionCard({
  questionId,
  extra,
  action,
}: {
  questionId: string;
  extra?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const question = getQuestionById(questionId);
  if (!question) return null;

  return (
    <Card className="shadow-none">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs uppercase">
                {question.exam}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {question.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {question.section} &middot; {question.type}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {question.question}
            </p>
            {extra}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export default function QuestionBankPage() {
  const { bookmarks, removeBookmark, getWrongAttempts } = useStats();

  const wrongAttempts = useMemo(() => {
    const seen = new Set<string>();
    return getWrongAttempts()
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((a) => {
        if (seen.has(a.questionId)) return false;
        seen.add(a.questionId);
        return true;
      });
  }, [getWrongAttempts]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
        <p className="mt-1 text-muted-foreground">
          Review bookmarked questions and your wrong answers.
        </p>
      </div>

      <Tabs defaultValue="bookmarks">
        <TabsList>
          <TabsTrigger value="bookmarks">
            Bookmarks
            {bookmarks.length > 0 && (
              <span className="ml-1.5 font-mono text-xs">
                ({bookmarks.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="wrong">
            Wrong Answers
            {wrongAttempts.length > 0 && (
              <span className="ml-1.5 font-mono text-xs">
                ({wrongAttempts.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="mt-4">
          {bookmarks.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                No bookmarked questions yet. Save questions during practice to
                review them later.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookmarks
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((b) => (
                  <QuestionCard
                    key={b.questionId}
                    questionId={b.questionId}
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookmark(b.questionId)}
                        className="text-muted-foreground shrink-0"
                        title="Remove bookmark"
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    }
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wrong" className="mt-4">
          {wrongAttempts.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-center py-20 text-sm text-muted-foreground">
                No wrong answers recorded yet. Start practicing to track your
                mistakes.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {wrongAttempts.map((a) => (
                <QuestionCard
                  key={a.questionId}
                  questionId={a.questionId}
                  extra={
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  }
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground shrink-0"
                      title="Retry"
                      disabled
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
