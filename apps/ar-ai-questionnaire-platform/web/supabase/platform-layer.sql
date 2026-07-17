-- =====================================================================
-- Platform layer migration — per-answer metadata, suggestions, import log
-- Run in Supabase Dashboard → SQL Editor after schema.sql. Re-runnable.
-- =====================================================================
--
-- Additive: does NOT change the existing `answers` table (field_id → value).
-- Live content still lives in `answers` (zh at field_id, en at field_id__en).
-- This adds the collaboration/platform metadata that the importer + UI need:
--   - state machine (living status, replaces the static code-side `status`)
--   - per-person/role assignment
--   - fact_notes (产品事实底稿) separate from 措辞稿 content
--   - evidence / reviewer_hooks / lint / conflicts (from the skill export)
--   - suggestions (AI versions parked when a human is already editing)
--
-- Unified state enum (shared with the skill export contract):
--   NOT STARTED | AI DRAFTED | PRODUCT REVIEW | KEVIN REVIEW | READY | SUBMITTED | BLOCKED

create table if not exists public.answer_meta (
  field_id         text primary key,
  questionnaire_id text,
  state            text not null default 'NOT STARTED'
    check (state in (
      'NOT STARTED','AI DRAFTED','PRODUCT REVIEW','KEVIN REVIEW','READY','SUBMITTED','BLOCKED'
    )),
  assignee_role    text check (assignee_role in ('product','kevin','ar') or assignee_role is null),
  assignee_id      uuid references auth.users (id),
  fact_notes       text not null default '',
  type_tag         jsonb,
  word_limit       int,
  evidence         jsonb not null default '[]'::jsonb,
  reviewer_hooks   jsonb not null default '[]'::jsonb,
  lint             jsonb not null default '[]'::jsonb,
  conflicts        jsonb not null default '[]'::jsonb,
  suggestions      jsonb not null default '[]'::jsonb,
  ai_origin        boolean not null default false,
  needs_attention  boolean not null default false,
  updated_by       uuid references auth.users (id) default auth.uid(),
  updated_at       timestamptz not null default now()
);

create index if not exists answer_meta_questionnaire_idx on public.answer_meta (questionnaire_id);
create index if not exists answer_meta_state_idx on public.answer_meta (state);
create index if not exists answer_meta_assignee_idx on public.answer_meta (assignee_id);

create table if not exists public.import_log (
  id               bigint generated always as identity primary key,
  questionnaire_id text,
  export_version   text,
  generated_at     timestamptz,
  overwritten      int not null default 0,
  suggested        int not null default 0,
  skipped          int not null default 0,
  merged           int not null default 0,
  ran_by           uuid references auth.users (id) default auth.uid(),
  ran_at           timestamptz not null default now()
);

-- Reuse the existing touch trigger fn (defined in schema.sql) for updated_at/by.
drop trigger if exists answer_meta_touch on public.answer_meta;
create trigger answer_meta_touch
  before update on public.answer_meta
  for each row execute function public.touch_updated_at();

-- Realtime (guarded so the script is re-runnable).
do $$
begin
  alter publication supabase_realtime add table public.answer_meta;
exception when duplicate_object then null;
end $$;

-- RLS: same soft gate as answers (frontend invite-name list is the real gate).
alter table public.answer_meta enable row level security;
alter table public.import_log  enable row level security;

drop policy if exists "meta_any_auth" on public.answer_meta;
create policy "meta_any_auth"
  on public.answer_meta for all
  to authenticated using ( true ) with check ( true );

drop policy if exists "importlog_any_auth" on public.import_log;
create policy "importlog_any_auth"
  on public.import_log for all
  to authenticated using ( true ) with check ( true );
