"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./streak-badge";
import { XPBar } from "./xp-bar";
import { HeartsDisplay } from "./hearts-display";
import { SettingsModal } from "./settings-modal";
import { useUser } from "@/lib/store/user";
import { ThemeProvider } from "./theme-provider";

const TABS = [
  { href: "/learn", label: "📚", labelText: "Learn" },
  { href: "/daily", label: "⚗️", labelText: "Daily" },
  { href: "/leaderboard", label: "🏆", labelText: "Ranks" },
];

export function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const refillHearts = useUser((s) => s.refillHearts);
  
  return (
    <>
      <header className="sticky top-0 z-20 backdrop-blur border-border">
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
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-2xl hover:opacity-70 transition p-2"
              aria-label="Settings"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 backdrop-blur border-border">
      <ul className="mx-auto max-w-4xl flex">
        {TABS.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center py-2 text-sm font-medium",
                  active ? "text-primary" : "text-ink-muted hover:text-ink"
                )}
              >
                <span className="text-xl" aria-hidden>{t.label}</span>
                <span>{t.labelText}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
