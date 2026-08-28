import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getBrewGuideBySlug } from '../../data/repositories/brewGuideRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'

export default function BrewGuideDetailPage() {
  const { slug = '' } = useParams()
  const guide = useMemo(() => getBrewGuideBySlug(slug), [slug])
  const coffees = useMemo(() => getPublishedCoffees(), [])

  if (!guide) return <Navigate to="/brew-guide" replace />

  const recommended = coffees.filter((c) => c.brewGuideIds.includes(guide.id)).slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={guide.title} description={`${guide.equipment} 추출 레시피 — ${guide.coffeeDose}, ${guide.ratio}`} />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">{guide.equipment}</p>
        <h1 className="mt-1 text-[28px] font-bold text-navy">{guide.title}</h1>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          <SpecCell label="원두량" value={guide.coffeeDose} />
          <SpecCell label="물" value={guide.water} />
          <SpecCell label="비율" value={guide.ratio} />
          <SpecCell label="물 온도" value={guide.temperature} />
          <SpecCell label="분쇄도" value={guide.grind} />
          <SpecCell label="추출 시간" value={guide.totalTime} />
        </div>

        {guide.pourSteps.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[16px] font-bold text-navy">추출 순서</h2>
            <div className="mt-4 space-y-2">
              {guide.pourSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 border border-navy/15 bg-white px-4 py-2.5">
                  <span className="w-8 text-[11px] font-semibold text-navy/40">{step.time}</span>
                  <span className="flex-1 text-[13px] font-semibold text-navy">{step.label}</span>
                  <span className="text-[13px] text-navy/60">{step.water}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {guide.tips && (
          <section className="mt-8 border-t border-navy/15 pt-6">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">이렇게 추출해보세요</p>
            <p className="mt-1 text-[13px] leading-relaxed text-navy/70">{guide.tips}</p>
          </section>
        )}

        {guide.commonProblems && (
          <section className="mt-6">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">이런 맛이 난다면</p>
            <p className="mt-1 text-[13px] leading-relaxed text-navy/70">{guide.commonProblems}</p>
          </section>
        )}

        {recommended.length > 0 && (
          <section className="mt-10 border-t border-navy/15 pt-8">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">추천 원두</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {recommended.map((c) => (
                <CoffeeCard key={c.id} coffee={c} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-navy/15 bg-white p-3 text-center">
      <p className="text-[9px] font-semibold tracking-wide text-navy/40">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-navy">{value}</p>
    </div>
  )
}
