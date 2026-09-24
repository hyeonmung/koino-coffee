-- Price display for coffees ("200g  20,000원(취소선)  18,000원" style). Admin-only field —
-- no RPC needed, the existing staff_write policy on coffees already covers it.
alter table coffees add column if not exists weight_grams integer;
alter table coffees add column if not exists price integer;
alter table coffees add column if not exists sale_price integer;
