"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type LeaderboardEntry = {
  name: string;
  seconds: number;
  attempts: number;
  score: number;
  isCurrentUser?: boolean;
};

type Result = {
  mode?: "daily-balance";
  correct: boolean;
  date: string;
  equationType?: string;
  solution?: string;
  time_seconds: number;
  attempts?: number;
  mistakes: number;
  rank?: number;
  leaderboard?: LeaderboardEntry[];
  share_text: string;
};

const today = new Date().toISOString().slice(0, 10);
const resultStorageKey = `omnistem-balance-result-${today}`;

function formatTime(seconds: number) {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ResultPage() {
  const [r, setR] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("omnistem-puzzle-result") ?? localStorage.getItem(resultStorageKey);
    if (raw) setR(JSON.parse(raw));
  }, []);

  if (!r) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-muted mb-4">No result found for this session.</p>
        <Link href="/learn" className="btn-primary">Back to learn</Link>
      </div>
    );
  }

  async function copy() {
    await navigator.clipboard.writeText(r!.share_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <section className="card text-center mb-6">
        <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold mb-2">{r.date}</div>
        <h1 className="text-2xl font-bold mb-2">Equation balanced</h1>
        <p className="text-ink-muted mb-5">
          {formatTime(r.time_seconds)} · {r.attempts ?? r.mistakes + 1} attempt{(r.attempts ?? r.mistakes + 1) === 1 ? "" : "s"} · Rank #{r.rank ?? "-"}
        </p>
        <div className="rounded-xl border border-border bg-surface p-4 text-left">
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">Solution revealed</div>
          <div className="text-xl font-bold">{r.solution}</div>
          {r.equationType && <p className="text-sm text-ink-muted mt-2">{r.equationType} reaction</p>}
        </div>
      </section>

      <section className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Daily leaderboard</h2>
          <span className="text-xs text-ink-muted">Speed + accuracy</span>
        </div>
        <div className="grid gap-2">
          {(r.leaderboard ?? []).map((entry, index) => (
            <div
              key={`${entry.name}-${entry.seconds}-${entry.attempts}`}
              className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                entry.isCurrentUser ? "border-primary bg-primary-light" : "border-border bg-card-bg"
              }`}
            >
              <span className="font-bold text-ink-muted">#{index + 1}</span>
              <div>
                <div className="font-semibold">{entry.name}</div>
                <div className="text-xs text-ink-muted">
                  {formatTime(entry.seconds)} · {entry.attempts} attempt{entry.attempts === 1 ? "" : "s"}
                </div>
              </div>
              <span className="font-bold tabular-nums">{entry.score}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-4">
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Share</div>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-surface rounded-lg p-3 border border-border">{r.share_text}</pre>
        <button className="btn-primary w-full mt-3" onClick={copy}>
          {copied ? "Copied" : "Copy share text"}
        </button>
      </section>

      <Link href="/learn" className="btn-secondary w-full">Back to learn</Link>
    </div>
  );
}
