-- KOI SENSORY MAP — future Supabase (Postgres) schema.
--
-- This file is NOT wired to any live connection. The app currently runs entirely on
-- localStorage behind the repositories in src/data/repositories/*.ts. When a Supabase
-- project is available, this schema is the intended target: create the tables below,
-- then reimplement each repository against supabase-js while keeping the same exported
-- function signatures, and every page/component that calls them keeps working unchanged.

create extension if not exists "pgcrypto";

-- Supabase Auth provides auth.users. `profiles` extends it for staff accounts.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table characters (
  key text primary key check (key in ('CLEAR', 'VIVID', 'JUICY', 'CALM', 'ELEGANT')),
  label text not null,
  flavors text not null,
  description text not null,
  hero_copy text not null,
  image text,
  "order" integer not null
);

create table flavor_families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ko text,
  "order" integer not null default 0
);

create table flavor_descriptors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ko text,
  family_id uuid not null references flavor_families (id) on delete restrict,
  description text,
  aliases text[] not null default '{}'
);

create table origins (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  region text,
  subregion text
);

create table producers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  farm_or_station text
);

create table coffees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  availability text not null default 'available' check (availability in ('available', 'limited', 'archive')),

  coffee_name text not null,
  origin_id uuid references origins (id),
  producer_id uuid references producers (id),
  variety text,
  harvest text,
  lot text,
  grade text,
  altitude text,

  character_key text not null references characters (key),
  character_reason text,

  process text,
  process_description text,
  fermentation text,
  drying text,
  process_temperature text,
  process_duration text,

  roast_type text check (roast_type in ('Filter', 'Espresso', 'Omni')),
  roast_level text,
  roast_direction text,
  recommended_rest text,

  acidity smallint not null check (acidity between 1 and 5),
  sweetness smallint not null check (sweetness between 1 and 5),
  body smallint not null check (body between 1 and 5),
  finish smallint not null check (finish between 1 and 5),
  flavor smallint not null check (flavor between 1 and 5),
  accessibility smallint not null check (accessibility between 1 and 5),

  recommended_for text,
  story_id uuid,
  purchase_url text,
  hero_image text,

  seo_title text,
  seo_description text,
  profile_version integer not null default 1,

  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coffee <-> flavor descriptor tags (free-text notes today; normalized here for the future)
create table coffee_flavors (
  coffee_id uuid not null references coffees (id) on delete cascade,
  flavor_descriptor_id uuid references flavor_descriptors (id) on delete set null,
  note_text text not null,
  primary key (coffee_id, note_text)
);

create table brew_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  equipment text not null,
  title text not null,
  coffee_dose text,
  water text,
  ratio text,
  temperature text,
  grind text,
  total_time text,
  pour_steps jsonb not null default '[]',
  tips text,
  common_problems text,
  hero_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coffee_brew_guides (
  coffee_id uuid not null references coffees (id) on delete cascade,
  brew_guide_id uuid not null references brew_guides (id) on delete cascade,
  primary key (coffee_id, brew_guide_id)
);

create table stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  title text not null,
  excerpt text,
  body text not null,
  category text not null check (category in ('ORIGIN', 'COFFEE', 'ROASTING', 'BREWING', 'SENSORY', 'KOI', 'EDUCATION')),
  tags text[] not null default '{}',
  cover_image text,
  published_date date,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table coffees add constraint coffees_story_id_fkey foreign key (story_id) references stories (id) on delete set null;

create table media (
  id uuid primary key default gen_random_uuid(),
  bucket_path text not null,
  category text,
  alt_text text,
  uploaded_at timestamptz not null default now()
);

create table site_settings (
  id boolean primary key default true check (id), -- singleton row
  brand_name text not null,
  logo_text text not null,
  hero_title text not null,
  hero_subtitle text not null,
  hero_image text,
  hero_cta_primary_label text,
  hero_cta_primary_url text,
  hero_cta_secondary_label text,
  hero_cta_secondary_url text,
  phone text,
  address text,
  instagram_url text,
  naver_url text,
  purchase_url text,
  wholesale_url text,
  footer_note text,
  seo_default_title text,
  seo_default_description text,
  og_image text,
  homepage_featured_coffee_ids uuid[] not null default '{}',
  homepage_story_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  phone text,
  email text,
  business_type text,
  region text,
  expected_volume text,
  message text,
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table dictionary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  term_ko text,
  category text not null check (category in ('FLAVOR', 'SENSORY', 'PROCESS', 'VARIETY', 'GENERAL')),
  short_definition text not null,
  detailed_definition text,
  example text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: public (anon) role reads only published content;
-- writes require an authenticated staff session (checked via `profiles`).
alter table coffees enable row level security;
create policy "public read published coffees" on coffees for select using (publish_status = 'published');
create policy "staff full access coffees" on coffees for all using (auth.uid() is not null);

alter table stories enable row level security;
create policy "public read published stories" on stories for select using (publish_status = 'published');
create policy "staff full access stories" on stories for all using (auth.uid() is not null);

alter table brew_guides enable row level security;
create policy "public read published brew guides" on brew_guides for select using (publish_status = 'published');
create policy "staff full access brew guides" on brew_guides for all using (auth.uid() is not null);

alter table inquiries enable row level security;
create policy "staff read inquiries" on inquiries for select using (auth.uid() is not null);
create policy "anyone can submit an inquiry" on inquiries for insert with check (true);
