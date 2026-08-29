import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../data/supabaseClient'

export default function AdminGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // undefined = still checking
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null // avoid a login-form flash while the session check is in flight
  if (session) return <>{children}</>

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) setError(signInError.message === 'Email not confirmed' ? '이메일 확인 링크를 먼저 눌러주세요.' : '이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-[320px] border border-navy/15 bg-white px-7 py-9 text-center">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">STAFF ONLY</p>
        <h1 className="mt-1 font-serif text-[18px] font-bold text-navy">관리자 페이지</h1>
        <p className="mt-2 text-[12px] text-navy/50">이메일과 비밀번호를 입력해 주세요.</p>

        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          className="mt-5 w-full border border-navy/25 bg-white px-3 py-2.5 text-center text-[14px] text-navy outline-none focus:border-navy"
          placeholder="이메일"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          className={`mt-2.5 w-full border bg-white px-3 py-2.5 text-center text-[15px] tracking-[0.15em] text-navy outline-none focus:border-navy ${
            error ? 'border-red-400' : 'border-navy/25'
          }`}
          placeholder="비밀번호"
        />
        {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full border border-navy bg-navy py-2.5 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light disabled:opacity-50"
        >
          {submitting ? '확인 중…' : '입장'}
        </button>

        <Link to="/" className="mt-4 block text-[11px] text-navy/45 hover:text-navy">
          ← 갤러리로 돌아가기
        </Link>
      </form>
    </div>
  )
}
