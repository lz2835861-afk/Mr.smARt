-- =====================================================================
-- Omdia RFI 2026 — Supabase schema (invite-code mode)
-- Run this in Supabase Dashboard → SQL Editor → New query, then click Run.
-- =====================================================================
--
-- Auth model: Supabase anonymous sign-ins. The frontend gates access by a
-- name allowlist (VITE_INVITE_NAMES env var). The "name" doubles as the
-- display name shown in the presence bar.
--
-- Prerequisite: enable anonymous sign-ins in
-- Supabase Dashboard → Authentication → Sign In / Up → "Allow anonymous sign-ins".
--
-- Single shared workspace: everyone on the team edits the same answer set.
-- field_id = the hard-coded field id from a questionnaire data file (e.g. "s1_dc")
-- value    = JSONB so we can store either a string (text fields) or an array (checkboxes)
--
-- Multi-questionnaire scoping (platform layer): multiple questionnaires share this
-- one table. They stay separate by NAMESPACING field ids per questionnaire
-- (Omdia ids are bare, e.g. "s1_dc"; Gartner ids are prefixed "gc_", e.g. "gc_2_1").
-- The client filters rows to the active questionnaire's field set (useRemoteAnswers).
-- This needs NO migration. A dedicated questionnaire_id column + composite PK
-- (questionnaire_id, field_id) is the cleaner long-term option if the set grows.

create table if not exists public.answers (
  field_id     text primary key,
  value        jsonb not null,
  updated_by   uuid references auth.users (id) not null default auth.uid(),
  updated_at   timestamptz not null default now()
);

-- Auto-touch updated_at on any update
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$ language plpgsql;

drop trigger if exists answers_touch_updated_at on public.answers;
create trigger answers_touch_updated_at
  before update on public.answers
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Realtime: broadcast row changes to all connected clients.
-- =====================================================================
alter publication supabase_realtime add table public.answers;

-- =====================================================================
-- Row Level Security: any authenticated session (incl. anonymous) can
-- read/write. The actual auth gate lives in the frontend (invite name list).
--
-- This is a soft gate suitable for an internal team tool whose URL is
-- private. If you ever publish the URL externally, switch back to a
-- proper email allowlist (see prior schema versions in git history).
-- =====================================================================
alter table public.answers enable row level security;

-- Drop any prior policies (so this script is re-runnable)
drop policy if exists "tencent_select"   on public.answers;
drop policy if exists "tencent_write"    on public.answers;
drop policy if exists "any_auth_select"  on public.answers;
drop policy if exists "any_auth_write"   on public.answers;

create policy "any_auth_select"
  on public.answers
  for select
  to authenticated
  using ( true );

create policy "any_auth_write"
  on public.answers
  for all
  to authenticated
  using ( true )
  with check ( true );
