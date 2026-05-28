"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./streak-badge";
import { XPBar } from "./xp-bar";
import { HeartsDisplay } from "./hearts-display";
import { useUser } from "@/lib/store/user";

const TABS = [
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/friends", label: "Friends", icon: "👥" },
  { href: "/daily", label: "Daily", icon: "⚗️" },
  { href: "/store", label: "Store", icon: "🛒" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
];

export function TopBar() {
  const refillHearts = useUser((s) => s.refillHearts);
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
          <button
            onClick={refillHearts}
            className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-medium"
          >
            +5 ❤️
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-border">
      <ul className="mx-auto max-w-4xl flex">
        {TABS.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center py-2 text-xs sm:text-sm font-medium",
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
