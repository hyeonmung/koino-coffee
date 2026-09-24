-- Critical fix, required before adding any customer-facing login (Kakao/Naver): every
-- "staff_write" RLS policy currently reads `auth.role() = 'authenticated'`, which means
-- ANY signed-in Supabase Auth user — including a future customer who signs in with
-- Kakao/Naver — can write to every admin-managed table. This replaces that check with a
-- real admin allowlist.

create table if not exists admin_emails (
  email text primary key
);
alter table admin_emails enable row level security;
-- No public policy at all: only the postgres/service role can read or write this table,
-- exactly what we want for an allowlist.

insert into admin_emails (email) values ('hyeonnim98@naver.com')
on conflict (email) do nothing;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_emails where email = auth.jwt() ->> 'email'
  );
$$;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'characters', 'flavor_families', 'flavor_descriptors', 'brew_categories', 'brew_guides',
      'stories', 'coffees', 'business_posts', 'site_settings', 'about_blocks',
      'about_page_settings', 'spotlight_slides', 'dictionary_terms', 'inquiries',
      'columns', 'wholesale_requests'
    ])
  loop
    execute format('drop policy if exists "staff_write" on %I', t);
    execute format('create policy "staff_write" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

drop policy if exists "staff_write_images" on storage.objects;
create policy "staff_write_images" on storage.objects
  for all using (bucket_id = 'images' and is_admin())
  with check (bucket_id = 'images' and is_admin());
