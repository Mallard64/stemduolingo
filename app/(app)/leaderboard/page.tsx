"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardPage() {
  const [data, setData] = useState<{ users: LeaderboardEntry[]; current_user_rank: number | null } | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="text-ink-muted">Loading leaderboard…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
      <p className="text-ink-muted text-sm mb-6">Top 30 by XP</p>

      <ol className="flex flex-col gap-2">
        {data.users.map((u) => (
          <li
            key={u.username + u.rank}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border",
              u.is_current_user
                ? "border-primary bg-primary-light/40"
                : "border-border bg-white"
            )}
          >
            <span
              className={cn(
                "size-8 rounded-full grid place-items-center font-bold text-sm",
                u.rank === 1 && "bg-yellow-400 text-white",
                u.rank === 2 && "bg-zinc-300 text-white",
                u.rank === 3 && "bg-amber-700 text-white",
                u.rank > 3 && "bg-surface text-ink-muted border border-border"
              )}
            >
              {u.rank}
            </span>
            <span className="flex-1 font-medium">
              {u.username}
              {u.is_current_user && <span className="ml-2 text-xs text-primary">(you)</span>}
            </span>
            <span className="text-streak font-semibold text-sm">🔥 {u.current_streak}</span>
            <span className="font-bold tabular-nums">{u.total_xp.toLocaleString()}</span>
          </li>
        ))}
      </ol>

      {data.current_user_rank && (
        <p className="text-sm text-ink-muted text-center mt-4">
          You're currently rank #{data.current_user_rank}
        </p>
      )}
    </div>
  );
}
