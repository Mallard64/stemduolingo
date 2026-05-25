# Database Schema

Locked. Do not modify without team sync + decision log update.

## Tables

```sql
-- Extends Supabase auth.users
profiles (
  id uuid primary key references auth.users,
  username text unique not null,
  created_at timestamp default now(),
  current_streak int default 0,
  last_active_date date,
  total_xp int default 0
)

topics (
  id text primary key,           -- kebab-case: 'atomic-structure', etc.
  title text not null,
  description text,
  order_index int not null,
  unlock_requires text[]         -- array of topic ids that must be completed first
)

questions (
  id uuid primary key default gen_random_uuid(),
  topic_id text references topics not null,
  question_text text not null,
  question_type text not null,   -- 'mcq' | 'multi' | 'order' | 'fill'
  options jsonb,                 -- shape depends on question_type, see data-shapes.md
  correct_answer jsonb not null, -- shape depends on question_type
  explanation text,
  difficulty int default 1
)

lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  topic_id text references topics not null,
  completed_at timestamp default now(),
  xp_earned int not null,
  hearts_remaining int not null
)

daily_puzzles (
  date date primary key,
  puzzle_data jsonb not null     -- { items: string[], groups: string[][], categories: string[] }
)

daily_puzzle_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  date date references daily_puzzles not null,
  time_seconds int not null,
  mistakes int not null,
  completed boolean not null,
  unique(user_id, date)
)
```

## Topic IDs (use exactly these strings)

```
atomic-structure       — Atomic structure & electron configuration (AP Unit 1)
periodic-trends        — Periodic trends (Unit 1)
ionic-covalent         — Ionic & covalent bonding (Unit 2)
vsepr                  — Molecular geometry / VSEPR (Unit 2)
stoichiometry          — Stoichiometry & balancing equations (Unit 3)
```

## RLS notes

- `profiles`: users can read all, write only their own row.
- `lesson_completions`, `daily_puzzle_results`: users can read all (for leaderboard), write only their own.
- `topics`, `questions`, `daily_puzzles`: read-only for users, seeded by admin scripts.

## Indexes

- `lesson_completions(user_id, topic_id)` — for unlock checks
- `daily_puzzle_results(date, time_seconds)` — for ranking
- `profiles(total_xp DESC)` — for leaderboard
