"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./streak-badge";
import { XPBar } from "./xp-bar";
import { HeartsDisplay } from "./hearts-display";

const TABS = [
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/daily", label: "Daily", icon: "⚗️" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
        <Link href="/learn" className="flex items-center gap-2 font-bold">
          <span className="text-primary">⚛</span>
          <span>OmniSTEM</span>
        </Link>
        <div className="flex items-center gap-4">
          <HeartsDisplay />
          <StreakBadge />
          <XPBar />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-border">
      <ul className="mx-auto max-w-3xl flex">
        {TABS.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center py-2 text-xs font-medium",
                  active ? "text-primary" : "text-ink-muted hover:text-ink"
                )}
              >
                <span className="text-xl" aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
