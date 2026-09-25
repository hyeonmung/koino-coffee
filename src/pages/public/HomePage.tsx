import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useIsDesktop from '../../hooks/useIsDesktop'
import CoffeeCard from '../../components/CoffeeCard'
import Pagination from '../../components/Pagination'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import SpotlightCarousel from '../../components/spotlight/SpotlightCarousel'
import { CHARACTER_INFO } from '../../constants/characters'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getAllDictionaryTerms } from '../../data/repositories/dictionaryRepository'
import { getPublishedColumns } from '../../data/repositories/columnRepository'
import { getFlavorDescriptors } from '../../data/repositories/flavorRepository'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { getPublishedSpotlightSlides } from '../../data/repositories/spotlightRepository'
import { CUP_CHARACTERS } from '../../types'
import type { Coffee, HomeSectionKey, SpotlightSlide } from '../../data/schema'

export default function HomePage() {
  const settings = getSiteSettings()
  const isVisible = (key: HomeSectionKey) => settings.homeSectionVisibility[key] !== false

  // Newest KOI Coffee Archive Number first (#006 before #001) — coffeeNumber is admin-assigned
  // and monotonically increasing, so descending order doubles as "most recently added first".
  const byCoffeeNumberDesc = (a: Coffee, b: Coffee) => (b.coffeeNumber ?? 0) - (a.coffeeNumber ?? 0)
  const coffees = getPublishedCoffees()
    .filter((c) => c.availability !== 'archive')
    .sort(byCoffeeNumberDesc)
  const featured = coffees.filter((c) => c.featured)
  // Featured coffees lead (page 1), then the rest of the catalog follows on later pages —
  // so paging through this preview always eventually surfaces every published coffee.
  const featuredIds = new Set(featured.map((c) => c.id))
  const currentCoffees = featured.length > 0 ? [...featured, ...coffees.filter((c) => !featuredIds.has(c.id))] : coffees
  const COFFEES_PAGE_SIZE = 16
  const [coffeePage, setCoffeePage] = useState(1)
  const coffeeTotalPages = Math.max(1, Math.ceil(currentCoffees.length / COFFEES_PAGE_SIZE))
  const coffeeCurrentPage = Math.min(coffeePage, coffeeTotalPages)
  const coffeePageItems = currentCoffees.slice(
    (coffeeCurrentPage - 1) * COFFEES_PAGE_SIZE,
    coffeeCurrentPage * COFFEES_PAGE_SIZE,
  )
  // Random 2 each visit (not the same "top 2" every time) — reshuffled once per mount, not on
  // every re-render, so it stays stable while the user is browsing this page.
  const brewGuides = useMemo(() => {
    const shuffled = [...getPublishedBrewGuides()]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 2)
  }, [])

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

  const isDesktop = useIsDesktop()
  const bannerRef = useRef<HTMLDivElement>(null)
  const [bannerHeight, setBannerHeight] = useState<number | null>(null)
  useEffect(() => {
    if (!isDesktop) {
      setBannerHeight(null)
      return
    }
    const el = bannerRef.current
    if (!el) return
    const update = () => setBannerHeight(el.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDesktop, spotlightSlides.length])

  const showCharacter = isVisible('cupCharacter')
  const showBrew = isVisible('brewGuide') && brewGuides.length > 0

  // Auto-updating "오늘의 더코이맥 칼럼" banner — always the most recently published Column
  // (getPublishedColumns is sorted newest-first and already filters to ones whose scheduled
  // time has passed), so it advances on its own as each day's column goes live. No admin
  // curation needed, unlike the KOI SPOTLIGHT carousel above.
  const latestColumn = getPublishedColumns()[0]

  // The cover image is itself a fully designed KOI MAG card (logo + headline baked in), so it
  // renders clean — no text overlaid on top of it, which would double up with its own headline.
  // Caption/CTA sits beside it instead.
  const columnBanner = latestColumn && (
    <section className="border-b border-line/15 bg-canvas">
      <Link
        to={`/thekoimag/${latestColumn.slug}`}
        className="group mx-auto flex max-w-[1240px] flex-col items-center gap-6 bg-navy px-6 py-8 lg:flex-row lg:gap-10 lg:py-10 lg:my-8"
      >
        <div className="w-full overflow-hidden lg:w-[42%]">
          {latestColumn.coverImage ? (
            <img
              src={latestColumn.coverImage}
              alt={latestColumn.title}
              className="aspect-coffee-card w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="koi-night-sky relative aspect-coffee-card w-full overflow-hidden">
              <KOIStarField />
            </div>
          )}
        </div>
        <div className="w-full lg:flex-1">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-accent font-kicker">오늘의 더코이맥 칼럼</p>
          <p className="mt-2 max-w-[560px] whitespace-pre-line text-[20px] font-bold leading-snug text-warm-white lg:text-[24px]">
            {latestColumn.title}
          </p>
          {latestColumn.excerpt && (
            <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-warm-white/60">{latestColumn.excerpt}</p>
          )}
          <p className="mt-4 text-[12px] font-semibold text-accent group-hover:text-warm-white">칼럼 읽기 →</p>
        </div>
      </Link>
    </section>
  )

  // ——— Hero: always shown in full, on every breakpoint (not part of the mobile tabs below). ———
  const heroSection = (
    <section className="border-b border-line/15">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 lg:grid-cols-12">
        {/* Left ~42% — brand poster. On desktop its box height is measured from the banner column (bannerRef) and applied here, so the two boxes match exactly; the image crops (object-cover, anchored top) to fill that height. On mobile it just shows full, uncropped. */}
        <div
          className="w-full bg-surface lg:col-span-5"
          style={isDesktop && bannerHeight ? { height: bannerHeight } : undefined}
        >
          <img
            src="/home/hero-poster.jpg"
            alt="KOINONIA ROASTERS — A Cup, A New Destination"
            className={isDesktop ? 'h-full w-full object-cover object-center' : 'h-auto w-full object-contain'}
          />
        </div>

        {/* Right ~58% — KOI SPOTLIGHT: a small live carousel, or the plain brand photo/placeholder when there's nothing to show. The photo area is a fixed 850×550 (17:11, same as the Coffee Card ratio) — see SpotlightCarousel for the photo/text split. lg:self-start + bannerRef: this column sizes to its own content (photo + compact text), and its measured height drives the poster column's height above. */}
        <div ref={bannerRef} className="w-full lg:col-span-7 lg:self-start">
          {spotlightSlides.length > 0 ? (
            <SpotlightCarousel slides={spotlightSlides} />
          ) : settings.heroImage ? (
            <div
              className="aspect-coffee-card w-full bg-navy/5 bg-cover bg-center"
              style={{ backgroundImage: `url(${settings.heroImage})` }}
              role="img"
              aria-label={settings.brandName}
            />
          ) : (
            <div className="koi-night-sky relative aspect-coffee-card w-full overflow-hidden">
              <KOIStarField />
            </div>
          )}
        </div>
      </div>
    </section>
  )

  // ——— Below the Hero, content is grouped by topic. Desktop keeps its existing side-by-side
  // sections (unchanged); on mobile those same pieces are shown one at a time behind a tab bar
  // instead of one long stacked scroll — see MobileSectionTabs below. ———

  const coffeesContent = showCoffees && (
    <>
      <div className="flex items-end justify-between">
        <h2 className="text-[22px] font-bold text-ink">코이노니아 로스터스 보딩티켓</h2>
        <Link to="/coffees" className="text-[12px] font-semibold text-ink/50 hover:text-ink">
          전체 원두 보기 →
        </Link>
      </div>

      {currentCoffees.length === 0 ? (
        <p className="mt-6 border border-line/15 bg-surface px-6 py-10 text-center text-[13px] text-ink/45">
          현재 소개 중인 원두가 없습니다.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {coffeePageItems.map((coffee) => (
              <CoffeeCard key={coffee.id} coffee={coffee} showRadar narrowMobileGrid />
            ))}
          </div>
          <Pagination page={coffeeCurrentPage} totalPages={coffeeTotalPages} onChange={setCoffeePage} scrollToTop={false} />
        </>
      )}
    </>
  )

  const characterContent = showCharacter && (
    <>
      <p className="text-[10px] font-semibold tracking-[0.2em] text-ink/40">KOINONIA FLAVOR WORD</p>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-x-auto sm:grid-cols-5 sm:gap-0 sm:divide-x sm:divide-line/10">
        {CUP_CHARACTERS.map((key, i) => {
          const info = CHARACTER_INFO[key]
          return (
            <Link key={key} to={`/characters/${key.toLowerCase()}`} className="group flex flex-col gap-1.5 py-4 pr-3 sm:px-4">
              <span className="text-[10px] text-ink/30">0{i + 1}</span>
              <span className="text-[16px] font-bold text-ink transition-colors group-hover:text-accent">
                {info.label}
              </span>
              <span className="text-[11px] leading-snug text-ink/50">{info.description}</span>
              <span className="text-[10px] text-ink/30">{info.flavors.split(' · ').slice(0, 2).join(' · ')}</span>
            </Link>
          )
        })}
      </div>
    </>
  )

  const dictionaryContent = dictionaryTerm && (
    <>
      <p className="text-[10px] font-semibold tracking-[0.2em] text-ink/40">커피 사전</p>
      <h2 className="mt-2 text-[20px] font-bold text-ink">어려운 용어, 쉽게</h2>
      <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-ink/55">
        {dictionaryTerm.termKo ?? dictionaryTerm.term}는 무엇을 뜻하는지, 익숙한 예와 함께 설명합니다.
      </p>
      <div className="mt-4 space-y-2 border-l-2 border-accent/50 pl-3">
        <p className="text-[12px] text-ink/70">
          <span className="font-bold text-ink">{dictionaryTerm.termKo ?? dictionaryTerm.term}</span> → {dictionaryTerm.example}
        </p>
        {dictionaryFlavor && (
          <p className="text-[12px] text-ink/70">
            <span className="font-bold text-ink">{dictionaryFlavor.nameKo}</span> → {dictionaryFlavor.example}
          </p>
        )}
      </div>
      <Link to="/dictionary" className="mt-4 inline-block text-[12px] font-semibold text-ink/60 hover:text-ink">
        커피 사전 →
      </Link>
    </>
  )

  const brewContent = showBrew && (
    <>
      <div className="flex items-end justify-between">
        <h2 className="text-[18px] font-bold text-ink">Try Brewing</h2>
        <Link to="/brew-guide" className="text-[11px] font-semibold text-ink/50 hover:text-ink">
          전체 보기 →
        </Link>
      </div>
      <div className="mt-4 divide-y divide-line/10 border-y border-line/10">
        {brewGuides.map((guide) => (
          <Link key={guide.id} to={`/brew-guide/${guide.slug}`} className="group flex items-center justify-between gap-4 py-4 hover:bg-surface">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-ink/40">{guide.equipment}</p>
              <p className="mt-0.5 truncate text-[15px] font-bold text-ink">{guide.title}</p>
              <p className="mt-0.5 text-[11px] text-ink/45">
                {guide.coffeeDose} · {guide.ratio} · {guide.totalTime}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-ink/40 group-hover:text-ink">읽기 →</span>
          </Link>
        ))}
      </div>
    </>
  )

  // Mobile-only tab list: only sections that actually have content get a tab.
  type MobileTab = { id: string; label: string; content: React.ReactNode }
  const rawMobileTabs: (MobileTab | null)[] = [
    coffeesContent ? { id: 'coffees', label: '원두', content: coffeesContent } : null,
    characterContent ? { id: 'character', label: '캐릭터', content: characterContent } : null,
    dictionaryContent ? { id: 'dictionary', label: '커피 사전', content: dictionaryContent } : null,
    brewContent ? { id: 'brew', label: '브루잉 레시피', content: brewContent } : null,
  ]
  const mobileTabs = rawMobileTabs.filter((t): t is MobileTab => t !== null)

  const [selectedMobileTab, setSelectedMobileTab] = useState<string | null>(null)
  const activeMobileTab = mobileTabs.some((t) => t.id === selectedMobileTab) ? selectedMobileTab : mobileTabs[0]?.id

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1">
        {heroSection}
        {columnBanner}

        {isDesktop ? (
          <>
            {/* SCREEN 2 — Current Coffees + Cup Character */}
            {(showCoffees || showCharacter) && (
              <section className="border-b border-line/15">
                {coffeesContent && <div className="mx-auto max-w-[1240px] px-6 pt-12 pb-4">{coffeesContent}</div>}
                {characterContent && (
                  <div className="mx-auto max-w-[1240px] px-6 pt-0 pb-10">{characterContent}</div>
                )}
              </section>
            )}

            {/* SCREEN 3 — Coffee Dictionary */}
            {dictionaryContent && (
              <section className="border-b border-line/15 bg-surface">
                <div className="mx-auto max-w-[1240px] px-6 py-12 lg:py-14">{dictionaryContent}</div>
              </section>
            )}

            {/* SCREEN 4 — Brew */}
            {brewContent && (
              <section className="mx-auto max-w-[1240px] px-6 py-12">
                <div>{brewContent}</div>
              </section>
            )}
          </>
        ) : (
          mobileTabs.length > 0 && (
            <section>
              <div className="flex gap-1.5 overflow-x-auto border-b border-line/15 bg-surface px-6 py-3">
                {mobileTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedMobileTab(tab.id)}
                    className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                      activeMobileTab === tab.id ? 'border-line bg-navy text-warm-white' : 'border-line/20 text-ink/55 hover:border-line/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="px-6 py-8">{mobileTabs.find((t) => t.id === activeMobileTab)?.content}</div>
            </section>
          )
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
