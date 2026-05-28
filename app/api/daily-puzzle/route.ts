import { NextResponse } from "next/server";
import { puzzleForDate, todayUTC } from "@/lib/seed/puzzles";

// Whether the user already played today is tracked client-side in localStorage.
export async function GET() {
  const date = todayUTC();
  const puzzle = puzzleForDate(date);
  return NextResponse.json({ date, items: puzzle.items });
}
