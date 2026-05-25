# OmniSTEM (prototype)

A gamified AP Chemistry web app — Duolingo-style lesson loop + Wordle-style daily Element Match puzzle. Next.js 14 PWA.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here (prototype scope)

- Landing → signup/login (mock auth, no real Supabase needed)
- 3-screen onboarding (welcome → pick-goal → ready)
- Skill tree with 5 AP Chem topics, linear unlock
- Lesson player with all 4 question types (MCQ, multi, order, fill)
- Hearts, XP, streak — fully wired with Zustand store + in-memory server state
- Lesson completion screen with XP count-up
- Daily Element Match puzzle (9 items, 3 groups), tap-to-select, mistakes tracker, timer
- Result screen with copyable Wordle-style share card
- Leaderboard with 30 seeded fake users
- PWA manifest + icons

## What's stubbed (vs CLAUDE.md production target)

- **Auth:** mock (`useUser.signIn` just sets a profile in localStorage). Lane 04 should swap in Supabase.
- **DB:** in-memory `lib/store/server-state.ts` keyed off a single demo user. Resets when dev server restarts.
- **Questions:** ~3-4 hand-written per topic in `lib/seed/questions.ts`. Lane 04 should replace with the Claude-generated, human-reviewed bank.
- **Puzzles:** 14 hand-curated in `lib/seed/puzzles.ts`, cycled by day-of-year.

## File map

| Path | What |
| --- | --- |
| `app/page.tsx` | Landing |
| `app/(auth)/{login,signup}` | Auth screens (mock) |
| `app/(onboarding)/{welcome,pick-goal,ready}` | Onboarding flow |
| `app/(app)/learn/page.tsx` | Skill tree |
| `app/(app)/learn/[topicId]/page.tsx` | Lesson player |
| `app/(app)/learn/[topicId]/complete` | Completion screen |
| `app/(app)/daily/page.tsx` | Element Match puzzle |
| `app/(app)/daily/result/page.tsx` | Share card |
| `app/(app)/leaderboard/page.tsx` | Leaderboard |
| `app/api/**` | Locked-contract API routes |
| `lib/types.ts` | Canonical TS types from `data-shapes.md` |
| `lib/seed/*` | Seed data (topics, questions, puzzles, fake users) |
| `lib/store/*` | Zustand stores |

## Golden-path demo

1. `/` → "Get started"
2. signup with any email → onboarding (3 screens)
3. `/learn` → tap topic 1 → answer 5 questions → see XP/streak count-up
4. back to `/learn` → topic 2 now unlocked
5. tap Daily tab → solve Element Match → copy share text
6. tap Ranks tab → see yourself among the fake users
