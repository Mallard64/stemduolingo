import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLessonXP } from "@/lib/scoring";

type Body = { topic_id: string; hearts_remaining: number; time_seconds: number };

const todayUTC = () => new Date().toISOString().slice(0, 10);
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

// Records a lesson completion and updates the user's XP + streak. Server is
// the source of truth for these numbers (RLS ensures users write only their own).
export async function POST(req: Request) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  if (!body.topic_id) {
    return NextResponse.json({ error: "topic_id required" }, { status: 400 });
  }
  const hearts = Math.max(0, Math.min(5, Math.round(body.hearts_remaining ?? 0)));
  const xpEarned = calculateLessonXP(hearts);
  const t = todayUTC();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, total_xp, current_streak, last_active_date")
    .eq("id", user.id)
    .maybeSingle();

  const prevXp = profile?.total_xp ?? 0;
  const prevStreak = profile?.current_streak ?? 0;
  const lastActive = profile?.last_active_date ?? null;

  let newStreak = prevStreak;
  let streakExtended = false;
  if (lastActive !== t) {
    const gap = lastActive ? daysBetween(lastActive, t) : Infinity;
    newStreak = gap === 1 ? prevStreak + 1 : 1;
    streakExtended = true;
  }
  const newTotalXp = prevXp + xpEarned;

  await supabase.from("lesson_completions").insert({
    user_id: user.id,
    topic_id: body.topic_id,
    xp_earned: xpEarned,
    hearts_remaining: hearts,
  });

  if (profile) {
    await supabase
      .from("profiles")
      .update({ total_xp: newTotalXp, current_streak: newStreak, last_active_date: t })
      .eq("id", user.id);
  } else {
    // Trigger hasn't created the profile yet — insert with a collision-safe username.
    await supabase.from("profiles").insert({
      id: user.id,
      username: `${user.email?.split("@")[0] ?? "learner"}-${user.id.slice(0, 4)}`,
      total_xp: newTotalXp,
      current_streak: newStreak,
      last_active_date: t,
    });
  }

  return NextResponse.json({
    xp_earned: xpEarned,
    new_total_xp: newTotalXp,
    new_streak: newStreak,
    streak_extended: streakExtended,
  });
}
