import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { supabase } from '../data/supabaseClient'

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/home', label: '홈 관리' },
  { to: '/admin/spotlight', label: '메인 스포트라이트' },
  { to: '/admin/about', label: 'About 코이노니아' },
  { to: '/admin/coffees', label: '원두 관리' },
  { to: '/admin/characters', label: '캐릭터 관리' },
  { to: '/admin/flavors', label: '향미 관리' },
  { to: '/admin/dictionary', label: '커피 사전' },
  { to: '/admin/brew-guides', label: '브루 가이드' },
  { to: '/admin/columns', label: '칼럼 관리' },
  { to: '/admin/stories', label: '이야기' },
  { to: '/admin/business', label: '납품 · 교육' },
  { to: '/admin/inquiries', label: '문의 관리' },
  { to: '/admin/wholesale-requests', label: '납품 신청' },
  { to: '/admin/settings', label: '사이트 설정' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-white">
      <header className="border-b border-navy/15 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/brand/koi-logo.png" alt="" className="h-11 w-11 shrink-0" />
            <span>
              <p className="text-[10px] font-semibold tracking-[0.35em] text-accent font-kicker">코이노니아 로스터스</p>
              <p className="mt-0.5 block font-serif text-[18px] font-bold tracking-tight text-navy">KOINONIA — 관리자</p>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="border border-navy/25 px-3.5 py-2 text-[12px] font-semibold tracking-wide text-navy/70 hover:border-navy hover:text-navy"
            >
              사이트 보기
            </Link>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="border border-navy/25 px-3.5 py-2 text-[12px] font-semibold tracking-wide text-navy/70 hover:border-navy hover:text-navy"
            >
              로그아웃
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1240px] flex-wrap gap-1 px-6 pb-3">
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

      <main className="mx-auto max-w-[1240px] px-6 py-8">{children}</main>
    </div>
  )
}
