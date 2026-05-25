import { NextResponse } from "next/server";
import { puzzleForDate, todayUTC } from "@/lib/seed/puzzles";

type Body = { group: string[] };

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const puzzle = puzzleForDate(todayUTC());
  const match = puzzle.groups.find((g) => sameSet(g, body.group));
  return NextResponse.json({ correct: !!match });
}
