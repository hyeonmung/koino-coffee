-- KOI SENSORY MAP / KOINONIA — live Supabase (Postgres) schema.
--
-- Mirrors src/data/schema.ts + src/types.ts field-for-field (snake_case columns,
-- jsonb for nested objects/arrays). Run once against a fresh project. Safe to re-run
-- individual `create table if not exists` blocks, but DROP statements at the top are
-- destructive — only meant for the first-time setup of an empty project.
--
-- Auth model: staff sign in via Supabase Auth (email + password — see
-- src/components/AdminGate.tsx). RLS is enabled on every table: anyone can read
-- (the public site needs that), but insert/update/delete requires an authenticated
-- session. See migrations/2026-08-29-admin-auth-and-cleanup.sql for the script that
-- moved a project from the old fully-open "public_all" policy to this.

create extension if not exists "pgcrypto";

drop table if exists inquiries cascade;
drop table if exists dictionary_terms cascade;
drop table if exists spotlight_slides cascade;
drop table if exists about_page_settings cascade;
drop table if exists about_blocks cascade;
drop table if exists site_settings cascade;
drop table if exists business_posts cascade;
drop table if exists coffees cascade;
drop table if exists stories cascade;
drop table if exists brew_guides cascade;
drop table if exists brew_categories cascade;
drop table if exists flavor_descriptors cascade;
drop table if exists flavor_families cascade;
drop table if exists characters cascade;

-- ── Characters (fixed 5-key taxonomy) ───────────────────────────────────────
create table if not exists characters (
  key text primary key check (key in ('CLEAR', 'VIVID', 'JUICY', 'CALM', 'ELEGANT')),
  label text not null,
  flavors text not null,
  description text not null,
  hero_copy text not null,
  image text,
  "order" integer not null
);

-- ── Flavor taxonomy ──────────────────────────────────────────────────────────
create table if not exists flavor_families (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  name_ko text,
  "order" integer not null default 0
);

create table if not exists flavor_descriptors (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  name_ko text,
  family_id text not null references flavor_families (id) on delete restrict,
  description text,
  example text,
  aliases text[] not null default '{}',
  color jsonb -- { onLight, onDark } | null
);

-- ── Brew guides ──────────────────────────────────────────────────────────────
create table if not exists brew_categories (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  label text not null,
  label_en text not null,
  "order" integer not null default 0,
  visible boolean not null default true
);

