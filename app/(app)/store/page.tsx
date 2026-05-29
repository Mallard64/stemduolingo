"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser, type StoreItemId } from "@/lib/store/user";

const ITEMS = [
  {
    id: "heart-refill",
    name: "Heart refill",
    description: "Restore your hearts when a lesson gets rough.",
    price: 100,
    icon: "❤",
  },
  {
    id: "streak-freeze",
    name: "Streak freeze",
    description: "Protect your streak after missing a day.",
    price: 200,
    icon: "❄",
  },
  {
    id: "xp-boost",
    name: "2x XP boost",
    description: "Double lesson XP for the next 12 hours.",
    price: 300,
    icon: "⚡",
  },
] satisfies { id: StoreItemId; name: string; description: string; price: number; icon: string }[];

export default function StorePage() {
  const profile = useUser((s) => s.profile);
  const streakFreezes = useUser((s) => s.streakFreezes);
  const xpBoostUntil = useUser((s) => s.xpBoostUntil);
  const purchaseStoreItem = useUser((s) => s.purchaseStoreItem);
  const useStreakFreeze = useUser((s) => s.useStreakFreeze);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const boostRemaining = useMemo(() => {
    if (!xpBoostUntil) return 0;
    return Math.max(0, Date.parse(xpBoostUntil) - now);
  }, [now, xpBoostUntil]);

  function handlePurchase(itemId: StoreItemId) {
    const result = purchaseStoreItem(itemId);
    setNotice(result.message);
  }

  function handleUseFreeze() {
    const used = useStreakFreeze();
    setNotice(
      used
        ? "Streak freeze used. Your streak is protected for today."
        : "You need an active streak and an owned freeze to use this."
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Store</h1>
      <p className="text-ink-muted text-sm mb-6">Spend rewards on helpful study boosts.</p>

      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-muted">Available XP</span>
          <span className="text-xl font-bold tabular-nums">{(profile?.total_xp ?? 0).toLocaleString()}</span>
        </div>
        {notice && <div className="mt-3 rounded-xl bg-primary-light px-3 py-2 text-sm text-primary-dark">{notice}</div>}
      </div>

      <div className="grid gap-3">
        {ITEMS.map((item) => (
          <div key={item.name} className="card flex items-center gap-4">
            <span className="size-12 rounded-xl grid place-items-center bg-surface text-2xl" aria-hidden>
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <p className="text-sm text-ink-muted">{item.description}</p>
              <div className="text-xs font-medium text-primary mt-1">{item.price} XP</div>
              {item.id === "streak-freeze" && (
                <div className="text-xs text-ink-muted mt-1">Owned: {streakFreezes}</div>
              )}
              {item.id === "xp-boost" && boostRemaining > 0 && (
                <div className="text-xs text-success font-semibold mt-1">
                  Active: {formatRemaining(boostRemaining)} left
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handlePurchase(item.id)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Buy
              </button>
              {item.id === "streak-freeze" && (
                <button
                  type="button"
                  onClick={handleUseFreeze}
                  disabled={streakFreezes <= 0}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Use
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}
