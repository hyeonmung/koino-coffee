-- View counts for columns ("칼럼") and stories ("이야기"). Public visitors (anon key) may not
-- UPDATE these tables directly (see staff_write policies) — only admins can. To let an
-- anonymous page view still bump the counter, we expose a narrow SECURITY DEFINER RPC per
-- table that does nothing but increment `views` for one row, and GRANT EXECUTE on it to anon.
-- This keeps the row-level staff_write policy intact for every other field.

alter table columns add column if not exists views integer not null default 0;
alter table stories add column if not exists views integer not null default 0;

create or replace function increment_column_views(p_id text)
returns integer
language sql
security definer
set search_path = public
as $$
  update columns set views = views + 1 where id = p_id returning views;
$$;

create or replace function increment_story_views(p_id text)
returns integer
language sql
security definer
set search_path = public
as $$
  update stories set views = views + 1 where id = p_id returning views;
$$;

revoke all on function increment_column_views(text) from public;
revoke all on function increment_story_views(text) from public;
grant execute on function increment_column_views(text) to anon, authenticated;
grant execute on function increment_story_views(text) to anon, authenticated;