create table if not exists brew_guides (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  category_id text references brew_categories (id) on delete set null,
  equipment text not null,
  title text not null,
  coffee_dose text,
  water text,
  ratio text,
  temperature text,
  grind text,
  total_time text,
  pour_steps jsonb not null default '[]', -- BrewPourStep[]
  tips text,
  common_problems text,
  hero_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Stories ──────────────────────────────────────────────────────────────────
create table if not exists stories (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  title text not null,
  excerpt text not null default '',
  body text not null,
  category text not null check (category in ('NEWS', 'ORIGIN', 'COFFEE', 'ROASTING', 'BREWING', 'SENSORY', 'KOI', 'EDUCATION')),
  tags text[] not null default '{}',
  cover_image text,
  published_date date not null default current_date,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Coffees ──────────────────────────────────────────────────────────────────
create table if not exists coffees (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  availability text not null default 'available' check (availability in ('available', 'limited', 'archive')),
  coffee_number integer unique,

  coffee_name text not null,
  korean_name text,
  country text not null default '',
  region text not null default '',
  subregion text,
  farm_or_station text,
  producer text not null default '',
  variety text not null default '',
  harvest text,
  lot text,
  grade text,
  altitude text not null default '',

  character text not null references characters (key),
  character_reason text,

  process text not null default '',
  process_description text,
  fermentation text,
  drying text,
  process_temperature text,
  process_duration text,

  roast_type text check (roast_type in ('Filter', 'Espresso', 'Omni')),
  roast_level text not null default '',
  roast_direction text,
  recommended_rest text,
  roaster text,
  roast_data jsonb, -- AdvancedRoastData | null
  roaster_comment text,
  barista_comment text,

  notes text[] not null default '{}',
  acidity smallint not null default 3 check (acidity between 1 and 5),
  sweetness smallint not null default 3 check (sweetness between 1 and 5),
  body smallint not null default 3 check (body between 1 and 5),
  finish smallint not null default 3 check (finish between 1 and 5),
  flavor smallint not null default 3 check (flavor between 1 and 5),
  accessibility smallint not null default 3 check (accessibility between 1 and 5),

  brew_guide_ids text[] not null default '{}',
  recommended_for text,
  story_id text references stories (id) on delete set null,
  purchase_url text,
  hero_image text,
  image_focal_point text check (image_focal_point in ('center', 'top', 'bottom', 'left', 'right')),
  chart_visible boolean not null default true,

  seo_title text,
  seo_description text,
  profile_version integer not null default 1,
  is_sample boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Business (wholesale/education) posts ────────────────────────────────────
create table if not exists business_posts (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  publish_status text not null default 'draft' check (publish_status in ('draft', 'published', 'archived')),
  title text not null,
  category text not null check (category in ('WHOLESALE', 'EDUCATION', 'CLASS', 'NOTICE', 'PARTNERSHIP')),
  cover_image text,
  excerpt text not null default '',
  body text not null,
  published_date date not null default current_date,
  related_links jsonb not null default '[]', -- BusinessLink[]
  is_system_pinned boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Site settings (singleton) ───────────────────────────────────────────────
create table if not exists site_settings (
  id boolean primary key default true check (id),
  brand_name text not null default 'KOINONIA',
  logo_text text not null default 'KOINONIA',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  hero_image text,
  hero_cta_primary_label text not null default '',
  hero_cta_primary_url text not null default '',
  hero_cta_secondary_label text not null default '',
  hero_cta_secondary_url text not null default '',
  phone text,
  address text,
  business_hours text,
  business_registration_info text,
  instagram_url text,
  naver_url text,
  purchase_url text,
  business_url text,
  footer_note text,
  seo_default_title text not null default '',
  seo_default_description text not null default '',
  og_image text,
  homepage_featured_coffee_ids text[] not null default '{}',
  homepage_story_ids text[] not null default '{}',
  home_section_visibility jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ── About page: editorial block CMS ─────────────────────────────────────────
create table if not exists about_blocks (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('BRAND', 'PERSON', 'CAREER_LIST', 'IMAGE_TEXT', 'IMAGE_FULL', 'GALLERY', 'QUOTE', 'PHILOSOPHY', 'FREE_TEXT', 'CTA')),
  visible boolean not null default true,
  "order" integer not null default 0,

  layout text not null default 'TEXT_FULL' check (layout in ('PHOTO_LEFT_TEXT_RIGHT', 'TEXT_LEFT_PHOTO_RIGHT', 'PHOTO_LARGE', 'TEXT_LARGE', 'PHOTO_FULL', 'TEXT_FULL', 'CUSTOM')),
  custom_image_cols integer,
  custom_image_side text check (custom_image_side in ('LEFT', 'RIGHT')),
  vertical_align text not null default 'CENTER' check (vertical_align in ('TOP', 'CENTER', 'BOTTOM')),
  text_align text not null default 'LEFT' check (text_align in ('LEFT', 'CENTER', 'RIGHT')),
  background text not null default 'WHITE' check (background in ('PAPER', 'WHITE', 'NIGHT', 'SOFT')),
  spacing text not null default 'NORMAL' check (spacing in ('TIGHT', 'NORMAL', 'WIDE')),
  text_width text not null default 'NORMAL' check (text_width in ('NARROW', 'NORMAL', 'WIDE')),
  mobile_order text not null default 'TEXT_FIRST' check (mobile_order in ('IMAGE_FIRST', 'TEXT_FIRST')),

  title text,
  subtitle text,
  body text,
  quote text,
  caption text,
  cta_label text,
  cta_url text,

  image text,
  image_alt text,
  image_ratio text check (image_ratio in ('4:5', '3:4', '1:1', '3:2', '16:9', 'ORIGINAL')),
  image_focal_point text check (image_focal_point in ('center', 'top', 'bottom', 'left', 'right')),

  gallery_images jsonb not null default '[]', -- { url, caption? }[]
  gallery_columns smallint check (gallery_columns in (2, 3)),

  person_name text,
  person_english_name text,
  person_role text,
  person_english_role text,
  careers jsonb not null default '[]', -- AboutCareerItem[]

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_page_settings (
  id boolean primary key default true check (id),
  hero_title text not null default '',
  hero_subtitle text,
  hero_image_desktop text,
  hero_image_mobile text,
  hero_overlay text not null default 'medium' check (hero_overlay in ('low', 'medium', 'high')),
  hero_text_position_desktop text not null default 'LEFT' check (hero_text_position_desktop in ('LEFT', 'CENTER', 'RIGHT')),
  hero_text_position_mobile text not null default 'LEFT' check (hero_text_position_mobile in ('LEFT', 'CENTER')),
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

-- ── Home hero "KOI SPOTLIGHT" carousel ───────────────────────────────────────
create table if not exists spotlight_slides (
  id text primary key default gen_random_uuid()::text,
  content_type text not null check (content_type in ('FEATURED_COFFEE', 'NOTICE', 'EVENT', 'STORY', 'VIDEO', 'BREW', 'EDUCATION', 'BUSINESS', 'CUSTOM')),
  "order" integer not null default 0,
  published boolean not null default false,

  linked_id text, -- Coffee/Story/BrewGuide id — no FK (points at different tables per content_type)

  label text,
  title text not null,
  description text,
  cta_text text,
  cta_url text,

  desktop_image text,
  mobile_image text,
  video_url text,
  video_poster text,
  alt_text text,
  overlay_strength text not null default 'medium' check (overlay_strength in ('low', 'medium', 'high')),

  start_date date,
  end_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Coffee dictionary ────────────────────────────────────────────────────────
create table if not exists dictionary_terms (
  id text primary key default gen_random_uuid()::text,
  term text not null,
  term_ko text,
  category text not null check (category in ('FLAVOR', 'SENSORY', 'PROCESS', 'VARIETY', 'GENERAL')),
  short_definition text not null,
  detailed_definition text,
  example text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Wholesale/education inquiries ───────────────────────────────────────────
create table if not exists inquiries (
  id text primary key default gen_random_uuid()::text,
  company_name text not null,
  contact_name text not null,
  phone text not null default '',
  email text not null default '',
  business_type text not null default '',
  region text not null default '',
  interest_area text,
  expected_volume text,
  message text not null default '',
  consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Every content table: public read (the site needs that), staff-only write. inquiries is
-- the one exception — it holds submitters' contact info, so it's staff-read-only, with a
-- separate public-insert policy instead (the public business-inquiry form on /business
-- needs to write without a staff session; see src/components/BusinessInquiryForm.tsx and
-- migrations/2026-08-29-admin-auth-and-cleanup.sql for how this evolved).
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'characters', 'flavor_families', 'flavor_descriptors', 'brew_categories', 'brew_guides',
      'stories', 'coffees', 'business_posts', 'site_settings', 'about_blocks',
      'about_page_settings', 'spotlight_slides', 'dictionary_terms', 'inquiries'
    ])
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public_all" on %I', t);
    execute format('drop policy if exists "public_read" on %I', t);
    if t <> 'inquiries' then
      execute format('create policy "public_read" on %I for select using (true)', t);
    end if;
    execute format('drop policy if exists "staff_write" on %I', t);
    execute format(
      'create policy "staff_write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t
    );
  end loop;
end $$;

drop policy if exists "public_insert_inquiry" on inquiries;
create policy "public_insert_inquiry" on inquiries for insert with check (true);
