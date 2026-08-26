import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PASSWORD, ADMIN_UNLOCK_KEY } from '../constants/auth'

function isUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_UNLOCK_KEY, '1')
      } catch {
        // ignore storage errors — the unlock still applies for this render
      }
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[320px] border border-navy/15 bg-white px-7 py-9 text-center"
      >
        <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">STAFF ONLY</p>
        <h1 className="mt-1 font-serif text-[18px] font-bold text-navy">관리자 페이지</h1>
        <p className="mt-2 text-[12px] text-navy/50">비밀번호를 입력해 주세요.</p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(false)
          }}
          className={`mt-5 w-full border bg-white px-3 py-2.5 text-center text-[15px] tracking-[0.3em] text-navy outline-none focus:border-navy ${
            error ? 'border-red-400' : 'border-navy/25'
          }`}
          placeholder="••••"
        />
        {error && <p className="mt-2 text-[11px] text-red-500">비밀번호가 올바르지 않습니다.</p>}

        <button
          type="submit"
          className="mt-4 w-full border border-navy bg-navy py-2.5 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
        >
          입장
        </button>

        <Link to="/" className="mt-4 block text-[11px] text-navy/45 hover:text-navy">
          ← 갤러리로 돌아가기
        </Link>
      </form>
    </div>
  )
}
