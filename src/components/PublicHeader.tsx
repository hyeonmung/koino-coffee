import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../data/supabaseClient'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'
import { useSupabaseSession } from '../hooks/useSupabaseSession'
import { useProfile } from '../hooks/useProfile'
import KOIStarField from './decorative/KOIStarField'
import LoginForm from './LoginForm'
import SocialLoginButtons from './SocialLoginButtons'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../hooks/useTheme'

function defaultNickname(email: string | undefined, provider: string): string {
  if (!email || !email.includes('@') || email.endsWith('@users.noreply.koinoniaroasters.co.kr')) return '내 계정'
  const [local, domain] = email.split('@')
  if (provider === 'naver') return `n_${local}`
  if (provider === 'kakao') {
    const domainName = domain.split('.')[0] ?? ''
    const front = domainName[0] ?? ''
    const mid = domainName[Math.floor(domainName.length / 2)] ?? ''
    return `k${front}${mid}_${local}`
  }
  return local
}

const NAV_LINKS = [
  { to: '/about', label: 'About 코이노니아' },
  { to: '/coffees', label: '원두' },
  { to: '/brew-guide', label: '브루잉 레시피' },
  { to: '/dictionary', label: '커피 사전' },
  { to: '/thekoimag', label: '더코이맥 칼럼' },
  { to: '/business', label: '납품 · 교육' },
]

