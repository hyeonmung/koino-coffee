-- Splits 브루잉 레시피 (formerly "브루 가이드") into two sources:
-- 'KOI'  = written in-house by 코이노니아
-- 'OPEN' = a barista/roastery/brand's own publicly self-disclosed recipe, copied over with
--          attribution (competition_type/source_name/source_url), never scraped wholesale
--          from a third-party's compiled database.

alter table brew_guides add column if not exists source text not null default 'KOI';
alter table brew_guides add column if not exists competition_type text;
alter table brew_guides add column if not exists source_name text;
alter table brew_guides add column if not exists source_url text;

alter table brew_guides drop constraint if exists brew_guides_source_check;
alter table brew_guides add constraint brew_guides_source_check check (source in ('KOI', 'OPEN'));
