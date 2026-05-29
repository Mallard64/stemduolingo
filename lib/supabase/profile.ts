import type { SupabaseClient } from "@supabase/supabase-js";

// Ensures a profiles row exists for the user. `lesson_completions` and
// `daily_puzzle_results` both FK to profiles, so this MUST run before inserting
// either — accounts created before the signup trigger existed have no row yet.
// Username is made collision-safe by appending a slice of the user id.
export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<void> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (data) return;

  const base = user.email?.split("@")[0]?.replace(/[^a-z0-9_]+/gi, "_") || "learner";
  await supabase.from("profiles").insert({
    id: user.id,
    username: `${base}-${user.id.slice(0, 4)}`,
  });
}
