"use client";
import Link from "next/link";
import { HeartsDisplay } from "@/components/shared/hearts-display";

export function QuestionShell({
  index,
  total,
  children,
}: {
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="px-4 py-3 border-b border-border sticky top-0 bg-white z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/learn" className="text-ink-muted text-xl" aria-label="Quit lesson">✕</Link>
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-success transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <HeartsDisplay />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-200">
        {children}
      </main>
    </div>
  );
}
