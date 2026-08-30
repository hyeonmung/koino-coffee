create table if not exists columns (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'published' check (publish_status in ('draft', 'published', 'archived')),
  title text not null,
  excerpt text not null default '',
  trend_summary text not null,
  perspective text not null,
  store_note text,
  closing text,
  sources text,
  cover_image text,
  tags text[] not null default '{}',
  scheduled_at timestamptz not null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table columns enable row level security;

drop policy if exists "public_all" on columns;
drop policy if exists "public_read" on columns;

-- Time-gated, unlike the generic "public_read" pattern: a scheduled column must not be
-- readable by the anon key before its scheduled_at, even via a raw network request.
create policy "public_read" on columns for select using (publish_status = 'published' and scheduled_at <= now());

drop policy if exists "staff_write" on columns;
create policy "staff_write" on columns for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
