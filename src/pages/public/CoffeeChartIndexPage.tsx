import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DotScale from '../../components/DotScale'
import FlavorNotes from '../../components/FlavorNotes'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { CHARACTER_STYLE } from '../../constants/characterStyle'
import { getAllCoffees } from '../../data/repositories/coffeeRepository'
import type { SensoryKey } from '../../types'
import { formatCoffeeNumber } from '../../utils/coffeeNumber'

const SORTABLE_FIELDS: { key: SensoryKey; label: string }[] = [
  { key: 'acidity', label: '산미' },
  { key: 'sweetness', label: '단맛' },
  { key: 'body', label: '바디' },
  { key: 'finish', label: '여운' },
  { key: 'accessibility', label: '접근성' },
]

export default function CoffeeChartIndexPage() {
  const all = useMemo(() => getAllCoffees().filter((c) => c.publishStatus === 'published' && c.chartVisible !== false), [])
  const [showArchive, setShowArchive] = useState(false)
  const [sort, setSort] = useState<{ key: SensoryKey; dir: 'asc' | 'desc' } | null>(null)

  const coffees = all
    .filter((c) => showArchive || c.availability !== 'archive')
    .sort((a, b) => {
      if (sort) {
        const diff = a.sensory[sort.key] - b.sensory[sort.key]
        if (diff !== 0) return sort.dir === 'asc' ? diff : -diff
      }
      return a.sortOrder - b.sortOrder
    })

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="원두 차트" description="코이노커피 원두의 핵심 정보를 한눈에 비교해보세요." />
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-[1240px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOINO COFFEE CHART</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">원두 차트</h1>
        <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-navy/60">
          현재 코이노커피에서 만나볼 수 있는 원두의 핵심 정보를 한눈에 비교해보세요. 원두를 눌러
          자세한 원두 차트를 확인할 수 있습니다.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex w-fit items-center gap-2 text-[11px] text-navy/50">
            <input type="checkbox" checked={showArchive} onChange={(e) => setShowArchive(e.target.checked)} />
            지난 커피도 함께 보기
          </label>
          {sort && (
            <button
              type="button"
              onClick={() => setSort(null)}
              className="text-[11px] font-semibold text-navy/45 hover:text-navy"
            >
              {SORTABLE_FIELDS.find((f) => f.key === sort.key)?.label} {sort.dir === 'asc' ? '낮은 순' : '높은 순'} 정렬 해제 ×
            </button>
          )}
        </div>

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
                    {SORTABLE_FIELDS.map((f) => (
                      <th key={f.key} className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span>{f.label}</span>
                          <button
                            type="button"
                            onClick={() => setSort({ key: f.key, dir: 'asc' })}
                            aria-label={`${f.label} 낮은 순으로 정렬`}
                            className={`leading-none ${
                              sort?.key === f.key && sort.dir === 'asc' ? 'text-accent' : 'text-navy/25 hover:text-navy/50'
                            }`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => setSort({ key: f.key, dir: 'desc' })}
                            aria-label={`${f.label} 높은 순으로 정렬`}
                            className={`leading-none ${
                              sort?.key === f.key && sort.dir === 'desc' ? 'text-accent' : 'text-navy/25 hover:text-navy/50'
                            }`}
                          >
                            ▼
                          </button>
                        </div>
                      </th>
                    ))}
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
                        {formatCoffeeNumber(c.coffeeNumber) && (
                          <span className="mr-1.5 text-[10px] font-semibold text-navy/35">{formatCoffeeNumber(c.coffeeNumber)}</span>
                        )}
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
                  <RadarChart
                    sensory={c.sensory}
                    size={64}
                    showLabels={false}
                    accentColor={CHARACTER_STYLE[c.character].accent}
                    accentSoft={CHARACTER_STYLE[c.character].accentSoft}
                  />
                  <div className="min-w-0 flex-1">
                    {formatCoffeeNumber(c.coffeeNumber) && (
                      <p className="text-[10px] text-navy/40">{formatCoffeeNumber(c.coffeeNumber)}</p>
                    )}
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
