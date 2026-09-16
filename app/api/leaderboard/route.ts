import { NextResponse } from "next/server";
import { FAKE_USERS } from "@/lib/seed/leaderboard";

// The current user's XP/streak live in localStorage, so the client merges and ranks.
export async function GET() {
  return NextResponse.json({ users: FAKE_USERS });
}
