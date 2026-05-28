"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user";
import type { Topic, TopicWithStatus } from "@/lib/types";

export default function LearnPage() {
  const [rawTopics, setRawTopics] = useState<Topic[] | null>(null);
  const completedTopics = useUser((s) => s.completedTopics);

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then((d) => setRawTopics(d.topics));
  }, []);

  if (!rawTopics) {
    return <div className="text-ink-muted">Loading skill tree…</div>;
  }

  const topics: TopicWithStatus[] = rawTopics.map((t) => ({
    ...t,
    completed: completedTopics.includes(t.id),
    locked: t.unlock_requires.some((req) => !completedTopics.includes(req)),
  }));

  const currentIdx = topics.findIndex((t) => !t.completed && !t.locked);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">AP Chemistry</h1>
      <p className="text-ink-muted text-sm mb-6">5 topics · linear unlock</p>

      <ol className="relative flex flex-col items-center gap-8">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-border rounded-full" />
        {topics.map((t, i) => {
          const isCurrent = i === currentIdx;
          const isLeftZig = i % 2 === 0;
          return (
            <li key={t.id} className="relative w-full flex flex-col items-center gap-3">
              <div className={cn("text-center", isLeftZig ? "self-end pr-[calc(50%+56px)]" : "self-start pl-[calc(50%+56px)]")}>
                <div className="font-semibold text-sm">{t.title}</div>
                <div className="text-xs text-ink-muted">{t.description}</div>
              </div>

              <TopicNode topic={t} isCurrent={isCurrent} />
            </li>
          );
        })}
      </ol>

      <div className="mt-10 card">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Today's Element Match</div>
            <div className="text-sm text-ink-muted">Quick daily puzzle — 30s to 1m.</div>
          </div>
          <Link href="/daily" className="btn-primary">Play</Link>
        </div>
      </div>
    </div>
  );
}

function TopicNode({ topic, isCurrent }: { topic: TopicWithStatus; isCurrent: boolean }) {
  const base = "relative z-10 size-20 rounded-full grid place-items-center font-bold border-4 text-lg shadow-sm transition";
  if (topic.completed) {
    return (
      <Link href={`/learn/${topic.id}`} className={cn(base, "bg-success text-white border-success/30 hover:scale-105")}>
        ✓
      </Link>
    );
  }
  if (topic.locked) {
    return (
      <div className={cn(base, "bg-surface text-ink-subtle border-border cursor-not-allowed")}>
        🔒
      </div>
    );
  }
  return (
    <Link
      href={`/learn/${topic.id}`}
      className={cn(
        base,
        "bg-primary text-white border-primary-light hover:scale-105",
        isCurrent && "ring-4 ring-primary-light animate-pulse"
      )}
    >
      {topic.order_index}
    </Link>
  );
}
