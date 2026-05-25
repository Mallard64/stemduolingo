import { NextResponse } from "next/server";
import { DEMO_USER, recordLessonCompletion } from "@/lib/store/server-state";

type Body = { topic_id: string; hearts_remaining: number; time_seconds: number };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const xpEarned = 50 + body.hearts_remaining * 10;
  const result = recordLessonCompletion(DEMO_USER, body.topic_id, xpEarned);

  return NextResponse.json({
    xp_earned: xpEarned,
    new_total_xp: result.newTotalXP,
    new_streak: result.newStreak,
    streak_extended: result.streakExtended,
  });
}
