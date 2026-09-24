-- Admin-authored "코이의 피드백" — the roaster's own hands-on notes after actually brewing a
-- recipe: which coffee they used, and what they found. Free text, never inferred or generated.

alter table brew_guides add column if not exists koi_feedback_coffee text;
alter table brew_guides add column if not exists koi_feedback_note text;
