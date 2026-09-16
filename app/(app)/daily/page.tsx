"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user";

type EquationPuzzle = {
  id: string;
  type: string;
  reactants: string[];
  products: string[];
  answer: number[];
  solution: string;
  atomCounts: {
    reactants: Record<string, number>[];
    products: Record<string, number>[];
  };
};

type LeaderboardEntry = {
  name: string;
  seconds: number;
  attempts: number;
  score: number;
  isCurrentUser?: boolean;
};

const TODAY = new Date().toISOString().slice(0, 10);
const DAILY_PUZZLES: EquationPuzzle[] = [
  {
    id: "water",
    type: "Synthesis",
    reactants: ["H2", "O2"],
    products: ["H2O"],
    answer: [2, 1, 2],
    solution: "2H2 + O2 -> 2H2O",
    atomCounts: {
      reactants: [{ H: 2 }, { O: 2 }],
      products: [{ H: 2, O: 1 }],
    },
  },
  {
    id: "methane-combustion",
    type: "Combustion",
    reactants: ["CH4", "O2"],
    products: ["CO2", "H2O"],
    answer: [1, 2, 1, 2],
    solution: "CH4 + 2O2 -> CO2 + 2H2O",
    atomCounts: {
      reactants: [{ C: 1, H: 4 }, { O: 2 }],
      products: [{ C: 1, O: 2 }, { H: 2, O: 1 }],
    },
  },
  {
    id: "iron-oxide",
    type: "Synthesis",
    reactants: ["Fe", "O2"],
    products: ["Fe2O3"],
    answer: [4, 3, 2],
    solution: "4Fe + 3O2 -> 2Fe2O3",
    atomCounts: {
      reactants: [{ Fe: 1 }, { O: 2 }],
      products: [{ Fe: 2, O: 3 }],
    },
  },
  {
    id: "aluminum-chloride",
    type: "Synthesis",
    reactants: ["Al", "Cl2"],
    products: ["AlCl3"],
    answer: [2, 3, 2],
    solution: "2Al + 3Cl2 -> 2AlCl3",
    atomCounts: {
      reactants: [{ Al: 1 }, { Cl: 2 }],
      products: [{ Al: 1, Cl: 3 }],
    },
  },
  {
    id: "potassium-chlorate",
    type: "Decomposition",
    reactants: ["KClO3"],
    products: ["KCl", "O2"],
    answer: [2, 2, 3],
    solution: "2KClO3 -> 2KCl + 3O2",
    atomCounts: {
      reactants: [{ K: 1, Cl: 1, O: 3 }],
      products: [{ K: 1, Cl: 1 }, { O: 2 }],
    },
  },
  {
    id: "silver-nitrate",
    type: "Double replacement",
    reactants: ["AgNO3", "CaCl2"],
    products: ["AgCl", "Ca(NO3)2"],
    answer: [2, 1, 2, 1],
    solution: "2AgNO3 + CaCl2 -> 2AgCl + Ca(NO3)2",
    atomCounts: {
      reactants: [{ Ag: 1, N: 1, O: 3 }, { Ca: 1, Cl: 2 }],
      products: [{ Ag: 1, Cl: 1 }, { Ca: 1, N: 2, O: 6 }],
    },
  },
];

const dayIndex = Number(TODAY.replaceAll("-", "")) % DAILY_PUZZLES.length;
const puzzle = DAILY_PUZZLES[dayIndex];
const playerStorageKey = `omnistem-balance-leaderboard-${TODAY}`;
const resultStorageKey = `omnistem-balance-result-${TODAY}`;

function scoreFor(seconds: number, attempts: number) {
  return Math.max(100, 1200 - seconds * 6 - Math.max(0, attempts - 1) * 90);
}

function seededLeaderboard(date: string): LeaderboardEntry[] {
  const seed = Number(date.replaceAll("-", ""));
  return [
    { name: "Maya", seconds: 42 + (seed % 13), attempts: 1, score: scoreFor(42 + (seed % 13), 1) },
    { name: "Avery", seconds: 58 + (seed % 17), attempts: 1, score: scoreFor(58 + (seed % 17), 1) },
    { name: "Jordan", seconds: 74 + (seed % 19), attempts: 2, score: scoreFor(74 + (seed % 19), 2) },
    { name: "Sam", seconds: 92 + (seed % 23), attempts: 2, score: scoreFor(92 + (seed % 23), 2) },
  ];
}

