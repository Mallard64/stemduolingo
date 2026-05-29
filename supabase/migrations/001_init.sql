-- OmniSTEM initial schema. Locked shape — see .claude/reference/schema.md.
-- Run in the Supabase SQL editor (or `supabase db push`).

-- ───────────────────────────── Tables ─────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  created_at timestamptz default now(),
  current_streak int default 0,
  last_active_date date,
  total_xp int default 0
);

create table if not exists public.topics (
  id text primary key,                 -- kebab-case: 'atomic-structure', etc.
  title text not null,
  description text,
  order_index int not null,
  unlock_requires text[] default '{}'
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id text references public.topics not null,
  question_text text not null,
  question_type text not null,         -- 'mcq' | 'multi' | 'order' | 'fill'
  options jsonb,
  correct_answer jsonb not null,
  explanation text,
  difficulty int default 1
);

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  topic_id text references public.topics not null,
  completed_at timestamptz default now(),
  xp_earned int not null,
  hearts_remaining int not null
);

create table if not exists public.daily_puzzles (
  date date primary key,
  puzzle_data jsonb not null           -- { items, groups, categories }
);

create table if not exists public.daily_puzzle_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  date date not null,
  time_seconds int not null,
  mistakes int not null,
  completed boolean not null,
  unique (user_id, date)
);

-- ──────────────────────────── Indexes ─────────────────────────────

create index if not exists idx_lesson_completions_user_topic
  on public.lesson_completions (user_id, topic_id);
create index if not exists idx_daily_results_date_time
  on public.daily_puzzle_results (date, time_seconds);
create index if not exists idx_profiles_total_xp
  on public.profiles (total_xp desc);

-- ────────────────────────────── RLS ───────────────────────────────

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.daily_puzzles enable row level security;
alter table public.daily_puzzle_results enable row level security;

-- profiles: everyone can read (leaderboard), users write only their own row.
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- lesson_completions: read all (leaderboard), write only your own.
drop policy if exists "completions_read_all" on public.lesson_completions;
create policy "completions_read_all" on public.lesson_completions
  for select using (true);
drop policy if exists "completions_insert_own" on public.lesson_completions;
create policy "completions_insert_own" on public.lesson_completions
  for insert with check (auth.uid() = user_id);

-- daily_puzzle_results: read all, write only your own.
drop policy if exists "results_read_all" on public.daily_puzzle_results;
create policy "results_read_all" on public.daily_puzzle_results
  for select using (true);
drop policy if exists "results_insert_own" on public.daily_puzzle_results;
create policy "results_insert_own" on public.daily_puzzle_results
  for insert with check (auth.uid() = user_id);
drop policy if exists "results_update_own" on public.daily_puzzle_results;
create policy "results_update_own" on public.daily_puzzle_results
  for update using (auth.uid() = user_id);

-- topics / questions / daily_puzzles: public read, seeded by admin (service role).
drop policy if exists "topics_read_all" on public.topics;
create policy "topics_read_all" on public.topics for select using (true);
drop policy if exists "questions_read_all" on public.questions;
create policy "questions_read_all" on public.questions for select using (true);
drop policy if exists "puzzles_read_all" on public.daily_puzzles;
create policy "puzzles_read_all" on public.daily_puzzles for select using (true);

-- ──────────────── Auto-create a profile on signup ─────────────────
-- Fires for both email/password and Google OAuth signups. Generates a
-- unique username from the metadata or email, appending a counter on clash.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'learner'
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]+', '_', 'g');
  if base_username = '' then base_username := 'learner'; end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username)
  values (new.id, final_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────── Seed topics (skill tree) ────────────────
-- Must match lib/seed/topics.ts so lesson_completions.topic_id FKs resolve.
-- Idempotent: re-running updates titles/order without duplicating.
insert into public.topics (id, title, description, order_index, unlock_requires) values
  ('atomic-structure', 'Atomic Structure', 'Subatomic particles, isotopes, electron configuration.', 1, '{}'),
  ('periodic-trends', 'Periodic Trends', 'Atomic radius, ionization energy, electronegativity.', 2, '{atomic-structure}'),
  ('ionic-covalent', 'Ionic & Covalent Bonding', 'Bond types, Lewis structures, polarity.', 3, '{periodic-trends}'),
  ('vsepr', 'Molecular Geometry (VSEPR)', 'Shapes, bond angles, molecular polarity.', 4, '{ionic-covalent}'),
  ('stoichiometry', 'Stoichiometry', 'Balancing equations, mole conversions, limiting reactant.', 5, '{vsepr}')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  unlock_requires = excluded.unlock_requires;
