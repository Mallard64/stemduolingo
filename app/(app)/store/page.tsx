"use client";
import { useState } from "react";
import Link from "next/link";
import { useUser, type StoreItemId } from "@/lib/store/user";
import { STORE_ITEMS, LOOTBOX, invCount } from "@/lib/store/items";

export default function StorePage() {
  const profile = useUser((s) => s.profile);
  const inventory = useUser((s) => s.inventory);
  const lootboxPity = useUser((s) => s.lootboxPity);

  const purchaseStoreItem = useUser((s) => s.purchaseStoreItem);
  const openLootbox = useUser((s) => s.openLootbox);

  const [notice, setNotice] = useState<string | null>(null);

  function handlePurchase(itemId: StoreItemId) {
    setNotice(purchaseStoreItem(itemId).message);
  }

  function handleOpenLootbox() {
    setNotice(openLootbox().message);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Store</h1>
        <Link href="/inventory" className="text-sm font-medium text-primary hover:underline">
          🎒 Inventory
        </Link>
      </div>
      <p className="text-ink-muted text-sm mb-6">
        Spend XP on boosts. Purchases land in your inventory — use them from there.
      </p>

      <div className="mb-4 rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-muted">Available XP</span>
          <span className="text-xl font-bold tabular-nums">{(profile?.total_xp ?? 0).toLocaleString()}</span>
        </div>
        {notice && <div className="mt-3 rounded-xl bg-primary-light px-3 py-2 text-sm text-primary-dark">{notice}</div>}
      </div>

      <div className="grid gap-3">
        {STORE_ITEMS.map((item) => (
          <div key={item.id} className="card flex items-center gap-4">
            <span className="size-12 rounded-xl grid place-items-center bg-surface text-2xl" aria-hidden>
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <p className="text-sm text-ink-muted">{item.description}</p>
              <div className="text-xs font-medium text-primary mt-1">{item.price} XP</div>
              {invCount(inventory, item.id) > 0 && (
                <div className="text-xs text-ink-muted mt-1">Owned: {invCount(inventory, item.id)}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handlePurchase(item.id)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Buy
            </button>
          </div>
        ))}

        {/* Mystery Box — opened instantly rather than stored. */}
        <div className="card flex items-center gap-4">
          <span className="size-12 rounded-xl grid place-items-center bg-surface text-2xl" aria-hidden>
            {LOOTBOX.icon}
          </span>
          <div className="flex-1">
            <div className="font-semibold">{LOOTBOX.name}</div>
            <p className="text-sm text-ink-muted">{LOOTBOX.description}</p>
            <div className="text-xs font-medium text-primary mt-1">{LOOTBOX.price} XP</div>
            <div className="text-xs text-ink-muted mt-1">
              Pity Counter:{" "}
              <span className={lootboxPity >= 9 ? "text-primary font-bold" : ""}>{lootboxPity}/10</span>
            </div>
          </div>
          <button type="button" onClick={handleOpenLootbox} className="btn-secondary px-4 py-2 text-sm">
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
