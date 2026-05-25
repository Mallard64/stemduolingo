"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SolvedGroup = { items: string[] };

export default function DailyPuzzlePage() {
  const router = useRouter();
  const [items, setItems] = useState<string[] | null>(null);
  const [date, setDate] = useState<string>("");
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<SolvedGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    fetch("/api/daily-puzzle")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items);
        setDate(d.date);
        setAlreadyDone(d.already_completed);
        startedAt.current = Date.now();
      });
  }, []);

  const used = new Set(solved.flatMap((g) => g.items));
  const available = items?.filter((i) => !used.has(i)) ?? [];
  const groupsLeft = 3 - solved.length;

  function toggle(item: string) {
    setSelected((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : s.length >= 3 ? s : [...s, item]
    );
  }

  async function checkOrSubmit() {
    if (selected.length !== 3 || submitting) return;
    setSubmitting(true);

    // Verify this group
    const checkRes = await fetch("/api/daily-puzzle/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ group: selected }),
    });
    const { correct } = await checkRes.json();

    if (!correct) {
      setMistakes((m) => m + 1);
      setSelected([]);
      setSubmitting(false);
      return;
    }

    const nextSolved = [...solved, { items: selected }];
    setSolved(nextSolved);
    setSelected([]);

    if (nextSolved.length === 3) {
      const time = Math.round((Date.now() - startedAt.current) / 1000);
      const res = await fetch("/api/daily-puzzle/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupings: nextSolved.map((g) => g.items),
          time_seconds: time,
          mistakes,
        }),
      });
      const data = await res.json();
      sessionStorage.setItem(
        "omnistem-puzzle-result",
        JSON.stringify({ ...data, time_seconds: time, date, mistakes })
      );
      router.push("/daily/result");
      return;
    }

    setSubmitting(false);
  }

  if (!items) {
    return <div className="text-ink-muted">Loading today's puzzle…</div>;
  }

  if (alreadyDone) {
    const hasSessionResult = typeof window !== "undefined" && !!sessionStorage.getItem("omnistem-puzzle-result");
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-3" aria-hidden>✅</div>
        <h2 className="text-2xl font-bold mb-2">You've done today's puzzle</h2>
        <p className="text-ink-muted mb-6">New puzzle drops at midnight UTC.</p>
        <div className="flex gap-2 justify-center">
          {hasSessionResult && (
            <button className="btn-secondary" onClick={() => router.push("/daily/result")}>
              See your result
            </button>
          )}
          <button className="btn-primary" onClick={() => router.push("/learn")}>
            Back to learn
          </button>
        </div>
      </div>
    );
  }

  if (mistakes >= 4) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-3" aria-hidden>🧪</div>
        <h2 className="text-2xl font-bold mb-2">Out of attempts</h2>
        <p className="text-ink-muted mb-4">Come back tomorrow for a new puzzle.</p>
        <button className="btn-primary" onClick={() => router.push("/learn")}>Back to learn</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Element Match</h1>
        <span className="badge">{date}</span>
      </div>
      <p className="text-ink-muted text-sm mb-6">
        Group the 9 items into 3 sets of 3. {groupsLeft} group{groupsLeft === 1 ? "" : "s"} to go.
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-ink-muted">
          Mistakes:{" "}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "inline-block size-2.5 mx-0.5 rounded-full align-middle",
                i < mistakes ? "bg-error" : "bg-border"
              )}
            />
          ))}
        </div>
        <Timer startedAt={startedAt.current} />
      </div>

      {solved.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {solved.map((g, i) => (
            <div
              key={i}
              className="bg-success/10 border border-success rounded-xl p-3 text-center font-semibold text-success"
            >
              {g.items.join("  ·  ")}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {available.map((item) => {
          const isPicked = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={cn(
                "aspect-square rounded-xl border-2 font-semibold text-sm sm:text-base transition px-1",
                isPicked
                  ? "bg-primary text-white border-primary scale-[0.97]"
                  : "bg-white border-border hover:border-ink-subtle"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        className="btn-primary w-full"
        disabled={selected.length !== 3 || submitting}
        onClick={checkOrSubmit}
      >
        {solved.length === 2 ? "Submit final group" : "Submit group of 3"}
      </button>
    </div>
  );
}

function Timer({ startedAt }: { startedAt: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => clearInterval(id);
  }, [startedAt]);
  const mm = Math.floor(n / 60);
  const ss = String(n % 60).padStart(2, "0");
  return (
    <span className="font-bold text-ink tabular-nums">
      <span aria-hidden>⏱ </span>
      {mm}:{ss}
    </span>
  );
}
