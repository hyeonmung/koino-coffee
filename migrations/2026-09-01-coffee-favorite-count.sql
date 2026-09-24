-- Aggregate "몇 명이 찜했는지" count for coffees. Favorites themselves live in each visitor's
-- localStorage (no account system on this site) — this column is just the running tally,
-- bumped by a narrow SECURITY DEFINER RPC (same pattern as increment_column_views /
-- increment_story_views) so anon visitors can adjust only this one counter, atomically,
-- without needing UPDATE rights on the rest of the row.

alter table coffees add column if not exists favorite_count integer not null default 0;

create or replace function adjust_coffee_favorite_count(p_slug text, p_delta integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update coffees
  set favorite_count = greatest(0, favorite_count + p_delta)
  where slug = p_slug
  returning favorite_count;
$$;

revoke all on function adjust_coffee_favorite_count(text, integer) from public;
grant execute on function adjust_coffee_favorite_count(text, integer) to anon, authenticated;
