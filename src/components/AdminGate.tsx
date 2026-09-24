import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import LoginForm from './LoginForm'
import { useSupabaseSession } from '../hooks/useSupabaseSession'
import useIsAdmin from '../hooks/useIsAdmin'

export default function AdminGate({ children }: { children: ReactNode }) {
  const session = useSupabaseSession()
  const isAdmin = useIsAdmin(session)

  if (session === undefined || (session && isAdmin === undefined)) return null // avoid a login-form flash while checks are in flight
  if (session && isAdmin) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-[320px] border border-line/15 bg-surface px-7 py-9 text-center">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-accent font-kicker">STAFF ONLY</p>
        <h1 className="mt-1 font-serif text-[18px] font-bold text-ink">관리자 페이지</h1>
        <p className="mt-2 text-[12px] text-ink/50">
          {session && isAdmin === false ? '관리자 계정으로만 접근할 수 있습니다.' : '이메일과 비밀번호를 입력해 주세요.'}
        </p>

        <div className="mt-5">
          <LoginForm onSuccess={() => {}} />
        </div>

        <Link to="/" className="mt-4 block text-[11px] text-ink/45 hover:text-ink">
          ← 갤러리로 돌아가기
        </Link>
      </div>
    </div>
  )
}
