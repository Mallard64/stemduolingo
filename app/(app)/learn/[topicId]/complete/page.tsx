"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/store/user";

export default function CompletePage({ params }: { params: { topicId: string } }) {
  const sp = useSearchParams();
  const hearts = Number(sp.get("hearts") ?? 5);
  const time = Number(sp.get("time") ?? 0);

  const setTotalXP = useUser((s) => s.setTotalXP);
  const setStreak = useUser((s) => s.setStreak);
  const gainHeart = useUser((s) => s.gainHeart);

  const [result, setResult] = useState<{ xp_earned: number; new_total_xp: number; new_streak: number; streak_extended: boolean } | null>(null);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic_id: params.topicId, hearts_remaining: hearts, time_seconds: time }),
    })
      .then((r) => r.json())
      .then((d) => {
        setResult(d);
        setTotalXP(d.new_total_xp);
        setStreak(d.new_streak);
        gainHeart();   // completion bonus: +1 heart (capped at 5)
      });
  }, [params.topicId, hearts, time, setTotalXP, setStreak, gainHeart]);

  useEffect(() => {
    if (!result) return;
    const target = result.xp_earned;
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
          <Stat label="Streak" value={`🔥 ${result?.new_streak ?? "—"}`} />
        </div>

        {result?.streak_extended && (
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
