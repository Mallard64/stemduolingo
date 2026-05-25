import { NextResponse } from "next/server";
import { FAKE_USERS } from "@/lib/seed/leaderboard";
import { DEMO_USER, state } from "@/lib/store/server-state";

export async function GET() {
  const me = state().demoProfile;
  const all = [...FAKE_USERS, me].sort((a, b) => b.total_xp - a.total_xp);
  const ranked = all.map((u, i) => ({
    username: u.username,
    total_xp: u.total_xp,
    current_streak: u.current_streak,
    rank: i + 1,
    is_current_user: u.id === DEMO_USER,
  }));
  const top = ranked.slice(0, 30);
  const meEntry = ranked.find((u) => u.is_current_user);
  const current_user_rank = meEntry && meEntry.rank > 30 ? meEntry.rank : null;
  return NextResponse.json({ users: top, current_user_rank });
}
