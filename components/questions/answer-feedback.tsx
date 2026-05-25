"use client";
import { cn } from "@/lib/utils";

export function AnswerFeedback({
  correct,
  explanation,
  wrongReason,
  onContinue,
}: {
  correct: boolean;
  explanation: string | null;
  wrongReason?: string | null;
  onContinue: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-30 border-t-4 p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-200",
        correct ? "bg-success/10 border-success" : "bg-error/10 border-error"
      )}
    >
      <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
        <div>
          <div className={cn("font-bold text-lg flex items-center gap-2", correct ? "text-success" : "text-error")}>
            <span aria-hidden>{correct ? "✓" : "✕"}</span>
            {correct ? "Correct!" : "Not quite."}
          </div>
          {!correct && wrongReason && <p className="text-sm text-ink-muted mt-1 max-w-xl">{wrongReason}</p>}
          {explanation && <p className="text-sm text-ink-muted mt-1 max-w-xl">{explanation}</p>}
        </div>
        <button
          onClick={onContinue}
          className={cn(
            "shrink-0 rounded-xl px-5 py-3 font-semibold text-white",
            correct ? "bg-success hover:opacity-90" : "bg-error hover:opacity-90"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