export default function PublicHeader() {
  const settings = getSiteSettings()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameDraft, setNicknameDraft] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)
  const navigate = useNavigate()
  const session = useSupabaseSession()
  const { resolved } = useTheme()
  const { nickname, setNickname } = useProfile(session?.user.id)
  const loginBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loginOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (loginBoxRef.current && !loginBoxRef.current.contains(e.target as Node)) {
        setLoginOpen(false)
        setEditingNickname(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [loginOpen])

  // Locks the page behind the mobile menu overlay — `overflow: hidden` alone doesn't stop
  // iOS Safari's touch rubber-band scroll from leaking through to the body, so the body is
  // pinned in place (position: fixed) and its scroll position restored on close.
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const body = document.body.style
    const prev = { position: body.position, top: body.top, left: body.left, right: body.right, width: body.width }
    body.position = 'fixed'
    body.top = `-${scrollY}px`
    body.left = '0'
    body.right = '0'
    body.width = '100%'
    return () => {
      body.position = prev.position
      body.top = prev.top
      body.left = prev.left
      body.right = prev.right
      body.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const submitSearch = () => {
    if (!query.trim()) return
    navigate(`/coffees?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  const provider =
    (session?.user.user_metadata?.provider as string | undefined) ||
    (session?.user.app_metadata?.provider as string | undefined) ||
    'email'
  const resolvedNickname = session ? nickname || defaultNickname(session.user.email, provider) : ''
  const avatarUrl = session?.user.user_metadata?.avatar_url as string | undefined
  const emailToShow = session?.user.email?.endsWith('@users.noreply.koinoniaroasters.co.kr') ? undefined : session?.user.email

  const startEditNickname = () => {
    setNicknameDraft(nickname ?? resolvedNickname)
    setEditingNickname(true)
  }

  const saveNickname = async () => {
    const trimmed = nicknameDraft.trim()
    if (!trimmed) return
    setSavingNickname(true)
    await setNickname(trimmed)
    setSavingNickname(false)
    setEditingNickname(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/15 bg-surface">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-6 py-5">
        <Link to="/" className="flex min-w-0 shrink-0 items-center">
          <img
            src={resolved === 'dark' ? '/brand/koinonia-wordmark-gold.png' : '/brand/koinonia-wordmark.png'}
            alt="KOINONIA Roasters"
            className="h-14 w-auto shrink-0"
          />
        </Link>

        <nav className="hidden items-center gap-8 2xl:gap-10 xl:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative whitespace-nowrap text-[15px] font-semibold leading-none tracking-tight transition-colors after:absolute after:-bottom-[10px] after:left-0 after:h-[2px] after:bg-accent after:transition-all 2xl:text-[17px] ${
                  isActive ? 'text-ink after:w-full' : 'text-ink/70 after:w-0 hover:text-ink hover:after:w-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 border border-line/25 px-3 py-2 sm:flex">
            <button
              type="button"
              onClick={submitSearch}
              aria-label="검색"
              className="flex h-6 w-6 shrink-0 items-center justify-center text-[22px] leading-none text-ink/60 hover:text-ink"
            >
              ⌕
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="원두, 산지, 향미 검색"
              className="w-32 shrink-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink/35"
            />
          </div>

          {settings.purchaseUrl && (
            <a
              href={settings.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden border border-line bg-navy px-3.5 py-2 text-[11px] font-semibold tracking-[0.05em] text-warm-white hover:bg-navy-light sm:block"
            >
              온라인 구매
            </a>
          )}

          <div ref={loginBoxRef} className="relative hidden sm:block">
            {session ? (
              <>
                <button
                  type="button"
                  onClick={() => setLoginOpen((v) => !v)}
                  className="flex min-w-0 items-center gap-2 border border-line/25 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-ink/70 hover:border-line hover:text-ink"
                >
                  {avatarUrl && <img src={avatarUrl} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />}
                  <span className="max-w-[110px] truncate">{resolvedNickname}</span>
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[240px] border border-line/15 bg-surface p-4 shadow-lg">
                    {editingNickname ? (
                      <div>
                        <input
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                          placeholder="별명 입력"
                          autoFocus
                          className="w-full border border-line/25 px-2.5 py-2 text-[13px] text-ink outline-none focus:border-line"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={saveNickname}
                            disabled={savingNickname}
                            className="flex-1 border border-line bg-navy py-1.5 text-[11px] font-semibold text-warm-white disabled:opacity-50"
                          >
                            {savingNickname ? '저장 중…' : '저장'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNickname(false)}
                            className="flex-1 border border-line/25 py-1.5 text-[11px] font-semibold text-ink/70"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="break-words text-[13px] font-semibold text-ink">{resolvedNickname} 님, 안녕하세요</p>
                        {emailToShow && <p className="mt-1 truncate text-[11px] text-ink/45">{emailToShow}</p>}
                        <button
                          type="button"
                          onClick={startEditNickname}
                          className="mt-3 w-full border border-line/25 py-2 text-[11px] font-semibold text-ink/70 hover:border-line hover:text-ink"
                        >
                          닉네임 변경
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            supabase.auth.signOut()
                            setLoginOpen(false)
                          }}
                          className="mt-2 w-full border border-line/25 py-2 text-[11px] font-semibold text-ink/70 hover:border-line hover:text-ink"
                        >
                          로그아웃
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLoginOpen((v) => !v)}
                  className="border border-line/25 px-3 py-2 text-[11px] font-semibold tracking-[0.05em] text-ink/70 hover:border-line hover:text-ink"
                >
                  로그인
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] border border-line/15 bg-surface p-5 shadow-lg">
                    <SocialLoginButtons />
                    <LoginForm onSuccess={() => setLoginOpen(false)} />
                  </div>
                )}
              </>
            )}
          </div>

          <ThemeToggle className="border border-line/25 text-ink/70 hover:border-line hover:text-ink" />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-line/25 text-ink xl:hidden"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="모바일 메뉴"
          className="koi-night-sky fixed inset-x-0 top-[88px] bottom-0 z-30 overflow-y-auto xl:hidden"
        >
          <KOIStarField />
          <div className="relative flex flex-col gap-1 px-8 py-10">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
              placeholder="원두, 산지, 향미 검색"
              className="mb-6 w-full border border-warm-white/25 bg-transparent px-3 py-2.5 text-[13px] text-warm-white outline-none placeholder:text-warm-white/40 focus:border-warm-white/60"
            />
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `border-b border-warm-white/10 py-4 text-[16px] font-semibold tracking-[0.04em] ${
                    isActive ? 'text-accent' : 'text-warm-white/85'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-6 border-t border-warm-white/10 pt-6">
              {session ? (
                <div>
                  <p className="text-[14px] font-semibold text-warm-white/85">{resolvedNickname} 님, 안녕하세요</p>
                  {emailToShow && <p className="mt-0.5 truncate text-[11px] text-warm-white/45">{emailToShow}</p>}
                  {editingNickname ? (
                    <div className="mt-3">
                      <input
                        value={nicknameDraft}
                        onChange={(e) => setNicknameDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                        placeholder="별명 입력"
                        className="w-full border border-warm-white/25 bg-transparent px-2.5 py-2 text-[13px] text-warm-white outline-none focus:border-warm-white/60"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={saveNickname}
                          disabled={savingNickname}
                          className="flex-1 border border-warm-white/40 py-1.5 text-[11px] font-semibold text-warm-white disabled:opacity-50"
                        >
                          {savingNickname ? '저장 중…' : '저장'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNickname(false)}
                          className="flex-1 border border-warm-white/25 py-1.5 text-[11px] font-semibold text-warm-white/70"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={startEditNickname}
                        className="flex-1 border border-warm-white/25 px-3 py-1.5 text-[11px] font-semibold text-warm-white/85"
                      >
                        닉네임 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => supabase.auth.signOut()}
                        className="flex-1 border border-warm-white/25 px-3 py-1.5 text-[11px] font-semibold text-warm-white/85"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-warm-white/20 bg-surface p-5">
                  <SocialLoginButtons />
                  <LoginForm onSuccess={() => setOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
