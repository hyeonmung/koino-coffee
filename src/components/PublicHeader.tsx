import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'
import KOIStarField from './decorative/KOIStarField'

const NAV_LINKS = [
  { to: '/coffees', label: '원두' },
  { to: '/coffee-chart', label: '원두 차트' },
  { to: '/discover', label: '취향 찾기' },
  { to: '/brew-guide', label: '브루 가이드' },
  { to: '/dictionary', label: '커피 사전' },
  { to: '/stories', label: '이야기' },
  { to: '/about', label: '코이노커피' },
  { to: '/business', label: '납품 · 교육' },
]

export default function PublicHeader() {
  const settings = getSiteSettings()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submitSearch = () => {
    if (!query.trim()) return
    navigate(`/coffees?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy/15 bg-white">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="min-w-0 shrink-0">
          <p className="text-[9px] font-semibold tracking-[0.35em] text-accent">{settings.brandName}</p>
          <p className="mt-0.5 truncate font-serif text-[21px] font-bold tracking-tight text-navy">
            {settings.logoText}
          </p>
        </Link>

        <nav className="hidden items-center gap-8 xl:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative whitespace-nowrap text-[15px] font-semibold leading-none tracking-tight transition-colors after:absolute after:-bottom-[9px] after:left-0 after:h-[2px] after:bg-accent after:transition-all ${
                  isActive ? 'text-navy after:w-full' : 'text-navy/70 after:w-0 hover:text-navy hover:after:w-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <div className="relative hidden items-center sm:flex">
            {searchOpen ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="원두, 산지, 향미 검색"
                className="w-48 border-b border-navy/30 bg-transparent py-1 text-[13px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
              />
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="검색"
                className="flex h-8 w-8 items-center justify-center text-[17px] text-navy/60 hover:text-navy"
              >
                ⌕
              </button>
            )}
          </div>

          {settings.purchaseUrl && (
            <a
              href={settings.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden border border-navy bg-navy px-3.5 py-2 text-[11px] font-semibold tracking-[0.05em] text-warm-white hover:bg-navy-light sm:block"
            >
              온라인 구매
            </a>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-navy/25 text-navy xl:hidden"
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
          </div>
        </nav>
      )}
    </header>
  )
}
