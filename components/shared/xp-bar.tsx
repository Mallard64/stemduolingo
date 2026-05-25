"use client";
import { useUser } from "@/lib/store/user";

export function XPBar() {
  const xp = useUser((s) => s.profile?.total_xp ?? 0);
  return (
    <div className="inline-flex items-center gap-1 text-ink font-bold">
      <span aria-hidden>⚡</span>
      <span>{xp}</span>
      <span className="text-ink-muted font-medium ml-0.5">XP</span>
    </div>
  );
}
