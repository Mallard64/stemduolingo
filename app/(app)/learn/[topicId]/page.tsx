"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionShell } from "@/components/questions/question-shell";
import { MCQ } from "@/components/questions/mcq";
import { Multi } from "@/components/questions/multi";
import { OrderQ } from "@/components/questions/order";
import { Fill } from "@/components/questions/fill";
import { AnswerFeedback } from "@/components/questions/answer-feedback";
import { useLesson } from "@/lib/store/lesson";
import { useUser } from "@/lib/store/user";
import type { Question } from "@/lib/types";

export default function LessonPage({ params }: { params: { topicId: string } }) {
  const router = useRouter();
  const hearts = useUser((s) => s.hearts);
  const loseHeart = useUser((s) => s.loseHeart);

  const { questions, currentIndex, startedAt, startLesson, next } = useLesson();

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/topics/${params.topicId}/lesson`)
      .then((r) => r.json())
      .then((d: { questions: Question[] }) => {
        if (!cancelled) {
          startLesson(params.topicId, d.questions, 5);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params.topicId, startLesson]);

  if (loading || !questions.length) {
    return <div className="min-h-screen grid place-items-center text-ink-muted">Loading lesson…</div>;
  }

  if (currentIndex >= questions.length) {
    const time = Math.round((Date.now() - startedAt) / 1000);
    router.replace(`/learn/${params.topicId}/complete?hearts=${hearts}&time=${time}`);
    return null;
  }

  if (hearts <= 0) {
    router.replace(`/learn/${params.topicId}/failed`);
    return null;
  }

  const q = questions[currentIndex];

  function handleAnswer(correct: boolean) {
    if (!correct) loseHeart();
    setFeedback({ correct, explanation: q.explanation });
  }

  function handleContinue() {
    setFeedback(null);
    next();
  }

  return (
    <QuestionShell index={currentIndex} total={questions.length}>
      <h2 className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="text-2xl font-semibold mb-8">{q.question_text}</p>

      {q.question_type === "mcq" && (
        <MCQ key={q.id} question={q} onAnswer={(c) => handleAnswer(c)} disabled={!!feedback} />
      )}
      {q.question_type === "multi" && (
        <Multi key={q.id} question={q} onAnswer={(c) => handleAnswer(c)} disabled={!!feedback} />
      )}
      {q.question_type === "order" && (
        <OrderQ key={q.id} question={q} onAnswer={(c) => handleAnswer(c)} disabled={!!feedback} />
      )}
      {q.question_type === "fill" && (
        <Fill key={q.id} question={q} onAnswer={(c) => handleAnswer(c)} disabled={!!feedback} />
      )}

      {feedback?.correct && <AutoAdvance onDone={handleContinue} />}
      {feedback && (
        <AnswerFeedback
          correct={feedback.correct}
          explanation={feedback.correct ? null : feedback.explanation}
          onContinue={handleContinue}
        />
      )}
    </QuestionShell>
  );
}

function AutoAdvance({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);
  return null;
}
