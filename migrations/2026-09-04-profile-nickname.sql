-- User-chosen nickname, separate from profiles.display_name (which is just a bookkeeping
-- copy of the social provider's raw name at signup). NULL until the user explicitly sets one
-- via the header's "개인정보" editor — the frontend computes a provider-based default
-- (n_<local>, k<xx>_<local>) when this is null. RLS: existing "own_write" policy on profiles
-- already covers this (auth.uid() = id), no new policy needed.
alter table profiles add column if not exists nickname text;
