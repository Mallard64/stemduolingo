"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { normalizeFill } from "@/lib/scoring";
import type { FillQuestion } from "@/lib/types";

export function Fill({
  question,
  onAnswer,
  disabled,
}: {
  question: FillQuestion;
  onAnswer: (correct: boolean, value: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitted || !value.trim()) return;
    const accepted = question.correct_answer.accepted.map(normalizeFill);
    const isCorrect = accepted.includes(normalizeFill(value));
    setSubmitted(true);
    onAnswer(isCorrect, value);
  }

  return (
    <form onSubmit={submit}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || submitted}
        placeholder="Type your answer…"
        className={cn(
          "w-full rounded-xl border-2 px-4 py-3 text-lg font-medium mb-4 focus:outline-none",
          !submitted && "border-border focus:border-primary",
          submitted && "border-ink-subtle bg-surface"
        )}
      />
      {!submitted && (
        <button className="btn-primary w-full" type="submit" disabled={!value.trim()}>
          Check
        </button>
      )}
    </form>
  );
}
