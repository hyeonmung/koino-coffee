-- Category 1 (상품/가격 표시) additions: roasting/best-before dates, decaf flag, marketing
-- badges (BEST/추천/공식몰 단독), and two new stock states (품절 / 재입고 예정) alongside the
-- existing available/limited/archive. Admin-only fields — no RPC needed, existing staff_write
-- policy already covers writes; reads stay public.

alter table coffees add column if not exists roast_date date;
alter table coffees add column if not exists best_before_date date;
alter table coffees add column if not exists is_decaf boolean not null default false;
alter table coffees add column if not exists badges text[] not null default '{}';

alter table coffees drop constraint if exists coffees_availability_check;
alter table coffees add constraint coffees_availability_check
  check (availability in ('available', 'limited', 'archive', 'sold_out', 'restocking'));
