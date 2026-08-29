-- Creates the wholesale_requests table for the public order form on the "원두 납품" business
-- post (src/components/WholesaleOrderForm.tsx). Same privacy pattern as inquiries: anyone can
-- insert (submit the form), only staff (authenticated) can read/update/delete — this holds
-- submitters' name/phone/address, so it must NOT be publicly readable.

create table if not exists wholesale_requests (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text not null,
  address text not null,
  coffee_type text not null default '',
  expected_kg text not null default '',
  order_frequency text not null default '',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table wholesale_requests enable row level security;

drop policy if exists "staff_write" on wholesale_requests;
create policy "staff_write" on wholesale_requests for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "public_insert_wholesale" on wholesale_requests;
create policy "public_insert_wholesale" on wholesale_requests for insert with check (true);
