-- Adds an admin-entered rating (never computed) and an account-based "찜" system for brew_guides,
-- mirroring coffee_favorites / toggle_coffee_favorite exactly (see
-- 2026-09-10-coffee-favorites-per-account.sql) — one vote per logged-in account, tallied into a
-- denormalized brew_guides.favorite_count kept in sync by the RPC below.

alter table brew_guides add column if not exists rating numeric;
alter table brew_guides add column if not exists favorite_count integer not null default 0;

create table if not exists brew_guide_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  brew_guide_slug text not null references brew_guides(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, brew_guide_slug)
);

alter table brew_guide_favorites enable row level security;

drop policy if exists own_read on brew_guide_favorites;
create policy own_read on brew_guide_favorites for select using (auth.uid() = user_id);

drop policy if exists own_insert on brew_guide_favorites;
create policy own_insert on brew_guide_favorites for insert with check (auth.uid() = user_id);

drop policy if exists own_delete on brew_guide_favorites;
create policy own_delete on brew_guide_favorites for delete using (auth.uid() = user_id);

create or replace function toggle_brew_guide_favorite(p_slug text)
returns table (favorited boolean, favorite_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing boolean;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1 from brew_guide_favorites where user_id = v_uid and brew_guide_slug = p_slug
  ) into v_existing;

  if v_existing then
    delete from brew_guide_favorites where user_id = v_uid and brew_guide_slug = p_slug;
  else
    insert into brew_guide_favorites (user_id, brew_guide_slug) values (v_uid, p_slug);
  end if;

  update brew_guides
  set favorite_count = (select count(*) from brew_guide_favorites where brew_guide_slug = p_slug)
  where slug = p_slug
  returning brew_guides.favorite_count into v_count;

  return query select not v_existing, v_count;
end;
$$;

revoke all on function toggle_brew_guide_favorite(text) from public;
grant execute on function toggle_brew_guide_favorite(text) to authenticated;
