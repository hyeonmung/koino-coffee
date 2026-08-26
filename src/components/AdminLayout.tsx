import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/coffees', label: '원두 관리' },
  { to: '/admin/characters', label: 'Character' },
  { to: '/admin/flavors', label: 'Flavor Library' },
  { to: '/admin/brew-guides', label: 'Brew Guide' },
  { to: '/admin/stories', label: 'Stories' },
  { to: '/admin/inquiries', label: '납품 문의' },
  { to: '/admin/settings', label: '사이트 설정' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-white">
      <header className="border-b border-navy/15 bg-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">KOINO COFFEE</p>
            <Link to="/admin" className="mt-0.5 block font-serif text-[18px] font-bold tracking-tight text-navy">
              KOI SENSORY MAP — Admin
            </Link>
          </div>
          <Link
            to="/"
            className="border border-navy/25 px-3.5 py-2 text-[12px] font-semibold tracking-wide text-navy/70 hover:border-navy hover:text-navy"
          >
            사이트 보기
          </Link>
        </div>
        <nav className="mx-auto flex max-w-[1320px] flex-wrap gap-1 px-6 pb-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
                  isActive ? 'border border-navy bg-navy text-warm-white' : 'border border-transparent text-navy/55 hover:text-navy'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1320px] px-6 py-8">{children}</main>
    </div>
  )
}
