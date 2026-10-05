-- "J&B" (Jazzy & Bluesy) monthly in-store playlist posts. One row per month, scheduled to
-- post on the 1st between 6-8am KST — same publish-gating pattern as `columns`.
create table if not exists playlists (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  title text not null,
  cover_image text,
  caption text not null default '',
  tracks text[] not null default '{}',
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table playlists enable row level security;

drop policy if exists "public_read" on playlists;
create policy "public_read" on playlists for select using (publish_status = 'published' and scheduled_at <= now());

drop policy if exists "staff_write" on playlists;
create policy "staff_write" on playlists for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
