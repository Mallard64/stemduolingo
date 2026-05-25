"use client";
import { useUser } from "@/lib/store/user";

export function StreakBadge() {
  const streak = useUser((s) => s.profile?.current_streak ?? 0);
  return (
    <div className="inline-flex items-center gap-1 text-streak font-bold">
      <span aria-hidden>🔥</span>
      <span>{streak}</span>
    </div>
  );
}
