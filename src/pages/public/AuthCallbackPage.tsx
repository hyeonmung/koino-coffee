import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSupabaseSession } from '../../hooks/useSupabaseSession'

/**
 * Landing spot for both login paths: Supabase's own Kakao OAuth redirect (session tokens
 * arrive in the URL hash, picked up automatically by the Supabase client's detectSessionInUrl),
 * and api/auth/naver/callback's redirect through Supabase's magic-link verify endpoint (same
 * hash-token mechanism). Either way, once useSupabaseSession resolves we just bounce onward.
 */
export default function AuthCallbackPage() {
  const session = useSupabaseSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (session === undefined) return
    const requested = searchParams.get('redirectTo')
    // Internal paths only — never hand an absolute/protocol-relative URL to navigate().
    const redirectTo = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'
    navigate(session ? redirectTo : '/', { replace: true })
  }, [session, navigate, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <p className="text-[13px] text-ink/50">로그인 처리 중…</p>
    </div>
  )
}
