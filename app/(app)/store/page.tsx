"use client";
import { useUser } from "@/lib/store/user";

const ITEMS = [
  {
    name: "Heart refill",
    description: "Restore your hearts when a lesson gets rough.",
    price: "Free in demo",
    icon: "❤",
  },
  {
    name: "Streak freeze",
    description: "Protect your streak after missing a day.",
    price: "Coming soon",
    icon: "❄",
  },
  {
    name: "XP boost",
    description: "Double lesson XP for a short study sprint.",
    price: "Coming soon",
    icon: "⚡",
  },
];

export default function StorePage() {
  const refillHearts = useUser((s) => s.refillHearts);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Store</h1>
      <p className="text-ink-muted text-sm mb-6">Spend rewards on helpful study boosts.</p>

      <div className="grid gap-3">
        {ITEMS.map((item) => (
          <div key={item.name} className="card flex items-center gap-4">
            <span className="size-12 rounded-xl grid place-items-center bg-surface text-2xl" aria-hidden>
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <p className="text-sm text-ink-muted">{item.description}</p>
              <div className="text-xs font-medium text-primary mt-1">{item.price}</div>
            </div>
            <button
              type="button"
              onClick={item.name === "Heart refill" ? refillHearts : undefined}
              disabled={item.name !== "Heart refill"}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Get
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
