"use client";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/store/user";

export default function CompletePage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const sp = useSearchParams();
  const hearts = Number(sp.get("hearts") ?? 5);

  const completeLesson = useUser((s) => s.completeLesson);
  const gainHeart = useUser((s) => s.gainHeart);

  const [result, setResult] = useState<{ xpEarned: number; newTotalXP: number; newStreak: number; streakExtended: boolean } | null>(null);
  const [counter, setCounter] = useState(0);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;   // guard against StrictMode double-invoke
    recorded.current = true;
    setResult(completeLesson(topicId, hearts));
    gainHeart();   // completion bonus: +1 heart (capped at 5)
  }, [topicId, hearts, completeLesson, gainHeart]);

  useEffect(() => {
    if (!result) return;
    const target = result.xpEarned;
    let i = 0;
    const step = Math.max(1, Math.round(target / 40));
    const id = setInterval(() => {
      i += step;
      if (i >= target) {
        i = target;
        clearInterval(id);
      }
      setCounter(i);
    }, 30);
    return () => clearInterval(id);
  }, [result]);

  return (
    <div className="min-h-screen grid place-items-center px-6 text-center bg-bg">
      <div className="max-w-md">
        <div className="text-7xl mb-4 animate-bounce" aria-hidden>🎉</div>
        <h1 className="text-3xl font-bold mb-1">Lesson complete!</h1>
        <p className="text-ink-muted mb-8">Nice work — you're building a streak.</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat label="XP earned" value={`+${counter}`} accent />
          <Stat label="Hearts left" value={"❤".repeat(Math.max(0, hearts))} />
          <Stat label="Streak" value={`🔥 ${result?.newStreak ?? "—"}`} />
        </div>

        {result?.streakExtended && (
          <div className="mb-6 text-streak font-semibold">Streak extended! Keep going tomorrow.</div>
        )}

        <Link href="/learn" className="btn-primary w-full">Continue</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`card ${accent ? "border-primary" : ""}`}>
      <div className={`text-xl font-bold ${accent ? "text-primary animate-count-up" : ""}`}>{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </div>
  );
}
