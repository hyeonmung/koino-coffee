-- Already applied directly (via the SQL editor, while adding the public business-inquiry
-- form) — kept here for the record, matching the other dated migration file.
--
-- The earlier migration gave every table, inquiries included, a public "select using (true)"
-- policy. That's fine for content tables, but inquiries holds submitters' contact info
-- (phone, email) — anyone with the public anon key could read every submission. This drops
-- that public-read policy on inquiries specifically (staff_write's "for all" already covers
-- authenticated read, so staff access is unaffected) and adds a public INSERT-only policy so
-- the new business-inquiry form (src/components/BusinessInquiryForm.tsx) can still submit
-- without a staff session.

drop policy if exists "public_read" on inquiries;

drop policy if exists "public_insert_inquiry" on inquiries;
create policy "public_insert_inquiry" on inquiries for insert with check (true);
