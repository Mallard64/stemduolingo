"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MCQQuestion } from "@/lib/types";

export function MCQ({
  question,
  onAnswer,
  disabled,
}: {
  question: MCQQuestion;
  onAnswer: (correct: boolean, picked: string) => void;
  disabled: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function pick(id: string) {
    if (disabled || picked) return;
    setPicked(id);
    onAnswer(id === question.correct_answer.id, id);
  }

  return (
    <ul className="flex flex-col gap-3">
      {question.options.map((o) => {
        const isPicked = picked === o.id;
        const isCorrect = o.id === question.correct_answer.id;
        const reveal = picked !== null;
        return (
          <li key={o.id}>
            <button
              onClick={() => pick(o.id)}
              disabled={disabled || picked !== null}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 font-medium transition",
                !reveal && "border-border hover:border-ink-subtle bg-white",
                reveal && isCorrect && "border-success bg-success/10",
                reveal && isPicked && !isCorrect && "border-error bg-error/10 animate-shake"
              )}
            >
              {o.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
