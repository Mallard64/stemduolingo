"use client";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user";
import type { DailyGameId, DailyGameMeta } from "@/lib/types";

type SolvedGroup = { items: string[] };

const DAILY_GAMES: DailyGameMeta[] = [
  {
    id: "bond-builder",
    title: "BondBuilder",
    subtitle: "Place bonds and lone pairs to complete a valid molecule.",
    focus: "Covalent bonding, valence electrons, Lewis structures",
    accent: "primary",
  },
  {
    id: "reaction-run",
    title: "Reaction Run",
    subtitle: "Balance an equation by changing one coefficient at a time.",
    focus: "Conservation of mass, reactions, stoichiometry",
    accent: "warning",
  },
  {
    id: "element-match",
    title: "Element Match",
    subtitle: "Cluster elements and compounds into hidden chemistry groups.",
    focus: "Periodic trends, element families, atomic structure",
    accent: "success",
  },
  {
    id: "ph-panic",
    title: "pH Panic",
    subtitle: "Classify substances, pH values, and indicator clues fast.",
    focus: "pH scale, acids and bases, indicators",
    accent: "streak",
  },
];

const accentStyles: Record<DailyGameMeta["accent"], string> = {
  primary: "border-primary/30 bg-primary-light text-primary-dark",
  warning: "border-warning/30 bg-warning/10 text-amber-800",
  success: "border-success/30 bg-success/10 text-green-800",
  streak: "border-streak/30 bg-orange-50 text-orange-800",
};

export default function DailyPuzzlePage() {
  const [activeGame, setActiveGame] = useState<DailyGameId | null>(null);
  const isDailyGameDoneToday = useUser((s) => s.isDailyGameDoneToday);
  const completeCount = DAILY_GAMES.filter((game) => isDailyGameDoneToday(game.id)).length;
  const game = DAILY_GAMES.find((item) => item.id === activeGame) ?? null;

  if (game) {
    return (
      <div>
        <button className="text-sm font-semibold text-ink-muted hover:text-ink mb-4" onClick={() => setActiveGame(null)}>
          Back to daily circuit
        </button>
        {game.id === "element-match" && <ElementMatchGame />}
        {game.id === "bond-builder" && <BondBuilderGame />}
        {game.id === "reaction-run" && <ReactionRunGame />}
        {game.id === "ph-panic" && <PHPanicGame />}
      </div>
    );
  }

  return (
    <div>
      <section className="mb-6 rounded-3xl border border-border bg-card-bg p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="badge mb-3">Daily Circuit</span>
            <h1 className="text-3xl font-black tracking-tight">Chemistry micro-games</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">
              Four synchronized daily challenges unlock at midnight. Play the same set as everyone else, then share your score.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-center">
            <div className="text-2xl font-black">{completeCount}/{DAILY_GAMES.length}</div>
            <div className="text-xs font-semibold text-ink-muted">done today</div>
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {DAILY_GAMES.map((dailyGame) => {
          const done = isDailyGameDoneToday(dailyGame.id);
          return (
            <button
              key={dailyGame.id}
              onClick={() => setActiveGame(dailyGame.id)}
              className="card text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className={cn("mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold", accentStyles[dailyGame.accent])}>
                    {done ? "Completed" : dailyGame.focus}
                  </div>
                  <h2 className="text-xl font-black">{dailyGame.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{dailyGame.subtitle}</p>
                </div>
                <span className="btn-primary shrink-0">{done ? "Replay" : "Play"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ElementMatchGame() {
  const router = useRouter();
  const completePuzzle = useUser((s) => s.completePuzzle);
  const [items, setItems] = useState<string[] | null>(null);
  const [date, setDate] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<SolvedGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    fetch("/api/daily-puzzle")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items);
        setDate(d.date);
        startedAt.current = Date.now();
      });
  }, []);

  const used = new Set(solved.flatMap((g) => g.items));
  const available = items?.filter((i) => !used.has(i)) ?? [];
  const groupsLeft = 3 - solved.length;

  function toggle(item: string) {
    setSelected((s) =>
      s.includes(item) ? s.filter((x) => x !== item) : s.length >= 3 ? s : [...s, item]
    );
  }

  async function checkOrSubmit() {
    if (selected.length !== 3 || submitting) return;
    setSubmitting(true);

    const checkRes = await fetch("/api/daily-puzzle/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ group: selected }),
    });
    const { correct } = await checkRes.json();

    if (!correct) {
      setMistakes((m) => m + 1);
      setSelected([]);
      setSubmitting(false);
      return;
    }

    const nextSolved = [...solved, { items: selected }];
    setSolved(nextSolved);
    setSelected([]);

    if (nextSolved.length === 3) {
      const time = Math.round((Date.now() - startedAt.current) / 1000);
      const res = await fetch("/api/daily-puzzle/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupings: nextSolved.map((g) => g.items),
          time_seconds: time,
          mistakes,
        }),
      });
      const data = await res.json();
      completePuzzle("element-match");
      sessionStorage.setItem(
        "omnistem-puzzle-result",
        JSON.stringify({ ...data, time_seconds: time, date, mistakes })
      );
      router.push("/daily/result");
      return;
    }

    setSubmitting(false);
  }

  if (!items) {
    return <div className="text-ink-muted">Loading today's Element Match...</div>;
  }

  return (
    <GameShell
      title="Element Match"
      eyebrow={date}
      description={`Group the 9 items into 3 sets of 3. ${groupsLeft} group${groupsLeft === 1 ? "" : "s"} to go.`}
      side={<Timer startedAt={startedAt.current} />}
    >
      <div className="mb-4 text-sm font-medium text-ink-muted">
        Mistakes:{" "}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("inline-block size-2.5 mx-0.5 rounded-full align-middle", i < mistakes ? "bg-error" : "bg-border")}
          />
        ))}
      </div>

      {solved.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {solved.map((g, i) => (
            <div key={i} className="bg-success/10 border border-success rounded-xl p-3 text-center font-semibold text-success">
              {g.items.join(" / ")}
            </div>
          ))}
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
                "aspect-square rounded-xl border-2 bg-card-bg px-1 text-sm font-semibold transition sm:text-base",
                isPicked ? "bg-primary text-white border-primary scale-[0.97]" : "border-border hover:border-ink-subtle"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button className="btn-primary w-full" disabled={selected.length !== 3 || submitting} onClick={checkOrSubmit}>
        {solved.length === 2 ? "Submit final group" : "Submit group of 3"}
      </button>
    </GameShell>
  );
}

