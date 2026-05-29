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

## 2. Run the migration

Open **SQL Editor** in the dashboard, paste the contents of
`supabase/migrations/001_init.sql`, and run it. This creates all tables, RLS
policies, indexes, the auto-profile trigger, and seeds the 8 skill-tree topics.

(Or, with the Supabase CLI: `supabase db push`.)

## 3. Enable auth providers

**Authentication → Providers:**

- **Email** — enabled by default. For the smoothest demo, turn **off**
  "Confirm email" (Authentication → Providers → Email) so signups sign in
  immediately. With it on, users must click the confirmation link first.
- **Google** — enable it and paste a Google OAuth client ID + secret
  (Google Cloud Console → APIs & Services → Credentials → OAuth client,
  type "Web application").
  - Authorized redirect URI (in Google Cloud):
    `https://<your-ref>.supabase.co/auth/v1/callback`
  - Supabase **Authentication → URL Configuration → Redirect URLs**: add
    `http://localhost:3000/auth/callback` (and your production URL,
    e.g. `https://yourapp.vercel.app/auth/callback`).

## 4. Done

Sign up / log in (email or Google). XP, streak, completed lessons, and the
daily-puzzle lock now persist server-side and survive across devices and
reloads. The leaderboard merges real users with the seeded ones.

## Notes

- Hearts are intentionally **not** persisted to the cloud — they reset daily
  and aren't part of the locked schema.
- Topic IDs are the CED learning-objective IDs (`lo-1-1` … `lo-1-8`) used by
  `lib/seed/ced.ts`, not the placeholder IDs in `.claude/reference/schema.md`.
  The seed in the migration matches the running app so `lesson_completions`
  foreign keys resolve.
