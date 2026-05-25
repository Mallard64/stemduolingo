# Lane 04 — Backend + Pitch

**Owner:** Person 4

You own all server-side logic, database, auth setup, seed scripts. From Day 5, you also own the pitch and demo prep.

## Files in your lane

```
app/api/
  topics/route.ts
  topics/[id]/lesson/route.ts
  lessons/complete/route.ts
  daily-puzzle/route.ts
  daily-puzzle/submit/route.ts
  leaderboard/route.ts

lib/supabase/
  client.ts                  (browser client)
  server.ts                  (server client with cookies)
  middleware.ts              (auth refresh)

supabase/
  migrations/
    001_init.sql             (all tables + RLS)

scripts/
  seed-topics.ts
  seed-questions.ts          (calls Claude API, generates ~25 questions)
  seed-puzzles.ts            (collaborates with Person 3 on this)
  seed-fake-users.ts         (~30 fake leaderboard users)

middleware.ts                (Supabase auth refresh middleware)
```

## Required reading

- `.claude/reference/schema.md` — your bible
- `.claude/reference/api-contracts.md` — what you must implement
- `.claude/reference/chem-content-rules.md` — for `seed-questions.ts`

## Supabase setup checklist (Day 1)

- [ ] Create Supabase project
- [ ] Run `001_init.sql` migration — all tables created
- [ ] Configure RLS policies (see schema.md)
- [ ] Enable email + Google auth providers
- [ ] Add Supabase URL + anon key + service role key to `.env.local`
- [ ] Set up `@supabase/ssr` for Next.js server components
- [ ] Add auth middleware to refresh sessions
- [ ] Push schema to production project (or use local dev with branching)

## API implementation order (Day 1-3)

Priority order so other lanes are unblocked:

1. `GET /api/topics` — Person 1 needs this for skill tree
2. `GET /api/topics/[id]/lesson` — Person 2 needs this
3. `POST /api/lessons/complete` — Person 2 needs this
4. `GET /api/daily-puzzle` — Person 3 needs this
5. `POST /api/daily-puzzle/submit` — Person 3 needs this
6. `GET /api/leaderboard` — for the leaderboard page

## Seeding (Day 1-2)

### Topics
Hardcode the 5 topic IDs into `seed-topics.ts`. Unlock chain: each requires the previous.

### Questions
Use Claude API with the prompt template in `chem-content-rules.md`. Generate ~6 per topic = 30 questions. Save raw output to `scripts/generated-questions.json`. **Human review every question** before inserting into Supabase.

### Fake users
Seed 30 fake users with believable usernames and XP distributions:
- 5 users with very high XP (above demo user)
- 10 mid-range
- 15 below demo user
This way the demo user shows up around rank #15-20 on first load, which feels realistic.

Use names like: `chem_wizard`, `stoich_master`, `vsepr_vince`, `mol_mary`, `e_neg_eric` — slightly cringe but feels real.

### Daily puzzles
Coordinate with Person 3. They generate, you insert.

## Pitch + Demo prep (Day 5 onward)

You shift from backend work to pitch on Day 5 (assuming backend is functional). If it's not, this is your tell that the team is behind schedule.

See `.claude/workflows/pitch-and-demo.md` for the deck structure and demo script.

## RLS gotchas

- Use service role key ONLY in seed scripts and server-side API routes
- Use anon key in client code
- Make sure `lesson_completions` insert checks `auth.uid() = user_id` — easy to forget

## Don't touch

- Frontend components (other lanes)
- Game UI (Person 3)

You consume types from `lib/types.ts`. Make sure your API responses match the `data-shapes.md` exactly. Drift here causes Day 5 integration hell.
