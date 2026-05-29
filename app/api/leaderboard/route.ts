import { NextResponse } from "next/server";
import { FAKE_USERS } from "@/lib/seed/leaderboard";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Per-request: reads live profiles from the cloud.
export const dynamic = "force-dynamic";

// Returns seeded fake users plus all real users from the cloud. The client
// merges in its own (freshest) profile and ranks, deduping by id.
export async function GET() {
  let real: Profile[] = [];

  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, current_streak, last_active_date, total_xp, created_at")
      .order("total_xp", { ascending: false })
      .limit(100);
    real = (data ?? []).map((r) => ({
      id: r.id,
      username: r.username,
      email: "",
      created_at: r.created_at ?? "",
      current_streak: r.current_streak ?? 0,
      last_active_date: r.last_active_date ?? null,
      total_xp: r.total_xp ?? 0,
    }));
  }

  return NextResponse.json({ users: [...FAKE_USERS, ...real] });
}
