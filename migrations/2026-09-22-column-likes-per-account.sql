-- "좋아요" for 더코이맥 칼럼, mirroring coffee_favorites / toggle_coffee_favorite exactly
-- (see 2026-09-10-coffee-favorites-per-account.sql): one vote per logged-in account,
-- column_likes is the source of truth, columns.like_count is a denormalized tally kept in
-- sync by toggle_column_like so read paths (Column.likeCount) stay a plain number.

alter table columns add column if not exists like_count integer not null default 0;

create table if not exists column_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  column_slug text not null references columns(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, column_slug)
);

alter table column_likes enable row level security;

drop policy if exists own_read on column_likes;
create policy own_read on column_likes for select using (auth.uid() = user_id);

drop policy if exists own_insert on column_likes;
create policy own_insert on column_likes for insert with check (auth.uid() = user_id);

drop policy if exists own_delete on column_likes;
create policy own_delete on column_likes for delete using (auth.uid() = user_id);

create or replace function toggle_column_like(p_slug text)
returns table (liked boolean, like_count integer)
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
    select 1 from column_likes where user_id = v_uid and column_slug = p_slug
  ) into v_existing;

  if v_existing then
    delete from column_likes where user_id = v_uid and column_slug = p_slug;
  else
    insert into column_likes (user_id, column_slug) values (v_uid, p_slug);
  end if;

  update columns
  set like_count = (select count(*) from column_likes where column_slug = p_slug)
  where slug = p_slug
  returning columns.like_count into v_count;

  return query select not v_existing, v_count;
end;
$$;

revoke all on function toggle_column_like(text) from public;
grant execute on function toggle_column_like(text) to authenticated;
