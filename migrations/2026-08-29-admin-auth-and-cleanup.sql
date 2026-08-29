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
--  3. Creates a public "images" storage bucket, with the same public-read /
--     staff-write split as the tables above. Uploaded images (coffee photos,
--     the About page hero, etc.) were being stored as base64 text directly in
--     the database — this bucket is where scripts/migrate-images-to-storage.mjs
--     moves the existing ones to, and where new uploads go from now on
--     (src/components/admin/ImageUploadField.tsx).

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

-- ── 3. Public image storage bucket ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "public_read_images" on storage.objects;
create policy "public_read_images" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "staff_write_images" on storage.objects;
create policy "staff_write_images" on storage.objects
  for all using (bucket_id = 'images' and auth.role() = 'authenticated')
  with check (bucket_id = 'images' and auth.role() = 'authenticated');
