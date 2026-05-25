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
  const [feedback, setFeedback] = useState<
    { correct: boolean; explanation: string | null; wrongReason: string | null } | null
  >(null);

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

  function handleAnswer(correct: boolean, answer: string | string[] | null = null) {
    if (!correct) loseHeart();
    setFeedback({
      correct,
      explanation: q.explanation,
      wrongReason: correct ? null : getWrongReason(q, answer),
    });
  }

  function handleContinue() {
    setFeedback(null);
    next();
  }

  function getWrongReason(question: Question, answer: string | string[] | null): string | null {
    if (question.question_type === "mcq") {
      const picked = typeof answer === "string" ? answer : null;
      const selected = question.options.find((o) => o.id === picked)?.text ?? picked;
      const correct = question.options.find((o) => o.id === question.correct_answer.id)?.text;
      return correct
        ? `You picked “${selected}” but the right answer is “${correct}”.`
        : `Your answer was not correct.`;
    }

    if (question.question_type === "multi") {
      const picked = Array.isArray(answer) ? answer : [];
      const correctIds = new Set(question.correct_answer.ids);
      const wrong = question.options
        .filter((o) => picked.includes(o.id) && !correctIds.has(o.id))
        .map((o) => o.text);
      const missed = question.options
        .filter((o) => correctIds.has(o.id) && !picked.includes(o.id))
        .map((o) => o.text);

      if (wrong.length && missed.length) {
        return `You selected ${wrong.join(", ")} but missed ${missed.join(", ")}.`;
      }
      if (wrong.length) {
        return `You selected ${wrong.join(", ")}, which is incorrect.`;
      }
      if (missed.length) {
        return `You missed ${missed.join(", ")}.`;
      }
      return `Your selection was not quite right.`;
    }

    if (question.question_type === "order") {
      const correctOrder = question.correct_answer.ordered_ids
        .map((id) => question.options.find((o) => o.id === id)?.text)
        .filter(Boolean);
      return `Your sequence is out of order. The correct order is ${correctOrder.join(" → ")}.`;
    }

    if (question.question_type === "fill") {
      const value = typeof answer === "string" ? answer : "";
      const correct = question.correct_answer.accepted[0];
      return `You answered “${value}”. The correct answer is “${correct}”.`;
    }

    return null;
  }

  return (
    <QuestionShell index={currentIndex} total={questions.length}>
      <h2 className="text-xs uppercase tracking-wider text-ink-muted mb-3">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="text-2xl font-semibold mb-8">{q.question_text}</p>

      {q.question_type === "mcq" && (
        <MCQ key={q.id} question={q} onAnswer={(c, id) => handleAnswer(c, id)} disabled={!!feedback} />
      )}
      {q.question_type === "multi" && (
        <Multi key={q.id} question={q} onAnswer={(c, picked) => handleAnswer(c, picked)} disabled={!!feedback} />
      )}
      {q.question_type === "order" && (
        <OrderQ key={q.id} question={q} onAnswer={(c, order) => handleAnswer(c, order)} disabled={!!feedback} />
      )}
      {q.question_type === "fill" && (
        <Fill key={q.id} question={q} onAnswer={(c, value) => handleAnswer(c, value)} disabled={!!feedback} />
      )}

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

function AutoAdvance({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 700);
    return () => clearTimeout(t);
  }, [onDone]);
  return null;
}
