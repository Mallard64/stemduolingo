"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Result = {
  correct: boolean;
  groups: string[][];
  categories: string[];
  rank_percentile: number;
  share_text: string;
  time_seconds: number;
  date: string;
  mistakes: number;
};

export default function ResultPage() {
  const [r, setR] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("omnistem-puzzle-result");
    if (raw) setR(JSON.parse(raw));
  }, []);

  if (!r) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-muted mb-4">No result yet — play today's puzzle.</p>
        <Link href="/daily" className="btn-primary">Play</Link>
      </div>
    );
  }

  async function copy() {
    await navigator.clipboard.writeText(r!.share_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const mm = Math.floor(r.time_seconds / 60);
  const ss = String(r.time_seconds % 60).padStart(2, "0");

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-6xl mb-2" aria-hidden>{r.correct ? "🎉" : "🧪"}</div>
        <h1 className="text-2xl font-bold">{r.correct ? "Solved!" : "Not solved"}</h1>
        <p className="text-ink-muted">
          {mm}:{ss} · {r.mistakes} mistake{r.mistakes === 1 ? "" : "s"} · Top {r.rank_percentile}%
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {r.groups.map((g, i) => (
          <div key={i} className="card">
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-1">{r.categories[i]}</div>
            <div className="font-semibold">{g.join(" · ")}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Share</div>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-surface rounded-lg p-3 border border-border">{r.share_text}</pre>
        <button className="btn-primary w-full mt-3" onClick={copy}>
          {copied ? "Copied ✓" : "Copy share text"}
        </button>
      </div>

      <Link href="/learn" className="btn-secondary w-full">Back to learn</Link>
    </div>
  );
}
