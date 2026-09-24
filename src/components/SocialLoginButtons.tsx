import { supabase } from '../data/supabaseClient'

/** Kakao (via Supabase's built-in OAuth provider) + Naver (via api/auth/naver/*, a custom bridge — Supabase has no native Naver provider). */
export default function SocialLoginButtons() {
  const kakaoLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const naverLogin = () => {
    window.location.href = `/api/auth/naver/start?redirectTo=${encodeURIComponent(window.location.pathname)}`
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={kakaoLogin}
        className="w-full rounded-[4px] bg-[#FEE500] py-2.5 text-[13px] font-semibold text-[#191600] hover:brightness-95"
      >
        카카오로 로그인
      </button>
      <button
        type="button"
        onClick={naverLogin}
        className="w-full rounded-[4px] bg-[#03C75A] py-2.5 text-[13px] font-semibold text-white hover:brightness-95"
      >
        네이버로 로그인
      </button>
      <div className="flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-line/10" />
        <span className="text-[10px] text-ink/35">또는 관리자 이메일로</span>
        <div className="h-px flex-1 bg-line/10" />
      </div>
    </div>
  )
}
