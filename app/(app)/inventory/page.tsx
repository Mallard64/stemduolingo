"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser, type StoreItemId } from "@/lib/store/user";
import { STORE_ITEMS, invCount } from "@/lib/store/items";

export default function InventoryPage() {
  const inventory = useUser((s) => s.inventory);
  const xpBoostUntil = useUser((s) => s.xpBoostUntil);
  const hearts = useUser((s) => s.hearts);
  const profile = useUser((s) => s.profile);

  const useHeartRefill = useUser((s) => s.useHeartRefill);
  const useStreakFreeze = useUser((s) => s.useStreakFreeze);
  const activateXpBoost = useUser((s) => s.activateXpBoost);

  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => 0);

  // Tick once a second so the active-boost countdown stays live.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const boostRemaining = useMemo(() => {
    if (!xpBoostUntil || now === 0) return 0;
    return Math.max(0, Date.parse(xpBoostUntil) - now);
  }, [now, xpBoostUntil]);

  function handleUse(itemId: StoreItemId) {
    if (itemId === "heart-refill") {
      const ok = useHeartRefill();
      setNotice(
        ok ? "Hearts restored to full." : "You don't have a heart refill to use."
      );
    } else if (itemId === "streak-freeze") {
      const ok = useStreakFreeze();
      setNotice(
        ok
          ? "Streak freeze used — your streak is protected for today."
          : "You need an active streak and an owned freeze to use this."
      );
    } else if (itemId === "xp-boost") {
      const ok = activateXpBoost();
      setNotice(ok ? "2x XP boost activated for the next 12 hours." : "You don't have an XP boost to activate.");
    }
  }

  const ownedItems = STORE_ITEMS.filter((item) => invCount(inventory, item.id) > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link href="/store" className="text-sm font-medium text-primary hover:underline">
          🛒 Store
        </Link>
      </div>
      <p className="text-ink-muted text-sm mb-6">Items you own. Use them when you need them.</p>

      {notice && (
        <div className="mb-4 rounded-xl bg-primary-light px-3 py-2 text-sm text-primary-dark">{notice}</div>
      )}

      {boostRemaining > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-white p-4 flex items-center justify-between">
          <span className="text-sm font-medium">⚡ 2x XP boost active</span>
          <span className="text-sm font-semibold text-success tabular-nums">
            {formatRemaining(boostRemaining)} left
          </span>
        </div>
      )}

      {ownedItems.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-4xl mb-2" aria-hidden>
            🎒
          </div>
          <p className="font-semibold">Your inventory is empty</p>
          <p className="text-sm text-ink-muted mt-1">
            Head to the{" "}
            <Link href="/store" className="text-primary hover:underline">
              store
            </Link>{" "}
            to buy boosts.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {ownedItems.map((item) => {
            const count = invCount(inventory, item.id);
            const disabled =
              (item.id === "heart-refill" && hearts >= 5) ||
              (item.id === "streak-freeze" && (profile?.current_streak ?? 0) <= 0);
            return (
              <div key={item.id} className="card flex items-center gap-4">
                <span className="size-12 rounded-xl grid place-items-center bg-surface text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">
                    {item.name} <span className="text-ink-muted font-normal">×{count}</span>
                  </div>
                  <p className="text-sm text-ink-muted">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUse(item.id)}
                  disabled={disabled}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {item.useLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
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
