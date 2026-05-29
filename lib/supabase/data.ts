"use client";
import { createClient } from "./client";
import type { Profile } from "@/lib/types";

const todayUTC = () => new Date().toISOString().slice(0, 10);

export type CloudUserState = {
  profile: Profile;
  completedTopics: string[];
  puzzleDoneDate: string | null;
};

// Loads the signed-in user's full persisted state from Supabase:
// profile (xp/streak/last_active), completed lessons, and whether today's
// puzzle is done. Returns null when not configured or not signed in.
export async function loadUserState(): Promise<CloudUserState | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayUTC();
  const [profileRes, completionsRes, puzzleRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lesson_completions").select("topic_id").eq("user_id", user.id),
    supabase
      .from("daily_puzzle_results")
      .select("date")
      .eq("user_id", user.id)
      .eq("date", today),
  ]);

  const row = profileRes.data;
  const profile: Profile = row
    ? {
        id: row.id,
        username: row.username,
        email: user.email ?? "",
        created_at: row.created_at ?? new Date().toISOString(),
        current_streak: row.current_streak ?? 0,
        last_active_date: row.last_active_date ?? null,
        total_xp: row.total_xp ?? 0,
      }
    : {
        // Profile trigger may not have fired yet — fall back to a minimal one.
        id: user.id,
        username: user.email?.split("@")[0] ?? "learner",
        email: user.email ?? "",
        created_at: new Date().toISOString(),
        current_streak: 0,
        last_active_date: null,
        total_xp: 0,
      };

  const completedTopics = Array.from(
    new Set((completionsRes.data ?? []).map((c) => c.topic_id as string))
  );
  const puzzleDoneDate =
    puzzleRes.data && puzzleRes.data.length > 0 ? today : null;

  return { profile, completedTopics, puzzleDoneDate };
}

export async function cloudSignOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
}

export async function cloudChangePassword(newPassword: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return true; // local-only mode: pretend success
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return !error;
}
