// Centralized check for whether Supabase is wired up.
// When the env vars are missing the app falls back to local-only mode
// (localStorage persistence) so the demo always runs.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
