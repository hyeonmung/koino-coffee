-- Replaces the per-device (localStorage) "찜" with a real one-vote-per-account system now
-- that login exists. coffee_favorites is the source of truth; coffees.favorite_count (added
-- in 2026-09-01-coffee-favorite-count.sql) stays as a denormalized tally kept in sync by
-- toggle_coffee_favorite below, so existing read paths (Coffee.favoriteCount) don't change.

create table if not exists coffee_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  coffee_slug text not null references coffees(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, coffee_slug)
);

alter table coffee_favorites enable row level security;

drop policy if exists own_read on coffee_favorites;
create policy own_read on coffee_favorites for select using (auth.uid() = user_id);

drop policy if exists own_insert on coffee_favorites;
create policy own_insert on coffee_favorites for insert with check (auth.uid() = user_id);

drop policy if exists own_delete on coffee_favorites;
create policy own_delete on coffee_favorites for delete using (auth.uid() = user_id);

-- The old anonymous +1/-1 RPC trusted the client's delta with no per-user check — anyone could
-- inflate the count by calling it directly. Close that off now that voting is account-gated.
revoke all on function adjust_coffee_favorite_count(text, integer) from anon, authenticated;

create or replace function toggle_coffee_favorite(p_slug text)
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
    select 1 from coffee_favorites where user_id = v_uid and coffee_slug = p_slug
  ) into v_existing;

  if v_existing then
    delete from coffee_favorites where user_id = v_uid and coffee_slug = p_slug;
  else
    insert into coffee_favorites (user_id, coffee_slug) values (v_uid, p_slug);
  end if;

  update coffees
  set favorite_count = (select count(*) from coffee_favorites where coffee_slug = p_slug)
  where slug = p_slug
  returning coffees.favorite_count into v_count;

  return query select not v_existing, v_count;
end;
$$;

revoke all on function toggle_coffee_favorite(text) from public;
grant execute on function toggle_coffee_favorite(text) to authenticated;
