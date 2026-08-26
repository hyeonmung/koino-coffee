import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'

export default function BrewGuideIndexPage() {
  const guides = getPublishedBrewGuides()

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="브루 가이드" description="장비별 KOI 원두 추출 레시피." />
      <PublicHeader />

      <main className="mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BREW GUIDE</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">집에서 더 맛있게</h1>

        {guides.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            등록된 브루 가이드가 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.id} to={`/brew-guide/${guide.slug}`} className="border border-navy/15 bg-white p-6 hover:border-navy">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{guide.equipment}</p>
                <p className="mt-1 font-serif text-[18px] font-bold text-navy">{guide.title}</p>
                <p className="mt-2 text-[12px] text-navy/55">
                  {guide.coffeeDose} · {guide.ratio} · {guide.totalTime}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
