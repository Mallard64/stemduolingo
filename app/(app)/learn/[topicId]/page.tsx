"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionShell } from "@/components/questions/question-shell";
import { MCQ } from "@/components/questions/mcq";
import { AnswerFeedback } from "@/components/questions/answer-feedback";
import { useLesson } from "@/lib/store/lesson";
import { useUser } from "@/lib/store/user";
import type { MCQQuestion } from "@/lib/types";

export default function LessonPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId: routeTopicId } = use(params);
  const router = useRouter();
  const hearts = useUser((s) => s.hearts);
  const loseHeart = useUser((s) => s.loseHeart);

  const topicId = useLesson((s) => s.topicId);
  const cache = useLesson((s) => s.cache);
  const currentIndex = useLesson((s) => s.currentIndex);
  const difficulty = useLesson((s) => s.difficulty);
  const expected = useLesson((s) => s.expected);
  const startedAt = useLesson((s) => s.startedAt);
  const startLesson = useLesson((s) => s.startLesson);
  const pushQuestion = useLesson((s) => s.pushQuestion);
  const recordAnswer = useLesson((s) => s.recordAnswer);
  const reset = useLesson((s) => s.reset);

  const requestedRef = useRef<Set<number>>(new Set());
  const [error, setError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [feedback, setFeedback] = useState<
    { correct: boolean; explanation: string | null; wrongReason: string | null } | null
  >(null);

  // Start (or restart) the lesson on mount / topic change; dispose the cache on unmount.
  useEffect(() => {
    requestedRef.current.clear();
    startLesson(routeTopicId, useUser.getState().hearts);
    return () => reset();
  }, [routeTopicId, startLesson, reset]);

  // Generate the question for the current slot if it isn't cached yet.
  useEffect(() => {
    if (!topicId || currentIndex >= expected) return;
    if (cache[currentIndex]) return;
    if (requestedRef.current.has(currentIndex)) return;
    requestedRef.current.add(currentIndex);

    let cancelled = false;
    setError(false);
    fetch("/api/generate-question", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topicId, difficulty, excludeIds: cache.map((c) => c.id) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.question) {
          pushQuestion({ ...d.question, difficulty: d.difficulty, source: d.source });
        } else {
          requestedRef.current.delete(currentIndex);
          setError(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        requestedRef.current.delete(currentIndex);
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [topicId, currentIndex, cache, difficulty, expected, pushQuestion, retryTick]);

  // Terminal states: out of hearts, or all questions answered.
  const outOfHearts = hearts <= 0;
  const lessonDone = !!topicId && currentIndex >= expected;

  // Navigate away in an effect — never call router.replace during render.
  useEffect(() => {
    if (outOfHearts) {
      router.replace(`/learn/${routeTopicId}/failed`);
    } else if (lessonDone) {
      const time = Math.round((Date.now() - startedAt) / 1000);
      router.replace(`/learn/${routeTopicId}/complete?hearts=${hearts}&time=${time}`);
    }
  }, [outOfHearts, lessonDone, router, routeTopicId, hearts, startedAt]);

  if (outOfHearts || lessonDone) return null;

  const q = cache[currentIndex] as (MCQQuestion & { difficulty: number; source: "ai" | "fallback" }) | undefined;

  if (!q) {
    return (
      <QuestionShell index={currentIndex} total={expected}>
        <div className="min-h-[40vh] grid place-items-center text-center">
          {error ? (
            <div>
              <p className="text-ink-muted mb-4">Couldn't load the next question.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  requestedRef.current.delete(currentIndex);
                  setError(false);
                  setRetryTick((t) => t + 1);
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-ink-muted">
              <div className="size-10 rounded-full border-4 border-border border-t-primary animate-spin" />
              <p>Generating your question…</p>
            </div>
          )}
        </div>
      </QuestionShell>
    );
  }

  function handleAnswer(correct: boolean, picked: string) {
    if (!correct) loseHeart();
    setFeedback({
      correct,
      explanation: q!.explanation,
      wrongReason: correct ? null : wrongReasonFor(q!, picked),
    });
  }

  function handleContinue() {
    const correct = feedback?.correct ?? false;
    setFeedback(null);
    recordAnswer(correct);
  }

  return (
    <QuestionShell index={currentIndex} total={expected}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-ink-muted">
          Question {currentIndex + 1} of {expected}
        </h2>
        <span className="badge" title={q.source === "ai" ? "AI-generated" : "Offline question"}>
          {q.source === "fallback" ? "● " : "✨ "}Difficulty {q.difficulty}/10
        </span>
      </div>
      <p className="text-2xl font-semibold mb-8">{q.question_text}</p>

      <MCQ key={q.id} question={q} onAnswer={handleAnswer} disabled={!!feedback} />

      {feedback?.correct && <AutoAdvance onDone={handleContinue} />}
      {feedback && (
        <AnswerFeedback
          correct={feedback.correct}
          explanation={feedback.explanation}
          wrongReason={feedback.wrongReason}
          onContinue={handleContinue}
        />
      )}
    </QuestionShell>
  );
}

function wrongReasonFor(question: MCQQuestion, picked: string): string {
  const selected = question.options.find((o) => o.id === picked)?.text ?? picked;
  const correct = question.options.find((o) => o.id === question.correct_answer.id)?.text;
  return correct
    ? `You picked “${selected}” but the right answer is “${correct}”.`
    : `Your answer was not correct.`;
}

function AutoAdvance({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);
  return null;
}
