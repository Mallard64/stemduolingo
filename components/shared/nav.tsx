"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { StreakBadge } from "./streak-badge";
import { XPBar } from "./xp-bar";
import { HeartsDisplay } from "./hearts-display";
import { ProfileModal } from "./profile-modal";
import { useUser } from "@/lib/store/user";

const TABS = [
  { href: "/learn", label: "Learn", icon: "📚" },
  { href: "/friends", label: "Friends", icon: "👥" },
  { href: "/daily", label: "Daily", icon: "⚗️" },
  { href: "/store", label: "Store", icon: "🛒" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
];

export function TopBar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profile = useUser((s) => s.profile);
  const refillHearts = useUser((s) => s.refillHearts);
  const profileImageUrl = profile?.profile_image_url;
  
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
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
              className="text-xs px-2 py-1 rounded border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 font-medium"
            >
              +5 ❤️
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              className="grid size-10 place-items-center overflow-hidden rounded-full border border-border bg-surface font-bold text-primary transition hover:border-primary"
              aria-label="Profile"
              title="Profile"
            >
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span>{profile?.username?.slice(0, 1).toUpperCase() ?? "U"}</span>
              )}
            </button>
          </div>
        </div>
      </header>
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-card/90 backdrop-blur">
      <ul className="mx-auto max-w-4xl flex">
        {TABS.map((t) => {
          const active = path?.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center py-2 text-xs sm:text-sm font-medium gap-1",
                  active ? "text-primary" : "text-ink-muted hover:text-ink"
                )}
              >
                <span className="text-xl" aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
                <span className="text-lg" aria-hidden>{t.icon}</span>
                <span className="text-xs">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
