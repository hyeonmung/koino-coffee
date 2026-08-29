-- Run this ONCE in the Supabase dashboard → SQL Editor, against the live project
-- (mspvnqoqlvwzdihrimym). Safe to run: nothing here deletes rows, only tightens
-- write access and drops 4 unused columns. Idempotent — safe to re-run if unsure
-- whether it already ran.
--
-- What this does:
--  1. Replaces the old fully-open RLS policy ("public_all" — anyone with the
--     public anon key could insert/update/delete anything) with: public read,
--     but insert/update/delete only allowed for a signed-in (authenticated)
--     Supabase Auth session. The admin panel now signs staff in for real
--     (src/components/AdminGate.tsx) instead of just checking a password that
--     was sitting in plain text in the shipped JavaScript.
--  2. Drops 4 database columns (about_intro/about_sections/business_intro/
--     business_sections on site_settings) that the app stopped reading/writing
--     back on 2026-08-29 — they were replaced by the About block editor and the
--     business_posts content system.

-- ── 1. Tighten row-level security ───────────────────────────────────────────
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
    execute format('create policy "public_read" on %I for select using (true)', t);

    execute format('drop policy if exists "staff_write" on %I', t);
    execute format(
      'create policy "staff_write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t
    );
  end loop;
end $$;

-- ── 2. Drop unused site_settings columns ────────────────────────────────────
alter table site_settings drop column if exists about_intro;
alter table site_settings drop column if exists about_sections;
alter table site_settings drop column if exists business_intro;
alter table site_settings drop column if exists business_sections;