function formatTime(seconds: number) {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function sameNumbers(a: number[], b: number[]) {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

function totalAtoms(side: Record<string, number>[], coefficients: number[]) {
  return side.reduce<Record<string, number>>((totals, speciesAtoms, index) => {
    for (const [atom, count] of Object.entries(speciesAtoms)) {
      totals[atom] = (totals[atom] ?? 0) + count * (coefficients[index] || 0);
    }
    return totals;
  }, {});
}

export default function DailyPuzzlePage() {
  const router = useRouter();
  const profile = useUser((s) => s.profile);
  const puzzleDoneDate = useUser((s) => s.puzzleDoneDate);
  const completePuzzle = useUser((s) => s.completePuzzle);
  const alreadyDone = puzzleDoneDate === TODAY;
  const [coefficients, setCoefficients] = useState<string[]>(puzzle.answer.map(() => ""));
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => seededLeaderboard(TODAY));
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!alreadyDone) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [alreadyDone]);

  useEffect(() => {
    const saved = localStorage.getItem(playerStorageKey);
    const playerEntry = saved ? (JSON.parse(saved) as LeaderboardEntry) : null;
    setLeaderboard(sortLeaderboard(playerEntry ? [...seededLeaderboard(TODAY), playerEntry] : seededLeaderboard(TODAY)));
  }, []);

  const parsedCoefficients = coefficients.map((value) => Number(value));
  const answerReady = coefficients.every((value) => value.trim() !== "" && Number(value) > 0);
  const reactantTotals = useMemo(
    () => totalAtoms(puzzle.atomCounts.reactants, parsedCoefficients.slice(0, puzzle.reactants.length)),
    [parsedCoefficients]
  );
  const productTotals = useMemo(
    () => totalAtoms(puzzle.atomCounts.products, parsedCoefficients.slice(puzzle.reactants.length)),
    [parsedCoefficients]
  );
  const atomNames = Array.from(new Set([...Object.keys(reactantTotals), ...Object.keys(productTotals)]));
  const oxygenBalanced = (reactantTotals.O ?? 0) === (productTotals.O ?? 0);

  function submitAnswer() {
    if (!answerReady || alreadyDone) return;

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (!sameNumbers(parsedCoefficients, puzzle.answer)) {
      setMessage("Not balanced yet. Check the atom counts and try again.");
      return;
    }

    const seconds = Math.max(1, elapsed);
    const entry: LeaderboardEntry = {
      name: profile?.username || "You",
      seconds,
      attempts: nextAttempts,
      score: scoreFor(seconds, nextAttempts),
      isCurrentUser: true,
    };

    localStorage.setItem(playerStorageKey, JSON.stringify(entry));
    const nextLeaderboard = sortLeaderboard([...seededLeaderboard(TODAY), entry]);
    setLeaderboard(nextLeaderboard);
    completePuzzle();
    const result = {
      mode: "daily-balance",
      date: TODAY,
      correct: true,
      equationType: puzzle.type,
      solution: puzzle.solution,
      time_seconds: seconds,
      attempts: nextAttempts,
      mistakes: nextAttempts - 1,
      rank: nextLeaderboard.findIndex((item) => item.isCurrentUser) + 1,
      leaderboard: nextLeaderboard,
      share_text: `OmniSTEM Balance Builder ${TODAY}\n${puzzle.type}: ${formatTime(seconds)} in ${nextAttempts} attempt${nextAttempts === 1 ? "" : "s"}`,
    };
    sessionStorage.setItem("omnistem-puzzle-result", JSON.stringify(result));
    localStorage.setItem(resultStorageKey, JSON.stringify(result));
    router.push("/daily/result");
  }

  if (alreadyDone) {
    return (
      <div>
        <section className="card text-center mb-6">
          <div className="text-sm uppercase tracking-wider text-ink-muted font-semibold mb-2">{TODAY}</div>
          <h1 className="text-2xl font-bold mb-2">Daily Balance Builder is complete</h1>
          <p className="text-ink-muted mb-5">You cannot redo today's equation. Come back tomorrow for a new one.</p>
          <button className="btn-primary" onClick={() => router.push("/daily/result")}>View result</button>
        </section>
        <Leaderboard entries={leaderboard} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">{puzzle.type}</div>
            <h1 className="text-2xl font-bold">Daily Balance Builder</h1>
          </div>
          <div className="rounded-lg border border-border bg-card-bg px-3 py-2 text-right">
            <div className="text-xs text-ink-muted">Time</div>
            <div className="font-bold tabular-nums">{formatTime(elapsed)}</div>
          </div>
        </div>
        <p className="text-sm text-ink-muted">
          Fill the coefficient boxes so each atom appears the same number of times on both sides.
        </p>
      </div>

      <section className="card mb-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-lg sm:text-xl font-bold mb-6">
          {puzzle.reactants.map((species, index) => (
            <EquationTerm
              key={species}
              species={species}
              value={coefficients[index]}
              onChange={(value) => updateCoefficient(index, value, setCoefficients)}
            />
          )).reduce<React.ReactNode[]>((items, item, index) => [...items, ...(index ? [<Operator key={`r-${index}`}>+</Operator>] : []), item], [])}
          <Operator>-&gt;</Operator>
          {puzzle.products.map((species, productIndex) => {
            const index = puzzle.reactants.length + productIndex;
            return (
              <EquationTerm
                key={species}
                species={species}
                value={coefficients[index]}
                onChange={(value) => updateCoefficient(index, value, setCoefficients)}
              />
            );
          }).reduce<React.ReactNode[]>((items, item, index) => [...items, ...(index ? [<Operator key={`p-${index}`}>+</Operator>] : []), item], [])}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <AtomPanel title="Reactants" totals={reactantTotals} atomNames={atomNames} panic={!oxygenBalanced} />
          <AtomPanel title="Products" totals={productTotals} atomNames={atomNames} panic={!oxygenBalanced} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-primary flex-1" disabled={!answerReady} onClick={submitAnswer}>
            Check answer
          </button>
          <button
            className="btn-secondary flex-1"
            onClick={() => {
              setCoefficients(puzzle.answer.map(() => ""));
              setMessage("");
            }}
          >
            Clear boxes
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {available.map((item) => {
          const isPicked = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={cn(
                "aspect-square rounded-xl border-2 font-semibold text-sm sm:text-base transition px-1",
                isPicked
                  ? "bg-primary text-white border-primary scale-[0.97]"
                  : "bg-card border-border hover:border-ink-subtle"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

        {message && <p className="mt-4 text-center text-sm font-semibold text-error">{message}</p>}
      </section>

      <Leaderboard entries={leaderboard} />
    </div>
  );
}

function EquationTerm({ species, value, onChange }: { species: string; value: string; onChange: (value: string) => void }) {
  return (
    <span className="inline-flex items-center gap-2">
      <input
        aria-label={`Coefficient for ${species}`}
        inputMode="numeric"
        className="h-12 w-14 rounded-lg border-2 border-border bg-white text-center text-lg font-bold outline-none focus:border-primary"
        maxLength={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span>{species}</span>
    </span>
  );
}

function Operator({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-muted">{children}</span>;
}

function AtomPanel({
  title,
  totals,
  atomNames,
  panic,
}: {
  title: string;
  totals: Record<string, number>;
  atomNames: string[];
  panic: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">{title}</h2>
        {panic && <span className="text-xs font-semibold text-error">oxygen panic</span>}
      </div>
      <div className="grid gap-2">
        {atomNames.map((atom) => (
          <div key={atom} className="flex items-center justify-between rounded-lg border border-border bg-card-bg px-3 py-2">
            <span className={cn("font-bold", atom === "O" && panic && "animate-bounce text-error")}>{atom}</span>
            <span className="tabular-nums">{totals[atom] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Daily leaderboard</h2>
        <span className="text-xs text-ink-muted">Speed + accuracy</span>
      </div>
      <div className="grid gap-2">
        {entries.map((entry, index) => (
          <div
            key={`${entry.name}-${entry.seconds}-${entry.attempts}`}
            className={cn(
              "grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2 text-sm",
              entry.isCurrentUser ? "border-primary bg-primary-light" : "border-border bg-card-bg"
            )}
          >
            <span className="font-bold text-ink-muted">#{index + 1}</span>
            <div>
              <div className="font-semibold">{entry.name}</div>
              <div className="text-xs text-ink-muted">
                {formatTime(entry.seconds)} · {entry.attempts} attempt{entry.attempts === 1 ? "" : "s"}
              </div>
            </div>
            <span className="font-bold tabular-nums">{entry.score}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function updateCoefficient(index: number, value: string, setCoefficients: (fn: (current: string[]) => string[]) => void) {
  const cleaned = value.replace(/\D/g, "").slice(0, 2);
  setCoefficients((current) => {
    const next = [...current];
    next[index] = cleaned;
    return next;
  });
}

function sortLeaderboard(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => b.score - a.score || a.seconds - b.seconds).slice(0, 8);
}
