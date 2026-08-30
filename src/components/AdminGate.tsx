import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import LoginForm from './LoginForm'
import { useSupabaseSession } from '../hooks/useSupabaseSession'

export default function AdminGate({ children }: { children: ReactNode }) {
  const session = useSupabaseSession()

  if (session === undefined) return null // avoid a login-form flash while the session check is in flight
  if (session) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-[320px] border border-navy/15 bg-white px-7 py-9 text-center">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-accent font-kicker">STAFF ONLY</p>
        <h1 className="mt-1 font-serif text-[18px] font-bold text-navy">관리자 페이지</h1>
        <p className="mt-2 text-[12px] text-navy/50">이메일과 비밀번호를 입력해 주세요.</p>

        <div className="mt-5">
          <LoginForm />
        </div>

        <Link to="/" className="mt-4 block text-[11px] text-navy/45 hover:text-navy">
          ← 갤러리로 돌아가기
        </Link>
      </div>
    </div>
  )
}
