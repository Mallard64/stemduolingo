// Single source of truth for store/inventory item metadata. Imported by both
// the Zustand store (prices) and the store/inventory pages (display).

export type StoreItemId = "heart-refill" | "streak-freeze" | "xp-boost";

// A map of itemId -> quantity owned. Persisted to profiles.inventory (jsonb).
export type Inventory = Record<string, number>;

export type StoreItem = {
  id: StoreItemId;
  name: string;
  description: string;
  price: number;
  icon: string;
  /** Label for the action that consumes the item from the inventory. */
  useLabel: string;
};

export const STORE_ITEMS: StoreItem[] = [
  {
    id: "heart-refill",
    name: "Heart refill",
    description: "Restore your hearts to full when a lesson gets rough.",
    price: 100,
    icon: "❤️",
    useLabel: "Use",
  },
  {
    id: "streak-freeze",
    name: "Streak freeze",
    description: "Protect your streak after missing a day.",
    price: 200,
    icon: "❄️",
    useLabel: "Use",
  },
  {
    id: "xp-boost",
    name: "2x XP boost",
    description: "Double lesson XP for 12 hours once activated.",
    price: 100,
    icon: "⚡",
    useLabel: "Activate",
  },
];

export const STORE_PRICES = Object.fromEntries(
  STORE_ITEMS.map((i) => [i.id, i.price])
) as Record<StoreItemId, number>;

export const LOOTBOX = {
  id: "lootbox",
  name: "Mystery Box",
  description: "Open for a random reward! Guarantees a Rare+ item every 10 boxes.",
  price: 250,
  icon: "🎁",
} as const;

export const LOOTBOX_PRICE = LOOTBOX.price;

export const invCount = (inv: Inventory, id: string): number => inv[id] ?? 0;
