import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'

const NAV_LINKS = [
  { to: '/coffees', label: 'COFFEES' },
  { to: '/characters', label: 'CHARACTERS' },
  { to: '/discover', label: 'DISCOVER' },
  { to: '/dictionary', label: 'DICTIONARY' },
  { to: '/brew-guide', label: 'BREW GUIDE' },
  { to: '/stories', label: 'STORIES' },
]

export default function PublicHeader() {
  const settings = getSiteSettings()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-navy/15 bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
        <Link to="/" className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">{settings.brandName}</p>
          <p className="mt-0.5 truncate font-serif text-[18px] font-bold tracking-tight text-navy">
            {settings.logoText}
          </p>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[11px] font-semibold tracking-[0.1em] transition-colors ${
                  isActive ? 'text-navy' : 'text-navy/50 hover:text-navy'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/compare"
            className="border border-navy/25 px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-navy/70 hover:border-navy hover:text-navy"
          >
            COMPARE
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-navy/25 text-navy lg:hidden"
          aria-label="메뉴 열기"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy/15 bg-white px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {[...NAV_LINKS, { to: '/compare', label: 'COMPARE' }, { to: '/wholesale', label: 'WHOLESALE' }].map(
              (link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-[13px] font-semibold tracking-[0.08em] ${isActive ? 'text-navy' : 'text-navy/60'}`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
