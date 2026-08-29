// Not a secret — used only to decide whether the logged-in visitor sees the public-site
// quick-add tools (원두 추가 / 글쓰기). Real access control happens at the Supabase RLS layer
// (any authenticated user can write), this just decides what UI to show.
export const OWNER_EMAIL = 'hyeonnim98@naver.com'
