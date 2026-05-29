"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MultiQuestion } from "@/lib/types";

export function Multi({
  question,
  onAnswer,
  disabled,
}: {
  question: MultiQuestion;
  onAnswer: (correct: boolean, picked: string[]) => void;
  disabled: boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggle(id: string) {
    if (submitted) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function submit() {
    if (submitted || picked.length === 0) return;
    setSubmitted(true);
    const correctIds = new Set(question.correct_answer.ids);
    const isCorrect = picked.length === correctIds.size && picked.every((id) => correctIds.has(id));
    onAnswer(isCorrect, picked);
  }

  const correctSet = new Set(question.correct_answer.ids);

  return (
    <div>
      <ul className="flex flex-col gap-3 mb-4">
        {question.options.map((o) => {
          const isPicked = picked.includes(o.id);
          const isCorrect = correctSet.has(o.id);
          return (
            <li key={o.id}>
              <button
                onClick={() => toggle(o.id)}
                disabled={disabled || submitted}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 font-medium transition flex items-center gap-3",
                  !submitted && isPicked && "border-primary bg-primary-light",
                  !submitted && !isPicked && "border-border hover:border-ink-subtle bg-card",
                  submitted && isCorrect && "border-success bg-success/10",
                  submitted && isPicked && !isCorrect && "border-error bg-error/10"
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded border-2 grid place-items-center text-xs",
                    isPicked ? "bg-primary border-primary text-white" : "border-ink-subtle"
                  )}
                  aria-hidden
                >
                  {isPicked ? "✓" : ""}
                </span>
                {o.text}
              </button>
            </li>
          );
        })}
      </ul>
      {!submitted && (
        <button className="btn-primary w-full" onClick={submit} disabled={picked.length === 0}>
          Check
        </button>
      )}
    </div>
  );
}
