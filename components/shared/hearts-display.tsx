"use client";
import { useUser } from "@/lib/store/user";

export function HeartsDisplay() {
  const hearts = useUser((s) => s.hearts);
  return (
    <div className="inline-flex items-center gap-1 font-bold text-primary" aria-label={`${hearts} hearts`}>
      <span aria-hidden>❤</span>
      <span>{hearts}</span>
    </div>
  );
}
