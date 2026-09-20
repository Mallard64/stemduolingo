import { NextResponse } from "next/server";
import { puzzleForDate, todayUTC } from "@/lib/seed/puzzles";
import { createClient } from "@/lib/supabase/server";

// Per-request: depends on today's date and the signed-in user's progress.
export const dynamic = "force-dynamic";

export async function GET() {
  const date = todayUTC();
  const puzzle = puzzleForDate(date);

  // Whether the signed-in user already played today (cloud-tracked).
  let already_completed = false;
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("daily_puzzle_results")
        .select("date")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();
      already_completed = !!data;
    }
  }

  return NextResponse.json({ date, items: puzzle.items, already_completed });
}
