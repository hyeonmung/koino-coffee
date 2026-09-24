-- "코이의 브루잉 도구" — a simple admin-curated gallery of gear (image + name), shown on the
-- brew-guide index page below "최근 본 레시피". Mirrors brew_categories' shape (order + visible).

create table if not exists brew_tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table brew_tools enable row level security;

drop policy if exists public_read on brew_tools;
create policy public_read on brew_tools for select using (true);

drop policy if exists staff_write on brew_tools;
create policy staff_write on brew_tools for all using (is_admin()) with check (is_admin());
