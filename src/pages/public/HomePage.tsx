import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import DotScale from '../../components/DotScale'
import FlavorNotes from '../../components/FlavorNotes'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import SpotlightCarousel from '../../components/spotlight/SpotlightCarousel'
import { CHARACTER_INFO } from '../../constants/characters'
import { CHARACTER_STYLE } from '../../constants/characterStyle'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { STORY_CATEGORY_LABEL } from '../../constants/storyCategories'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getAllCoffees, getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getAllDictionaryTerms } from '../../data/repositories/dictionaryRepository'
import { getFlavorDescriptors } from '../../data/repositories/flavorRepository'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { getPublishedSpotlightSlides } from '../../data/repositories/spotlightRepository'
import { getPublishedStories } from '../../data/repositories/storyRepository'
import { CUP_CHARACTERS } from '../../types'
import type { HomeSectionKey, SpotlightSlide } from '../../data/schema'

export default function HomePage() {
  const settings = getSiteSettings()
  const isVisible = (key: HomeSectionKey) => settings.homeSectionVisibility[key] !== false

  const coffees = getPublishedCoffees().filter((c) => c.availability !== 'archive')
  const featured = coffees.filter((c) => c.featured).slice(0, 4)
  const currentCoffees = (featured.length > 0 ? featured : coffees).slice(0, 4)
  const brewGuides = getPublishedBrewGuides().slice(0, 2)
  const stories = getPublishedStories().slice(0, 2)

  // "원두를 한눈에" banner — every published, chart-visible, non-archive coffee, in sortOrder.
  const chartCoffees = getAllCoffees()
    .filter((c) => c.publishStatus === 'published' && c.chartVisible !== false && c.availability !== 'archive')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const [chartIndex, setChartIndex] = useState(0)
  const [chartHovering, setChartHovering] = useState(false)
  useEffect(() => {
    if (chartCoffees.length <= 1 || chartHovering) return
    const id = setInterval(() => {
      setChartIndex((i) => (i + 1) % chartCoffees.length)
    }, 3000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartCoffees.length, chartHovering])
  const chartExample = chartCoffees[chartIndex % chartCoffees.length]

  // Real, already-authored dictionary copy — never invented for this preview block.
  const dictionaryTerm =
    getAllDictionaryTerms().find((t) => t.id === 'term-body') ??
    getAllDictionaryTerms().find((t) => t.example)
  const dictionaryFlavor =
    getFlavorDescriptors().find((d) => d.id === 'flavor-bergamot') ??
    getFlavorDescriptors().find((d) => d.example)

  const showCoffees = isVisible('featuredCoffee')

  // Empty-state fallback chain (spec): published Spotlight slides → one synthesized
  // Featured Coffee slide (only if the coffee section itself is enabled) → nothing
  // (Hero keeps its plain photo/placeholder background).
  const publishedSpotlight = getPublishedSpotlightSlides()
  const spotlightSlides: SpotlightSlide[] =
    publishedSpotlight.length > 0
      ? publishedSpotlight
      : showCoffees && currentCoffees[0]
        ? [
            {
              id: 'fallback-featured-coffee',
              contentType: 'FEATURED_COFFEE',
              order: 0,
              published: true,
              linkedId: currentCoffees[0].id,
              title: '',
              overlayStrength: 'medium',
              createdAt: '',
              updatedAt: '',
            },
          ]
        : []

  const showCharacter = isVisible('cupCharacter')
  const showChart = isVisible('coffeeChart') && Boolean(chartExample)
  const showTasteFinder = isVisible('tasteFinder')
  const showBrew = isVisible('brewGuide') && brewGuides.length > 0
  const showStories = isVisible('stories') && stories.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO />
      <PublicHeader />

      <main className="flex-1">
        {/* SCREEN 1 — Brand Hero + Featured Coffee, one composite view */}
        <section className="border-b border-navy/15">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 lg:grid-cols-12">
            {/* Left ~42% — brand poster */}
            <div className="flex items-center justify-center px-6 py-14 lg:col-span-5 lg:py-10 lg:pr-10">
              <img
                src="/home/hero-poster.jpg"
                alt="KOINONIA ROASTERS — A Cup, A New Destination"
                className="h-auto w-full max-w-[420px] object-contain"
              />
            </div>

            {/* Right ~58% — KOI SPOTLIGHT: a small live carousel, or the plain brand photo/placeholder when there's nothing to show */}
            <div className="relative h-[320px] w-full sm:h-[420px] lg:col-span-7 lg:h-full lg:min-h-[560px]">
              {spotlightSlides.length > 0 ? (
                <SpotlightCarousel slides={spotlightSlides} />
              ) : settings.heroImage ? (
                <div
                  className="h-full w-full bg-navy/5 bg-cover bg-center"
                  style={{ backgroundImage: `url(${settings.heroImage})` }}
                  role="img"
                  aria-label={settings.brandName}
                />
              ) : (
                <div className="koi-night-sky relative h-full w-full overflow-hidden">
                  <KOIStarField />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SCREEN 2 — Current Coffees + Cup Character */}
        {(showCoffees || showCharacter) && (
          <section className="border-b border-navy/15">
            {showCoffees && (
              <div className="mx-auto max-w-[1240px] px-6 py-12">
                <div className="flex items-end justify-between">
                  <h2 className="font-serif text-[22px] font-bold text-navy">코이노니아 원두 리스트</h2>
                  <Link to="/coffees" className="text-[12px] font-semibold text-navy/50 hover:text-navy">
                    전체 원두 보기 →
                  </Link>
                </div>

                {currentCoffees.length === 0 ? (
                  <p className="mt-6 border border-navy/15 bg-white px-6 py-10 text-center text-[13px] text-navy/45">
                    현재 소개 중인 원두가 없습니다.
                  </p>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
                    {currentCoffees.map((coffee) => (
                      <CoffeeCard key={coffee.id} coffee={coffee} showRadar narrowMobileGrid />
                    ))}
                  </div>
                )}
              </div>
            )}

            {showCharacter && (
              <div className={`mx-auto max-w-[1240px] px-6 py-10 ${showCoffees ? 'border-t border-navy/10' : ''}`}>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/40">KOINONIA FLAVOR WORD</p>
                <div className="mt-4 grid grid-cols-2 gap-px overflow-x-auto sm:grid-cols-5 sm:gap-0 sm:divide-x sm:divide-navy/10">
                  {CUP_CHARACTERS.map((key, i) => {
                    const info = CHARACTER_INFO[key]
                    return (
                      <Link
                        key={key}
                        to={`/characters/${key.toLowerCase()}`}
                        className="group flex flex-col gap-1.5 py-4 pr-3 sm:px-4"
                      >
                        <span className="font-serif text-[10px] text-navy/30">0{i + 1}</span>
                        <span className="font-serif text-[16px] font-bold text-navy transition-colors group-hover:text-accent">
                          {info.label}
                        </span>
                        <span className="text-[11px] leading-snug text-navy/50">{info.description}</span>
                        <span className="text-[10px] text-navy/30">{info.flavors.split(' · ').slice(0, 2).join(' · ')}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SCREEN 3 — KOI Expertise: Coffee Chart / Taste Finder / Dictionary */}
        {(showChart || showTasteFinder) && (
          <section className="border-b border-navy/15 bg-white">
            <div className="mx-auto grid max-w-[1240px] grid-cols-1 lg:grid-cols-12">
              {/* Left 7 cols — Coffee Chart, dense */}
              {showChart && chartExample && (
                <div className="border-b border-navy/10 px-6 py-12 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-14 lg:pr-10">
                  <h2 className="font-serif text-[22px] font-bold text-navy">원두를 한눈에</h2>
                  <p className="mt-2 max-w-[420px] text-[13px] text-navy/55">
                    향미, 가공, 로스팅, 센서리, 추출 정보를 한 화면에서 확인해보세요.
                  </p>

                  <Link
                    to={`/coffee-chart/${chartExample.slug}`}
                    onMouseEnter={() => setChartHovering(true)}
                    onMouseLeave={() => setChartHovering(false)}
                    className="mt-6 grid grid-cols-1 gap-6 border border-navy/15 p-6 hover:border-navy sm:grid-cols-[1fr_auto]"
                  >
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">
                          {chartExample.country?.toUpperCase()}
                        </p>
                        <p className="mt-1 font-serif text-[19px] font-bold text-navy">{chartExample.coffeeName}</p>
                        <span className="mt-2 inline-block border border-navy bg-navy px-2.5 py-1 text-[10px] font-bold tracking-wide text-warm-white">
                          {CHARACTER_INFO[chartExample.character].label}
                        </span>
                        <FlavorNotes notes={chartExample.notes} limit={3} className="mt-2 block text-[11px] text-navy/50" />
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-1">
                        {SENSORY_FIELDS.slice(0, 4).map((field) => (
                          <div key={field.key} className="flex items-center justify-between gap-3">
                            <span className="text-[10px] text-navy/50">{field.labelKo}</span>
                            <DotScale value={chartExample.sensory[field.key]} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <RadarChart
                      sensory={chartExample.sensory}
                      size={150}
                      showLabels={false}
                      accentColor={CHARACTER_STYLE[chartExample.character].accent}
                      accentSoft={CHARACTER_STYLE[chartExample.character].accentSoft}
                    />
                  </Link>

                  {chartCoffees.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      {chartCoffees.map((c, i) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setChartIndex(i)}
                          aria-label={`${c.coffeeName} 보기`}
                          className={`h-1.5 rounded-full transition-all ${
                            i === chartIndex % chartCoffees.length ? 'w-5 bg-navy' : 'w-1.5 bg-navy/20 hover:bg-navy/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {isVisible('sensoryMap') && (
                    <div className="mt-6 flex flex-col gap-2 border-t border-navy/10 pt-5 text-[11px] sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
                      <p className="text-navy/50">
                        <span className="font-bold text-navy">CHARACTER</span> · 커피의 전체적인 인상
                      </p>
                      <p className="text-navy/50">
                        <span className="font-bold text-navy">FLAVOR</span> · 구체적인 향미
                      </p>
                      <p className="text-navy/50">
                        <span className="font-bold text-navy">SENSORY</span> · 산미·단맛·바디 시각화
                      </p>
                    </div>
                  )}

                  <Link to="/coffee-chart" className="mt-6 inline-block text-[12px] font-semibold text-navy/60 hover:text-navy">
                    전체 원두 차트 보기 →
                  </Link>
                </div>
              )}

              {/* Right 5 cols — Taste Finder (top) + Dictionary (bottom) */}
              <div className="lg:col-span-5">
                {showTasteFinder && (
                  <Link
                    to="/discover"
                    className={`group block px-6 py-12 hover:bg-warm-white/60 lg:py-14 lg:pl-10 ${
                      dictionaryTerm ? 'border-b border-navy/10' : ''
                    }`}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/40">취향 찾기</p>
                    <h2 className="mt-2 font-serif text-[22px] font-bold leading-tight text-navy">나에게 맞는 한 잔</h2>
                    <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-navy/55">
                      산미, 향, 질감에 대한 몇 가지 질문으로 나에게 가까운 커피를 찾아보세요.
                    </p>
                    <span className="mt-4 inline-block text-[12px] font-semibold text-navy/70 group-hover:text-navy">
                      내 취향 찾기 →
                    </span>
                  </Link>
                )}

                {dictionaryTerm && (
                  <div className="px-6 py-12 lg:py-14 lg:pl-10">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/40">커피 사전</p>
                    <h2 className="mt-2 font-serif text-[20px] font-bold text-navy">어려운 용어, 쉽게</h2>
                    <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-navy/55">
                      {dictionaryTerm.termKo ?? dictionaryTerm.term}는 무엇을 뜻하는지, 익숙한 예와 함께 설명합니다.
                    </p>
                    <div className="mt-4 space-y-2 border-l-2 border-accent/50 pl-3">
                      <p className="text-[12px] text-navy/70">
                        <span className="font-bold text-navy">{dictionaryTerm.termKo ?? dictionaryTerm.term}</span> → {dictionaryTerm.example}
                      </p>
                      {dictionaryFlavor && (
                        <p className="text-[12px] text-navy/70">
                          <span className="font-bold text-navy">{dictionaryFlavor.nameKo}</span> → {dictionaryFlavor.example}
                        </p>
                      )}
                    </div>
                    <Link to="/dictionary" className="mt-4 inline-block text-[12px] font-semibold text-navy/60 hover:text-navy">
                      커피 사전 →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* SCREEN 4 — Brew + Stories, then Brand/Business (flows straight into Footer) */}
        {(showBrew || showStories) && (
          <section className="mx-auto max-w-[1240px] px-6 py-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              {showBrew && (
                <div>
                  <div className="flex items-end justify-between">
                    <h2 className="font-serif text-[18px] font-bold text-navy">집에서 더 맛있게</h2>
                    <Link to="/brew-guide" className="text-[11px] font-semibold text-navy/50 hover:text-navy">
                      전체 보기 →
                    </Link>
                  </div>
                  <div className="mt-4 divide-y divide-navy/10 border-y border-navy/10">
                    {brewGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        to={`/brew-guide/${guide.slug}`}
                        className="group flex items-center justify-between gap-4 py-4 hover:bg-white"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold tracking-[0.1em] text-navy/40">{guide.equipment}</p>
                          <p className="mt-0.5 truncate font-serif text-[15px] font-bold text-navy">{guide.title}</p>
                          <p className="mt-0.5 text-[11px] text-navy/45">
                            {guide.coffeeDose} · {guide.ratio} · {guide.totalTime}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] font-semibold text-navy/40 group-hover:text-navy">읽기 →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {showStories && (
                <div>
                  <div className="flex items-end justify-between">
                    <h2 className="font-serif text-[18px] font-bold text-navy">커피 이야기</h2>
                    <Link to="/stories" className="text-[11px] font-semibold text-navy/50 hover:text-navy">
                      전체 보기 →
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {stories.map((story) => (
                      <Link key={story.id} to={`/stories/${story.slug}`} className="group block">
                        {story.coverImage ? (
                          <div className="aspect-[3/2] w-full overflow-hidden">
                            <div
                              className="h-full w-full bg-navy/5 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                              style={{ backgroundImage: `url(${story.coverImage})` }}
                              role="img"
                              aria-label={story.title}
                            />
                          </div>
                        ) : (
                          <div className="koi-night-sky relative flex aspect-[3/2] w-full items-end overflow-hidden p-3">
                            <KOIStarField />
                            <p className="relative text-[8px] font-semibold tracking-[0.3em] text-warm-white/30">KOINONIA</p>
                          </div>
                        )}
                        <p className="mt-2 text-[9px] font-semibold tracking-[0.15em] text-navy/40">
                          {STORY_CATEGORY_LABEL[story.category]}
                        </p>
                        <p className="mt-0.5 font-serif text-[13px] font-bold leading-snug text-navy">{story.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <PublicFooter />
    </div>
  )
}
