-- AR questionnaire content-management layer.
-- Run after schema.sql in Supabase SQL Editor.

create table if not exists public.questionnaire_catalog (
  id             text primary key,
  slug           text not null unique,
  definition     jsonb not null,
  is_published   boolean not null default false,
  source_name    text,
  storage_path   text,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.reports (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  file_name      text not null,
  storage_path   text not null unique,
  mime_type      text not null default 'application/octet-stream',
  size_bytes     bigint not null default 0,
  is_published   boolean not null default false,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.touch_content_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists questionnaire_catalog_touch_updated_at on public.questionnaire_catalog;
create trigger questionnaire_catalog_touch_updated_at
  before update on public.questionnaire_catalog
  for each row execute function public.touch_content_updated_at();

drop trigger if exists reports_touch_updated_at on public.reports;
create trigger reports_touch_updated_at
  before update on public.reports
  for each row execute function public.touch_content_updated_at();

alter table public.questionnaire_catalog enable row level security;
alter table public.reports enable row level security;

drop policy if exists "questionnaire_catalog_read" on public.questionnaire_catalog;
drop policy if exists "questionnaire_catalog_write" on public.questionnaire_catalog;
drop policy if exists "reports_read" on public.reports;
drop policy if exists "reports_write" on public.reports;

create policy "questionnaire_catalog_read"
  on public.questionnaire_catalog for select to authenticated using (true);
create policy "questionnaire_catalog_write"
  on public.questionnaire_catalog for all to authenticated using (true) with check (true);
create policy "reports_read"
  on public.reports for select to authenticated using (true);
create policy "reports_write"
  on public.reports for all to authenticated using (true) with check (true);

-- Shared private storage bucket. Downloads use short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('ar-reports', 'ar-reports', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "ar_reports_read" on storage.objects;
drop policy if exists "ar_reports_insert" on storage.objects;
drop policy if exists "ar_reports_update" on storage.objects;
drop policy if exists "ar_reports_delete" on storage.objects;

create policy "ar_reports_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'ar-reports');
create policy "ar_reports_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ar-reports');
create policy "ar_reports_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'ar-reports') with check (bucket_id = 'ar-reports');
create policy "ar_reports_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ar-reports');

-- Enable realtime safely when the tables are not already in the publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'questionnaire_catalog'
  ) then
    alter publication supabase_realtime add table public.questionnaire_catalog;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reports'
  ) then
    alter publication supabase_realtime add table public.reports;
  end if;
end $$;
