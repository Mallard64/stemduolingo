"use client";
import Link from "next/link";
import { useState } from "react";

const GOALS = [
  { id: "ap", label: "I'm in AP Chem", emoji: "🎯" },
  { id: "hs", label: "I'm in High School Chem", emoji: "📘" },
  { id: "ex", label: "Just exploring", emoji: "🔬" },
];

export default function PickGoal() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">What brings you here?</h1>
        <p className="text-ink-muted text-center mb-8">We'll keep the tone right for you.</p>

        <ul className="flex flex-col gap-3">
          {GOALS.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => setPicked(g.id)}
                className={`w-full text-left card transition flex items-center gap-3 ${
                  picked === g.id ? "border-primary ring-2 ring-primary" : "hover:border-ink-subtle"
                }`}
              >
                <span className="text-2xl" aria-hidden>{g.emoji}</span>
                <span className="font-medium">{g.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <Link
          href="/ready"
          aria-disabled={!picked}
          className={`btn-primary w-full mt-8 ${!picked ? "pointer-events-none opacity-50" : ""}`}
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
