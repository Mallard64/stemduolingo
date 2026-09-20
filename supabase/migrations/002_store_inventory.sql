-- Store/inventory persistence. Additive to 001_init.sql — adds the columns the
-- store needs so purchases sync to Supabase instead of living only in
-- localStorage. Safe to re-run.
--
-- NOTE: this extends the otherwise-locked profiles shape (see
-- .claude/reference/schema.md). Columns are nullable / defaulted so existing
-- reads (select *) keep working unchanged.

alter table public.profiles
  add column if not exists xp_boost_until timestamptz,
  add column if not exists lootbox_pity int default 0,
  add column if not exists inventory jsonb default '{}'::jsonb;

-- The existing "profiles_update_own" policy from 001_init.sql already lets a
-- user update their own row, which is what the store sync relies on. No new
-- policy needed.
