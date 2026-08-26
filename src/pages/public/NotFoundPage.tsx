import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="페이지를 찾을 수 없습니다" noIndex />
      <PublicHeader />

      <main className="mx-auto max-w-[560px] px-6 py-24 text-center">
        <p className="font-serif text-[64px] font-bold text-navy/15">404</p>
        <h1 className="mt-2 font-serif text-[22px] font-bold text-navy">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-[13px] text-navy/55">주소가 잘못되었거나 삭제된 페이지일 수 있습니다.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
          >
            홈으로 이동
          </Link>
          <Link
            to="/coffees"
            className="border border-navy/25 px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-navy hover:border-navy"
          >
            원두 둘러보기
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
