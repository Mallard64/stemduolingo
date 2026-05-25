import { NextResponse } from "next/server";
import { puzzleForDate, todayUTC } from "@/lib/seed/puzzles";
import { DEMO_USER, puzzleAlreadyCompletedToday } from "@/lib/store/server-state";

export async function GET() {
  const date = todayUTC();
  const puzzle = puzzleForDate(date);
  return NextResponse.json({
    date,
    items: puzzle.items,
    already_completed: puzzleAlreadyCompletedToday(DEMO_USER, date),
  });
}
