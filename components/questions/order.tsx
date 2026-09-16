"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { OrderQuestion } from "@/lib/types";

export function OrderQ({
  question,
  onAnswer,
  disabled,
}: {
  question: OrderQuestion;
  onAnswer: (correct: boolean, order: string[]) => void;
  disabled: boolean;
}) {
  const shuffled = useMemo(() => {
    return [...question.options].sort(() => 0.5 - Math.random());
  }, [question.id]);

  const [order, setOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const remaining = shuffled.filter((o) => !order.includes(o.id));

  function pick(id: string) {
    if (submitted) return;
    setOrder((s) => [...s, id]);
  }

  function unpick(id: string) {
    if (submitted) return;
    setOrder((s) => s.filter((x) => x !== id));
  }

  function submit() {
    setSubmitted(true);
    const correct = order.join(",") === question.correct_answer.ordered_ids.join(",");
    onAnswer(correct, order);
  }

  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-wide text-ink-muted">Your order</div>
      <ol className="mb-4 min-h-[3.5rem] rounded-xl border-2 border-dashed border-border p-3 flex flex-wrap gap-2">
        {order.length === 0 && <li className="text-ink-subtle text-sm">Tap chips below to build the order…</li>}
        {order.map((id, i) => {
          const o = question.options.find((x) => x.id === id)!;
          const isRight = submitted && question.correct_answer.ordered_ids[i] === id;
          const isWrong = submitted && question.correct_answer.ordered_ids[i] !== id;
          return (
            <li key={id}>
              <button
                onClick={() => unpick(id)}
                disabled={submitted}
                className={cn(
                  "px-3 py-2 rounded-lg font-medium border-2",
                  !submitted && "bg-primary text-white border-primary",
                  isRight && "bg-success/10 border-success text-success",
                  isWrong && "bg-error/10 border-error text-error"
                )}
              >
                <span className="text-xs mr-1 opacity-70">{i + 1}.</span> {o.text}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mb-3 text-xs uppercase tracking-wide text-ink-muted">Choices</div>
      <ul className="flex flex-wrap gap-2 mb-4">
        {remaining.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => pick(o.id)}
              disabled={disabled || submitted}
              className="px-3 py-2 rounded-lg border-2 border-border bg-card hover:border-ink-subtle font-medium"
            >
              {o.text}
            </button>
          </li>
        ))}
      </ul>

      {!submitted && (
        <button className="btn-primary w-full" onClick={submit} disabled={order.length !== question.options.length}>
          Check
        </button>
      )}
    </div>
  );
}
