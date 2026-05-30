import { NextResponse } from "next/server";
import { puzzleForDate, todayUTC, puzzleNumber } from "@/lib/seed/puzzles";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

type Body = { groupings: string[][]; time_seconds: number; mistakes: number };

function isSameGroup(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function groupingsMatch(player: string[][], truth: string[][]) {
  if (player.length !== truth.length) return false;
  const used = new Set<number>();
  for (const g of player) {
    const idx = truth.findIndex((t, i) => !used.has(i) && isSameGroup(g, t));
    if (idx === -1) return false;
    used.add(idx);
  }
  return true;
}

function rankPercentileFromTime(seconds: number, mistakes: number, solved: boolean) {
  if (!solved) return 95;
  const base = Math.min(100, Math.max(1, Math.round(seconds / 1.2)));
  return Math.min(99, base + mistakes * 8);
}

function tilesForGroups(player: string[][], truth: string[][], solved: boolean, mistakes: number) {
  if (!solved) return "🔴".repeat(truth.length) + ` → ${mistakes}✕`;
  const tiles = player.map((g) => {
    const i = truth.findIndex((t) => isSameGroup(g, t));
    if (i === -1) return "🔴";
    return mistakes === 0 ? "🟢" : mistakes === 1 ? "🟡" : "🟠";
  });
  return tiles.join("");
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const date = todayUTC();
  const puzzle = puzzleForDate(date);

  const correct = groupingsMatch(body.groupings, puzzle.groups);

  // Persist the attempt for the signed-in user (one row per user per date).
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await ensureProfile(supabase, user); // FK target for daily_puzzle_results
      await supabase.from("daily_puzzle_results").upsert(
        {
          user_id: user.id,
          date,
          time_seconds: Math.max(0, Math.round(body.time_seconds ?? 0)),
          mistakes: Math.max(0, Math.round(body.mistakes ?? 0)),
          completed: correct,
        },
        { onConflict: "user_id,date" }
      );
    }
  }

  const tiles = tilesForGroups(body.groupings, puzzle.groups, correct, body.mistakes);
  const mm = Math.floor(body.time_seconds / 60);
  const ss = String(body.time_seconds % 60).padStart(2, "0");
  const share_text = `OmniSTEM Element Match #${puzzleNumber(date)} ⚗️\n${tiles} → ${mm}:${ss}\nomnistem.app`;

  return NextResponse.json({
    correct,
    groups: puzzle.groups,
    categories: puzzle.categories,
    rank_percentile: rankPercentileFromTime(body.time_seconds, body.mistakes, correct),
    share_text,
  });
}
