-- Hot/Iced distinction for 브루잉 레시피, so 오픈 레시피 can be filtered the same way as by dripper.
alter table brew_guides add column if not exists serving_style text;
alter table brew_guides drop constraint if exists brew_guides_serving_style_check;
alter table brew_guides add constraint brew_guides_serving_style_check check (serving_style is null or serving_style in ('HOT', 'ICED'));
