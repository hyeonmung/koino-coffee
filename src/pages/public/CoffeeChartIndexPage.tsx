import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DotScale from '../../components/DotScale'
import FlavorNotes from '../../components/FlavorNotes'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { getAllCoffees } from '../../data/repositories/coffeeRepository'

export default function CoffeeChartIndexPage() {
  const all = useMemo(() => getAllCoffees().filter((c) => c.publishStatus === 'published' && c.chartVisible !== false), [])
  const [showArchive, setShowArchive] = useState(false)

  const coffees = all
    .filter((c) => showArchive || c.availability !== 'archive')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="원두 차트" description="코이노커피 원두의 핵심 정보를 한눈에 비교해보세요." />
      <PublicHeader />

      <main className="mx-auto max-w-[1240px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOINO COFFEE CHART</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">원두 차트</h1>
        <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-navy/60">
          현재 코이노커피에서 만나볼 수 있는 원두의 핵심 정보를 한눈에 비교해보세요. 원두를 눌러
          자세한 원두 차트를 확인할 수 있습니다.
        </p>

        <label className="mt-4 flex w-fit items-center gap-2 text-[11px] text-navy/50">
          <input type="checkbox" checked={showArchive} onChange={(e) => setShowArchive(e.target.checked)} />
          지난 커피도 함께 보기
        </label>

        {coffees.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            표시할 원두가 없습니다.
          </p>
        ) : (
          <>
            {/* Desktop: visual table doubling as an always-on comparison view */}
            <div className="mt-8 hidden overflow-x-auto border border-navy/15 bg-white lg:block">
              <table className="w-full min-w-[920px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-navy/15 bg-warm-white text-left text-[9px] font-semibold tracking-[0.1em] text-navy/40">
                    <th className="px-4 py-3">원두</th>
                    <th className="px-4 py-3">국가</th>
                    <th className="px-4 py-3">캐릭터</th>
                    <th className="px-4 py-3">대표 향미</th>
                    <th className="px-4 py-3">산미</th>
                    <th className="px-4 py-3">단맛</th>
                    <th className="px-4 py-3">바디</th>
                    <th className="px-4 py-3">여운</th>
                    <th className="px-4 py-3">접근성</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coffees.map((c) => (
                    <tr
                      key={c.id}
                      className={`group border-b border-navy/10 hover:bg-warm-white ${
                        c.availability === 'archive' ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link to={`/coffee-chart/${c.slug}`} className="font-semibold text-navy hover:underline">
                          {c.coffeeName}
                        </Link>
                        {c.koreanName && <p className="text-[10px] text-navy/40">{c.koreanName}</p>}
                      </td>
                      <td className="px-4 py-3 text-navy/60">{c.country}</td>
                      <td className="px-4 py-3">
                        <span className="border border-navy bg-navy px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-warm-white">
                          {CHARACTER_INFO[c.character].label}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-3 text-navy/60">
                        <FlavorNotes notes={c.notes} limit={2} className="block truncate" />
                      </td>
                      <td className="px-4 py-3">
                        <DotScale value={c.sensory.acidity} />
                      </td>
                      <td className="px-4 py-3">
                        <DotScale value={c.sensory.sweetness} />
                      </td>
                      <td className="px-4 py-3">
                        <DotScale value={c.sensory.body} />
                      </td>
                      <td className="px-4 py-3">
                        <DotScale value={c.sensory.finish} />
                      </td>
                      <td className="px-4 py-3">
                        <DotScale value={c.sensory.accessibility} />
                      </td>
                      <td className="px-4 py-3 text-right text-navy/30 group-hover:text-navy">
                        <Link to={`/coffee-chart/${c.slug}`}>→</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked chart preview cards */}
            <div className="mt-8 space-y-3 lg:hidden">
              {coffees.map((c) => (
                <Link
                  key={c.id}
                  to={`/coffee-chart/${c.slug}`}
                  className={`flex items-center gap-4 border border-navy/15 bg-white p-4 ${
                    c.availability === 'archive' ? 'opacity-50' : ''
                  }`}
                >
                  <RadarChart sensory={c.sensory} size={64} showLabels={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-navy/45">{c.country}</p>
                    <p className="truncate font-serif text-[14px] font-bold text-navy">{c.coffeeName}</p>
                    <span className="mt-1 inline-block border border-navy bg-navy px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-warm-white">
                      {CHARACTER_INFO[c.character].label}
                    </span>
                  </div>
                  <span className="text-navy/30">→</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
