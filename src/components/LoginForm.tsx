import { useState, type FormEvent } from 'react'
import { supabase } from '../data/supabaseClient'

/**
 * Shared by AdminGate (full-page) and PublicHeader's login popover (small) — same Supabase
 * Auth session either way, so signing in from one place unlocks the other automatically.
 */
export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message === 'Email not confirmed' ? '이메일 확인 링크를 먼저 눌러주세요.' : '이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError('')
        }}
        className="w-full border border-navy/25 bg-white px-3 py-2.5 text-center text-[16px] text-navy outline-none focus:border-navy"
        placeholder="이메일"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError('')
        }}
        className={`mt-2.5 w-full border bg-white px-3 py-2.5 text-center text-[16px] tracking-[0.15em] text-navy outline-none focus:border-navy ${
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
        {submitting ? '확인 중…' : '로그인'}
      </button>
    </form>
  )
}
