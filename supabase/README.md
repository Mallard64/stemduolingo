# Supabase setup

The app runs in **local-only mode** (localStorage) until these env vars are set,
at which point auth + all progress (XP, streak, completed lessons, daily-puzzle
results) persist to the cloud.

## 1. Create a project

Create a project at [supabase.com](https://supabase.com). Then copy from
**Settings → API** into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Restart `npm run dev` after editing env vars.

## 2. Run the migrations

Open **SQL Editor** in the dashboard and run each migration file **in order**:

1. `supabase/migrations/001_init.sql` — tables, RLS policies, indexes, the
   auto-profile trigger, and the 8 seeded skill-tree topics.
2. `supabase/migrations/002_store_inventory.sql` — store/inventory columns.
3. `supabase/migrations/003_friends.sql` — the `friend_requests` table + RLS
   that powers add-by-username friendships.

(Or, with the Supabase CLI: `supabase db push`.)

## 3. Enable email auth

**Authentication → Providers → Email** is enabled by default. For the smoothest
demo, turn **off** "Confirm email" so signups sign in immediately. With it on,
users must click the confirmation link first.

> Sign-in is **email + password only**. Users pick a unique **username** at
> signup — that's how friends find and add each other. (Google OAuth was
> removed from the UI; the scaffolding in `app/auth/callback` remains if you
> want to re-enable it later.)

## 4. Done

Sign up / log in with email + password. XP, streak, completed lessons, the
daily-puzzle lock, and **friends** now persist server-side and survive across
devices and reloads. The leaderboard merges real users with the seeded ones.

## Notes

- Hearts are intentionally **not** persisted to the cloud — they reset daily
  and aren't part of the locked schema.
- The migration seeds the CED topic IDs `lo-1-1` … `lo-1-8` (from
  `lib/seed/ced.ts`, re-exported by `lib/seed/topics.ts`) so
  `lesson_completions` foreign keys resolve. Keep this seed in sync if the
  topic list changes.
