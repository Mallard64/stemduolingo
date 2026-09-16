-- Friends system. Additive to 001_init.sql — adds a single table that holds
-- friend requests AND accepted friendships (status column). Friendships are
-- looked up by USERNAME (profiles.username is already unique + world-readable),
-- so no email is exposed. Safe to re-run.

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles on delete cascade not null,
  addressee_id uuid references public.profiles on delete cascade not null,
  status text not null default 'pending',   -- 'pending' | 'accepted' | 'declined'
  created_at timestamptz default now(),
  -- One row per direction; prevents duplicate pending requests.
  unique (requester_id, addressee_id),
  -- Can't friend yourself.
  check (requester_id <> addressee_id)
);

create index if not exists idx_friend_requests_addressee
  on public.friend_requests (addressee_id, status);
create index if not exists idx_friend_requests_requester
  on public.friend_requests (requester_id, status);

-- ────────────────────────────── RLS ───────────────────────────────

alter table public.friend_requests enable row level security;

-- Read any request you're part of (either direction).
drop policy if exists "friend_requests_read_own" on public.friend_requests;
create policy "friend_requests_read_own" on public.friend_requests
  for select to authenticated using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- Send a request: you must be the requester.
drop policy if exists "friend_requests_insert_own" on public.friend_requests;
create policy "friend_requests_insert_own" on public.friend_requests
  for insert to authenticated with check (auth.uid() = requester_id);

-- Accept / decline: only the addressee can change status. (Requester edits are
-- not needed — to cancel, they delete instead.)
drop policy if exists "friend_requests_update_addressee" on public.friend_requests;
create policy "friend_requests_update_addressee" on public.friend_requests
  for update to authenticated using (auth.uid() = addressee_id);

-- Either party may remove the row (cancel a sent request / unfriend).
drop policy if exists "friend_requests_delete_own" on public.friend_requests;
create policy "friend_requests_delete_own" on public.friend_requests
  for delete to authenticated using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );
