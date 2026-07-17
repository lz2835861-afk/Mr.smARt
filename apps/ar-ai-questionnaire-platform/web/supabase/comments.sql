-- =====================================================================
-- Comments — per-field collaboration threads (platform layer)
-- Run in Supabase Dashboard → SQL Editor after schema.sql. Re-runnable.
-- =====================================================================
--
-- A lightweight discussion thread attached to each answer field. Doubles as
-- the minimal activity log (who said what, when). author_name is denormalized
-- from the invite display name so the UI doesn't need a users join.

create table if not exists public.comments (
  id               bigint generated always as identity primary key,
  questionnaire_id text,
  field_id         text not null,
  author_id        uuid references auth.users (id) default auth.uid(),
  author_name      text,
  body             text not null,
  resolved         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists comments_field_idx on public.comments (field_id);
create index if not exists comments_questionnaire_idx on public.comments (questionnaire_id);

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;

alter table public.comments enable row level security;

drop policy if exists "comments_any_auth" on public.comments;
create policy "comments_any_auth"
  on public.comments for all
  to authenticated using ( true ) with check ( true );
