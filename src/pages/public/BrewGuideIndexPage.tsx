import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdvancedFilterDrawer, { type OpenFilterValues, type TimeRange } from '../../components/brewGuide/AdvancedFilterDrawer'
import BrewGuideCard from '../../components/brewGuide/BrewGuideCard'
import FeaturedBrewGuide from '../../components/brewGuide/FeaturedBrewGuide'
import FilterSidebar from '../../components/brewGuide/FilterSidebar'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getVisibleBrewCategories } from '../../data/repositories/brewCategoryRepository'
import { getKoiBrewGuides, getOpenBrewGuides, getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getVisibleBrewTools } from '../../data/repositories/brewToolRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import type { BrewGuide, BrewGuideSource } from '../../data/schema'
import { getRecentlyViewedBrewGuides } from '../../utils/recentlyViewedBrewGuides'
import { archive } from './brewGuide/tokens'
import { bucketInt, equipmentLabel, inferServingStyle, parseGrams, parseRatioDenominator, parseSeconds } from './brewGuide/parse'

type SortMode = 'recommended' | 'latest' | 'brewTime'

export default function BrewGuideIndexPage() {
  const koiGuides = useMemo(() => getKoiBrewGuides(), [])
  const openGuides = useMemo(() => getOpenBrewGuides(), [])
  const allGuides = useMemo(() => getPublishedBrewGuides(), [])
  const coffees = useMemo(() => getPublishedCoffees(), [])
  const brewTools = useMemo(() => getVisibleBrewTools(), [])
  const categories = getVisibleBrewCategories()

  const coffeeForGuide = (guideId: string) => coffees.find((c) => c.brewGuideIds.includes(guideId))
  const cardMeta = (guide: BrewGuide) => {
    const coffee = coffeeForGuide(guide.id)
    if (!coffee) return {}
    return {
      coffeeIdentity: [coffee.country, coffee.process].filter(Boolean).join(' · '),
      flavorNotes: coffee.notes,
    }
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const source = (searchParams.get('source') as BrewGuideSource) || 'KOI'
  const categoryId = searchParams.get('category') || 'ALL'
  const dripper = searchParams.get('dripper') || 'ALL'
  const competitionType = searchParams.get('competition') || 'ALL'
  const servingStyle = (searchParams.get('serving') as 'ALL' | 'HOT' | 'ICED') || 'ALL'
  const dose = searchParams.get('dose') || 'ALL'
  const ratio = searchParams.get('ratio') || 'ALL'
  const timeRange = (searchParams.get('time') as TimeRange) || 'ALL'
  const sort = (searchParams.get('sort') as SortMode) || 'recommended'

  const [query, setQuery] = useState('')
  const [recentSlugs, setRecentSlugs] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setRecentSlugs(getRecentlyViewedBrewGuides())
  }, [])

  const updateParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === 'ALL' || value === 'recommended') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const setSource = (value: BrewGuideSource) => updateParams({ source: value === 'KOI' ? 'ALL' : value })
  const setCategoryId = (value: string) => updateParams({ category: value })
  const setSort = (value: SortMode) => updateParams({ sort: value })
  const applyOpenFilterPatch = (patch: Partial<OpenFilterValues>) =>
    updateParams({
      ...(patch.dripper !== undefined && { dripper: patch.dripper }),
      ...(patch.competitionType !== undefined && { competition: patch.competitionType }),
      ...(patch.servingStyle !== undefined && { serving: patch.servingStyle }),
      ...(patch.dose !== undefined && { dose: patch.dose }),
      ...(patch.ratio !== undefined && { ratio: patch.ratio }),
      ...(patch.timeRange !== undefined && { time: patch.timeRange }),
    })

  const usedCategoryIds = new Set(koiGuides.map((g) => g.categoryId).filter(Boolean))
  const availableCategories = categories.filter((c) => usedCategoryIds.has(c.id))
  const categoryLabel = (id?: string) => categories.find((c) => c.id === id)?.label

  const drippers = Array.from(new Set(openGuides.map((g) => g.equipment))).sort()
  const competitionTypes = Array.from(new Set(openGuides.map((g) => g.competitionType).filter(Boolean))) as string[]

  const doseOptions = Array.from(
    new Set(openGuides.map((g) => parseGrams(g.coffeeDose)).filter((n): n is number => n !== null).map(bucketInt)),
  ).sort((a, b) => a - b)
  const ratioOptions = Array.from(
    new Set(openGuides.map((g) => parseRatioDenominator(g.ratio)).filter((n): n is number => n !== null).map(bucketInt)),
  ).sort((a, b) => a - b)

  const koiFiltered = categoryId === 'ALL' ? koiGuides : koiGuides.filter((g) => g.categoryId === categoryId)
  const openFiltered = openGuides.filter((g) => {
    const seconds = parseSeconds(g.totalTime)
    const grams = parseGrams(g.coffeeDose)
    const ratioValue = parseRatioDenominator(g.ratio)
    return (
      (dripper === 'ALL' || g.equipment === dripper) &&
      (competitionType === 'ALL' || g.competitionType === competitionType) &&
      (servingStyle === 'ALL' || (g.servingStyle ?? inferServingStyle(g)) === servingStyle) &&
      (dose === 'ALL' || (grams !== null && bucketInt(grams) === Number(dose))) &&
      (ratio === 'ALL' || (ratioValue !== null && bucketInt(ratioValue) === Number(ratio))) &&
      (timeRange === 'ALL' ||
        (timeRange === 'UNDER3'
          ? seconds !== null && seconds < 180
          : timeRange === 'MID'
            ? seconds !== null && seconds >= 180 && seconds <= 240
            : seconds !== null && seconds > 240))
    )
  })
  const baseFiltered = source === 'KOI' ? koiFiltered : openFiltered

  const sorted = [...baseFiltered].sort((a, b) => {
    if (sort === 'latest') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'brewTime') {
      const sa = parseSeconds(a.totalTime)
      const sb = parseSeconds(b.totalTime)
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sa - sb
    }
    return 0
  })

  const activeFilterChips = [
    dripper !== 'ALL' && { key: 'dripper', label: equipmentLabel(dripper), clear: () => updateParams({ dripper: 'ALL' }) },
    competitionType !== 'ALL' && { key: 'competition', label: competitionType, clear: () => updateParams({ competition: 'ALL' }) },
    servingStyle !== 'ALL' && {
      key: 'serving',
      label: servingStyle === 'HOT' ? 'HOT' : 'ICE',
      clear: () => updateParams({ serving: 'ALL' }),
    },
    dose !== 'ALL' && { key: 'dose', label: `${dose}g`, clear: () => updateParams({ dose: 'ALL' }) },
    ratio !== 'ALL' && { key: 'ratio', label: `1:${ratio}`, clear: () => updateParams({ ratio: 'ALL' }) },
    timeRange !== 'ALL' && {
      key: 'time',
      label: timeRange === 'UNDER3' ? '3분 미만' : timeRange === 'MID' ? '3-4분' : '4분 초과',
      clear: () => updateParams({ time: 'ALL' }),
    },
  ].filter((c): c is { key: string; label: string; clear: () => void } => Boolean(c))

  const recentGuides = recentSlugs.map((slug) => allGuides.find((g) => g.slug === slug)).filter((g): g is BrewGuide => Boolean(g))

  const trimmedQuery = query.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0
  const searchResults = isSearching
    ? allGuides.filter((g) =>
        [g.title, g.equipment, g.attribution?.creator, g.competitionType].some((field) => field?.toLowerCase().includes(trimmedQuery)),
      )
    : []

  const featuredGuide = koiGuides.find((g) => g.pourSteps.length > 0)

  return (
    <div className={`flex min-h-screen flex-col ${archive.bgMain}`}>
      <SEO title="브루잉 레시피" description="코이노니아가 직접 쓴 레시피와, 바리스타·브랜드가 공개한 레시피를 함께 소개합니다." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1">
        {/* HERO */}
        <div className="relative overflow-hidden px-6 py-16 sm:py-20">
          <ArchiveStarfield />
          <div className="relative mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
            <p className={`text-[10px] font-semibold tracking-[0.3em] ${archive.accentText}`}>BREWING ARCHIVE</p>
            <h1 className={`mt-3 text-[32px] font-semibold ${archive.textPrimary} sm:text-[42px]`}>한 잔을 더 정확하게.</h1>
            <p className={`mt-4 max-w-[480px] text-[14px] leading-relaxed ${archive.textSecondary}`}>
              코이노니아 로스터스가 직접 테스트하고 기록한 브루잉 레시피입니다.
              <br className="hidden sm:block" />
              원두와 추출 도구에 맞는 레시피를 쉽고 정확하게 찾아보세요.
            </p>

            <div className="mt-8 w-full">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="원두, 드리퍼, 레시피를 검색해보세요."
                className={`w-full rounded-2xl border ${archive.border} ${archive.bgCard} px-6 py-4 text-[14px] ${archive.textPrimary} outline-none transition-colors ${archive.placeholderMuted} focus:border-[rgba(242,197,92,0.5)]`}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1320px] px-6 pb-24 pt-6 sm:pb-32">
          {/* RECENTLY VIEWED */}
          {!isSearching && recentGuides.length > 0 && (
            <section className="mb-14">
              <p className={`text-[11px] font-semibold tracking-[0.15em] ${archive.textMuted}`}>최근 본 레시피</p>
              <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
                {recentGuides.map((g) => (
                  <Link key={g.id} to={`/brew-guide/${g.slug}`} className={`group w-[168px] shrink-0 border-l ${archive.border} pl-4`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${archive.textMuted}`}>{g.equipment}</p>
                    <p className={`mt-1.5 whitespace-pre-line text-[15px] font-semibold leading-snug ${archive.textPrimary}`}>{g.title}</p>
                    {(g.ratio || g.totalTime) && (
                      <p className={`mt-1.5 text-[11px] tabular-nums ${archive.textMuted}`}>{[g.ratio, g.totalTime].filter(Boolean).join(' · ')}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* KOI'S BREWING TOOLS */}
          {!isSearching && brewTools.length > 0 && (
            <section className="mb-14">
              <p className={`text-[11px] font-semibold tracking-[0.15em] ${archive.textMuted}`}>코이의 브루잉 도구</p>
              <div className="mt-4 flex gap-5 overflow-x-auto pb-2">
                {brewTools.map((tool) => (
                  <div key={tool.id} className="w-[104px] shrink-0 text-center">
                    <div className={`h-[104px] w-[104px] overflow-hidden rounded-2xl border ${archive.border} ${archive.bgCard}`}>
                      {tool.imageUrl && <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />}
                    </div>
                    <p className={`mt-2 text-[12px] font-medium leading-snug ${archive.textSecondary}`}>{tool.name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isSearching ? (
            <section>
              <p className={`text-[13px] ${archive.textSecondary}`}>
                <span className={`font-semibold ${archive.textPrimary}`}>"{query}"</span> 검색 결과 {searchResults.length}개
              </p>
              {searchResults.length === 0 ? (
                <EmptyState onReset={() => setQuery('')} />
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((guide) => (
                    <BrewGuideCard key={guide.id} guide={guide} categoryLabel={categoryLabel} {...cardMeta(guide)} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* BREWER NAVIGATION (source toggle doubles as top-level nav here) */}
              <div className="flex flex-wrap items-center gap-6">
                <TextTab active={source === 'KOI'} onClick={() => setSource('KOI')} label="코이 레시피" />
                <TextTab active={source === 'OPEN'} onClick={() => setSource('OPEN')} label="오픈 레시피" />
              </div>

              {source === 'KOI' && availableCategories.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  <TextTab small active={categoryId === 'ALL'} onClick={() => setCategoryId('ALL')} label="전체" />
                  {availableCategories.map((c) => (
                    <TextTab key={c.id} small active={categoryId === c.id} onClick={() => setCategoryId(c.id)} label={c.label} />
                  ))}
                </div>
              )}

              <div className={source === 'OPEN' ? 'mt-6 lg:flex lg:items-start lg:gap-10' : undefined}>
                {source === 'OPEN' && (
                  <FilterSidebar
                    drippers={drippers}
                    competitionTypes={competitionTypes}
                    doseOptions={doseOptions}
                    ratioOptions={ratioOptions}
                    value={{ dripper, competitionType, servingStyle, dose, ratio, timeRange }}
                    onChange={applyOpenFilterPatch}
                  />
                )}

                <div className="min-w-0 flex-1">
                  {/* QUICK FILTER / SORT TOOLBAR */}
                  <div className={`flex flex-wrap items-center justify-between gap-3 border-t ${archive.border} pt-5 ${source === 'OPEN' ? '' : 'mt-6'}`}>
                    <div className="flex items-center gap-3">
                      {source === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => setDrawerOpen(true)}
                          className={`rounded-full border ${archive.border} px-4 py-2 text-[12px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary} lg:hidden`}
                        >
                          필터{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ''}
                        </button>
                      )}
                      {source === 'OPEN' && (
                        <button
                          type="button"
                          onClick={() => setDrawerOpen(true)}
                          className={`hidden items-center gap-1.5 rounded-full border ${archive.border} px-4 py-2 text-[12px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary} lg:flex`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.35-4.35" />
                          </svg>
                          조건검색{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ''}
                        </button>
                      )}
                      {activeFilterChips.map((chip) => (
                        <button
                          key={chip.key}
                          type="button"
                          onClick={chip.clear}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
                          style={{ backgroundColor: 'rgba(242,197,92,0.12)', color: archive.accent }}
                        >
                          {chip.label} ×
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-2">
                      <span className={`text-[11px] ${archive.textMuted}`}>정렬</span>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortMode)}
                        className={`rounded-full border ${archive.border} ${archive.bgCard} px-3 py-1.5 text-[12px] ${archive.textSecondary} outline-none`}
                      >
                        <option value="recommended">추천순</option>
                        <option value="latest">최신순</option>
                        <option value="brewTime">추출시간순</option>
                      </select>
                    </label>
                  </div>

                  {/* GRID */}
                  {sorted.length === 0 ? (
                    <EmptyState
                      onReset={() =>
                        updateParams({
                          category: 'ALL',
                          dripper: 'ALL',
                          competition: 'ALL',
                          serving: 'ALL',
                          dose: 'ALL',
                          ratio: 'ALL',
                          time: 'ALL',
                        })
                      }
                    />
                  ) : (
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {sorted.map((guide) => (
                        <BrewGuideCard key={guide.id} guide={guide} categoryLabel={categoryLabel} {...cardMeta(guide)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* FEATURED */}
          {!isSearching && featuredGuide && (
            <div className="mt-20">
              <FeaturedBrewGuide guide={featuredGuide} {...cardMeta(featuredGuide)} />
            </div>
          )}

          {/* KNOWLEDGE CTA */}
          {!isSearching && (
            <section className={`mt-20 rounded-[20px] border ${archive.border} ${archive.bgSurface} p-8 text-center sm:p-14`}>
              <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>BREWING KNOWLEDGE</p>
              <h2 className={`mx-auto mt-3 max-w-[440px] text-[22px] font-semibold leading-snug ${archive.textPrimary} sm:text-[26px]`}>
                레시피보다 중요한 건,
                <br />내 컵의 변화를 이해하는 것입니다.
              </h2>
              <p className={`mx-auto mt-4 max-w-[440px] text-[13px] leading-relaxed ${archive.textSecondary}`}>
                분쇄도, 물 온도, 추출 시간과 물줄기가 한 잔의 커피에 어떤 차이를 만드는지 코이노니아의 브루잉 콘텐츠에서 알아보세요.
              </p>
              <Link to="/brew-guide/knowledge" className={`mt-6 inline-block text-[12px] font-semibold ${archive.accentText}`}>
                브루잉 가이드 보기 →
              </Link>
            </section>
          )}
        </div>
      </main>

      <PublicFooter />

      {source === 'OPEN' && (
        <AdvancedFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          drippers={drippers}
          competitionTypes={competitionTypes}
          doseOptions={doseOptions}
          ratioOptions={ratioOptions}
          value={{ dripper, competitionType, servingStyle, dose, ratio, timeRange }}
          onApply={(next: OpenFilterValues) =>
            updateParams({
              dripper: next.dripper,
              competition: next.competitionType,
              serving: next.servingStyle,
              dose: next.dose,
              ratio: next.ratio,
              time: next.timeRange,
            })
          }
        />
      )}
    </div>
  )
}

function TextTab({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 pb-2 font-medium transition-colors ${small ? 'text-[12px]' : 'text-[14px]'}`}
      style={{
        borderColor: active ? archive.accent : 'transparent',
        color: active ? '#F5F3ED' : '#6F7B8D',
      }}
    >
      {label}
    </button>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className={`mt-10 flex flex-col items-center gap-4 border-t ${archive.border} py-20 text-center`}>
      <svg width="14" height="14" viewBox="-7 -7 14 14" aria-hidden>
        <path d="M0,-7 L1.3,-1.3 L7,0 L1.3,1.3 L0,7 L-1.3,1.3 L-7,0 L-1.3,-1.3 Z" fill={archive.accent} opacity={0.7} />
      </svg>
      <p className={`text-[14px] font-medium ${archive.textPrimary}`}>아직 조건에 맞는 레시피가 없습니다.</p>
      <p className={`text-[12px] ${archive.textMuted}`}>다른 원두나 추출 방식으로 검색해보세요.</p>
      <button
        type="button"
        onClick={onReset}
        className={`mt-1 rounded-full border ${archive.border} px-4 py-2 text-[12px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary}`}
      >
        필터 초기화
      </button>
    </div>
  )
}

/** Extremely sparse, static star field for the hero — pure SVG, no animation library, negligible DOM cost. */
function ArchiveStarfield() {
  const stars = [
    [8, 22], [16, 68], [27, 12], [34, 82], [46, 30], [58, 60], [68, 15], [77, 75], [88, 35], [93, 58],
  ]
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
      {stars.map(([x, y], i) => (
        <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 3 === 0 ? 1.2 : 0.8} fill="#F2E7C3" opacity={0.35} />
      ))}
    </svg>
  )
}