function BondBuilderGame() {
  const completePuzzle = useUser((s) => s.completePuzzle);
  const [placed, setPlaced] = useState<string[]>([]);
  const needed = ["C-O bond", "C-H bond", "C-H bond", "O lone pairs"];
  const complete = needed.every((item, index) => placed[index] === item);

  function place(item: string) {
    setPlaced((current) => (current.length >= needed.length ? current : [...current, item]));
  }

  function finish() {
    if (!complete) return;
    completePuzzle("bond-builder");
    sessionStorage.setItem("omnistem-mini-result", "BondBuilder solved: CH2O structure completed.");
  }

  return (
    <GameShell title="BondBuilder" eyebrow="Lewis structure" description="Build formaldehyde by placing bonds and lone pairs without breaking valence rules.">
      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <Atom label="H" />
        <Atom label="C" strong />
        <Atom label="O" />
        <div />
        <Atom label="H" />
        <div className="rounded-xl border border-dashed border-border p-3 text-sm text-ink-muted">
          {placed.length}/{needed.length} placements
        </div>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {["C-O bond", "C-H bond", "O lone pairs", "O-H bond"].map((item) => (
          <button key={item} className="btn-secondary" onClick={() => place(item)} disabled={placed.length >= needed.length}>
            {item}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-border bg-surface p-3 text-sm">
        <div className="font-semibold mb-1">Your build</div>
        <div className="text-ink-muted">{placed.length ? placed.join(" -> ") : "No placements yet"}</div>
      </div>

      <button className="btn-primary w-full" disabled={!complete} onClick={finish}>
        {complete ? "Complete molecule" : "Place the valid structure"}
      </button>
    </GameShell>
  );
}

function ReactionRunGame() {
  const completePuzzle = useUser((s) => s.completePuzzle);
  const [h2, setH2] = useState(1);
  const [o2, setO2] = useState(1);
  const [h2o, setH2O] = useState(1);
  const [moves, setMoves] = useState(0);
  const balanced = h2 === 2 && o2 === 1 && h2o === 2;

  function bump(setter: (n: number) => void, value: number) {
    setter(value === 4 ? 1 : value + 1);
    setMoves((m) => m + 1);
  }

  function finish() {
    if (!balanced) return;
    completePuzzle("reaction-run");
    sessionStorage.setItem("omnistem-mini-result", `Reaction Run solved in ${moves} moves.`);
  }

  return (
    <GameShell title="Reaction Run" eyebrow={`${moves} moves`} description="Change one coefficient per move until both sides conserve every atom.">
      <div className="card mb-4 text-center text-2xl font-black">
        {coef(h2)}H2 + {coef(o2)}O2 {"->"} {coef(h2o)}H2O
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <button className="btn-secondary" onClick={() => bump(setH2, h2)}>H2: {h2}</button>
        <button className="btn-secondary" onClick={() => bump(setO2, o2)}>O2: {o2}</button>
        <button className="btn-secondary" onClick={() => bump(setH2O, h2o)}>H2O: {h2o}</button>
      </div>
      <button className="btn-primary w-full" disabled={!balanced} onClick={finish}>
        {balanced ? "Lock balanced equation" : "Reach 2H2 + O2 -> 2H2O"}
      </button>
    </GameShell>
  );
}

function PHPanicGame() {
  const completePuzzle = useUser((s) => s.completePuzzle);
  const prompts = useMemo(
    () => [
      { text: "Lemon juice", answer: "Acid" },
      { text: "Soap", answer: "Base" },
      { text: "Pure water", answer: "Neutral" },
      { text: "pH 3", answer: "Acid" },
      { text: "Phenolphthalein turns pink", answer: "Base" },
    ],
    []
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const done = index >= prompts.length;

  function answer(choice: string) {
    if (done) return;
    if (choice === prompts[index].answer) setScore((s) => s + 1);
    setIndex((i) => i + 1);
  }

  function finish() {
    completePuzzle("ph-panic");
    sessionStorage.setItem("omnistem-mini-result", `pH Panic score: ${score}/${prompts.length}.`);
  }

  return (
    <GameShell title="pH Panic" eyebrow={`${score}/${prompts.length} correct`} description="Classify each clue as acidic, basic, or neutral.">
      {!done ? (
        <>
          <div className="card mb-4 text-center text-2xl font-black">{prompts[index].text}</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Acid", "Base", "Neutral"].map((choice) => (
              <button key={choice} className="btn-primary" onClick={() => answer(choice)}>
                {choice}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="card mb-4 text-center">
            <div className="text-3xl font-black">{score}/{prompts.length}</div>
            <div className="text-sm text-ink-muted">daily score</div>
          </div>
          <button className="btn-primary w-full" onClick={finish}>Complete pH Panic</button>
        </>
      )}
    </GameShell>
  );
}

function GameShell({
  title,
  eyebrow,
  description,
  side,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  side?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-5 rounded-3xl border border-border bg-card-bg p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="badge mb-2">{eyebrow}</span>
            <h1 className="text-2xl font-black">{title}</h1>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
          </div>
          {side}
        </div>
      </div>
      {children}
    </div>
  );
}

function Atom({ label, strong = false }: { label: string; strong?: boolean }) {
  return (
    <div className={cn("grid aspect-square place-items-center rounded-2xl border-2 text-xl font-black", strong ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-card-bg")}>
      {label}
    </div>
  );
}

function coef(n: number) {
  return n === 1 ? "" : n;
}

function Timer({ startedAt }: { startedAt: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => clearInterval(id);
  }, [startedAt]);
  const mm = Math.floor(n / 60);
  const ss = String(n % 60).padStart(2, "0");
  return <span className="font-bold text-ink tabular-nums">{mm}:{ss}</span>;
}
