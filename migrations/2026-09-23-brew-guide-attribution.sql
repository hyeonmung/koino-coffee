-- Adds a verified attribution record alongside the existing source_name/source_url columns
-- (kept, not dropped, for now) so every OPEN recipe carries who confirmed it, where, and when —
-- never cup-timer.com or any other compiled third-party recipe site, which are lookup hints
-- only, never a citable source.
alter table brew_guides add column if not exists attribution jsonb;
alter table brew_guides add column if not exists verification_status text;
alter table brew_guides add column if not exists verification_note text;

alter table brew_guides drop constraint if exists brew_guides_verification_status_check;
alter table brew_guides add constraint brew_guides_verification_status_check
  check (verification_status is null or verification_status in ('VERIFIED', 'SOURCE_NOT_VERIFIED', 'CONFLICTING_SOURCE', 'NEEDS_MANUAL_REVIEW'));

-- Existing OPEN rows' source_name/source_url pointed at a secondary repost (a partner blog),
-- not the creator's own official channel — mark them for re-verification rather than carrying
-- old data forward as if already verified under the new, stricter rules.
update brew_guides set verification_status = 'NEEDS_MANUAL_REVIEW' where source = 'OPEN';
update brew_guides set verification_status = 'VERIFIED' where source = 'KOI';
