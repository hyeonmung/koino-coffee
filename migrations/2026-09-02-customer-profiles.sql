-- Customer accounts (Kakao/Naver social login). auth.users already holds the real identity
-- (Supabase Auth) — this table is just the public-facing profile row for each customer.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  provider text not null default 'email',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "own_read" on profiles;
create policy "own_read" on profiles for select using (auth.uid() = id or is_admin());

drop policy if exists "own_write" on profiles;
create policy "own_write" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row the moment a new auth.users row appears (covers Kakao, Naver's
-- generateLink-created users, and any future email/password signups alike).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'provider', new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
