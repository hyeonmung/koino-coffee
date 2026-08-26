import { Link } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import DotScale from '../../components/DotScale'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { getPublishedStories } from '../../data/repositories/storyRepository'
import { CUP_CHARACTERS } from '../../types'
import type { HomeSectionKey } from '../../data/schema'

export default function HomePage() {
  const settings = getSiteSettings()
  const isVisible = (key: HomeSectionKey) => settings.homeSectionVisibility[key] !== false

  const coffees = getPublishedCoffees().filter((c) => c.availability !== 'archive')
  const featured = coffees.filter((c) => c.featured).slice(0, 5)
  const currentCoffees = (featured.length > 0 ? featured : coffees).slice(0, 5)
  const chartExample = currentCoffees[0]
  const brewGuides = getPublishedBrewGuides().slice(0, 3)
  const stories = getPublishedStories().slice(0, 3)

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO />
      <PublicHeader />

      <main>
        {/* 01 HERO — the brand itself, not the sensory service */}
        <section className="border-b border-navy/15 bg-white">
          <div className="mx-auto max-w-[1240px] px-6 py-24 text-center">
            <p className="text-[11px] font-semibold tracking-[0.35em] text-accent">{settings.brandName}</p>
            <h1 className="mx-auto mt-4 max-w-[720px] font-serif text-[40px] font-bold leading-tight text-navy sm:text-[52px]">
              {settings.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-[440px] whitespace-pre-line text-[15px] leading-relaxed text-navy/60">
              {settings.heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={settings.heroCtaPrimaryUrl}
                className="border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
              >
                {settings.heroCtaPrimaryLabel}
              </Link>
              <Link
                to={settings.heroCtaSecondaryUrl}
                className="border border-navy/25 px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-navy hover:border-navy"
              >
                {settings.heroCtaSecondaryLabel}
              </Link>
            </div>
          </div>
        </section>

        {/* 02 지금 만날 수 있는 커피 */}
        {isVisible('featuredCoffee') && (
          <section className="mx-auto max-w-[1240px] px-6 py-16">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">NOW SERVING</p>
                <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">지금 만날 수 있는 커피</h2>
              </div>
              <Link to="/coffees" className="hidden text-[12px] font-semibold text-navy/50 hover:text-navy sm:block">
                전체 원두 보기 →
              </Link>
            </div>

            {currentCoffees.length === 0 ? (
              <p className="mt-8 border border-navy/15 bg-white px-6 py-12 text-center text-[13px] text-navy/45">
                현재 소개 중인 원두가 없습니다.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentCoffees.map((coffee, i) => (
                  <div key={coffee.id} className={i === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''}>
                    <CoffeeCard coffee={coffee} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 03 나에게 맞는 커피 찾기 */}
        {isVisible('tasteFinder') && (
          <section className="border-y border-navy/15 bg-white px-6 py-16 text-center">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">TASTE FINDER</p>
            <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">나에게 맞는 커피 찾기</h2>
            <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-relaxed text-navy/55">
              산미, 향, 질감에 대한 몇 가지 질문으로
              <br className="hidden sm:block" /> 나에게 가까운 커피를 찾아보세요.
            </p>
            <Link
              to="/discover"
              className="mt-6 inline-block border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
            >
              취향 찾기
            </Link>
          </section>
        )}

        {/* 04 KOI CUP CHARACTER — editorial list, not equal-weight cards */}
        {isVisible('cupCharacter') && (
          <section className="mx-auto max-w-[900px] px-6 py-16">
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">KOI CUP CHARACTER</p>
            <h2 className="mt-1 text-center font-serif text-[24px] font-bold text-navy">
              당신의 취향은 어떤 성격인가요?
            </h2>

            <div className="mt-10 divide-y divide-navy/10 border-y border-navy/10">
              {CUP_CHARACTERS.map((key) => {
                const info = CHARACTER_INFO[key]
                return (
                  <Link
                    key={key}
                    to={`/characters/${key.toLowerCase()}`}
                    className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-white"
                  >
                    <span className="font-serif text-[22px] font-bold tracking-tight text-navy/25 transition-colors group-hover:text-navy sm:text-[30px]">
                      {info.label}
                    </span>
                    <span className="max-w-[260px] text-right text-[12px] leading-relaxed text-navy/45 transition-colors group-hover:text-navy/70">
                      {info.description}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* 05 KOI SENSORY MAP intro */}
        {isVisible('sensoryMap') && (
          <section className="border-y border-navy/15 bg-white py-16">
            <div className="mx-auto max-w-[1240px] px-6 text-center">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOI SENSORY MAP</p>
              <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">
                한 잔을 조금 더 쉽게 이해하는 방법.
              </h2>
              <p className="mx-auto mt-3 max-w-[560px] text-[13px] leading-relaxed text-navy/60">
                코이노커피는 커피의 특징을 산미, 단맛, 바디, 여운, 플레이버, 접근성 등의 정보로 정리해
                고객이 자신의 취향과 원두의 차이를 쉽게 이해할 수 있도록 돕습니다.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {[
                  { n: '01', title: 'Character', desc: '커피의 전체적인 인상' },
                  { n: '02', title: 'Flavor Notes', desc: '컵에서 느껴지는 구체적인 향미' },
                  { n: '03', title: 'Sensory Profile', desc: '산미·단맛·바디·여운 등을 시각화' },
                ].map((step) => (
                  <div key={step.n}>
                    <p className="font-serif text-[26px] font-bold text-accent">{step.n}</p>
                    <p className="mt-2 text-[14px] font-bold text-navy">{step.title}</p>
                    <p className="mt-1 text-[12px] text-navy/55">{step.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/about-sensory-map" className="text-[12px] font-semibold text-navy/60 hover:text-navy">
                  센서리 맵 알아보기 →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 06 원두 차트 preview */}
        {isVisible('coffeeChart') && chartExample && (
          <section className="mx-auto max-w-[1240px] px-6 py-16">
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOI COFFEE CHART</p>
              <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">원두 차트</h2>
              <p className="mx-auto mt-2 max-w-[440px] text-[13px] text-navy/55">
                원두 하나의 핵심 정보를 한 화면에서 빠르게 확인할 수 있습니다.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-[560px] border border-navy/15 bg-white p-7">
              <p className="text-[11px] font-semibold tracking-[0.15em] text-navy/45">
                {chartExample.country?.toUpperCase()}
              </p>
              <p className="mt-1 font-serif text-[20px] font-bold text-navy">{chartExample.coffeeName}</p>
              <span className="mt-2 inline-block border border-navy bg-navy px-2.5 py-1 text-[10px] font-bold tracking-wide text-warm-white">
                {CHARACTER_INFO[chartExample.character].label}
              </span>
              <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
                <RadarChart sensory={chartExample.sensory} size={150} />
                <div className="flex-1 space-y-1.5">
                  {SENSORY_FIELDS.slice(0, 4).map((field) => (
                    <div key={field.key} className="flex items-center justify-between">
                      <span className="text-[10px] text-navy/50">{field.labelKo}</span>
                      <DotScale value={chartExample.sensory[field.key]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/coffee-chart"
                className="border border-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-navy hover:bg-navy hover:text-warm-white"
              >
                전체 원두 차트 보기
              </Link>
            </div>
          </section>
        )}

        {/* 07 Brew Better */}
        {isVisible('brewGuide') && brewGuides.length > 0 && (
          <section className="border-y border-navy/15 bg-white py-16">
            <div className="mx-auto max-w-[1240px] px-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BREW BETTER</p>
                  <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">집에서 더 맛있게</h2>
                </div>
                <Link to="/brew-guide" className="hidden text-[12px] font-semibold text-navy/50 hover:text-navy sm:block">
                  전체 보기 →
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {brewGuides.map((guide) => (
                  <Link
                    key={guide.id}
                    to={`/brew-guide/${guide.slug}`}
                    className="border border-navy/15 p-5 hover:border-navy"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{guide.equipment}</p>
                    <p className="mt-1 font-serif text-[16px] font-bold text-navy">{guide.title}</p>
                    <p className="mt-2 text-[11px] text-navy/50">
                      {guide.coffeeDose} · {guide.ratio} · {guide.totalTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 08 커피 이야기 */}
        {isVisible('stories') && stories.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-[1240px] px-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">STORIES</p>
                  <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">커피 이야기</h2>
                </div>
                <Link to="/stories" className="hidden text-[12px] font-semibold text-navy/50 hover:text-navy sm:block">
                  전체 보기 →
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    to={`/stories/${story.slug}`}
                    className="border border-navy/15 bg-white p-5 hover:border-navy"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{story.category}</p>
                    <p className="mt-1 font-serif text-[16px] font-bold text-navy">{story.title}</p>
                    <p className="mt-2 line-clamp-2 text-[12px] text-navy/55">{story.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 09 KOI COFFEE — brand teaser */}
        {isVisible('about') && (
          <section className="border-t border-navy/15 bg-white px-6 py-16 text-center">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOI COFFEE</p>
            <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">코이노커피</h2>
            <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-relaxed text-navy/60">
              {settings.aboutIntro}
            </p>
            <Link to="/about" className="mt-5 inline-block text-[12px] font-semibold text-navy/60 hover:text-navy">
              코이노커피 이야기 읽기 →
            </Link>
          </section>
        )}

        {/* 10 BUSINESS CTA */}
        {isVisible('business') && (
          <section className="koi-night-sky relative overflow-hidden py-16">
            <KOIStarField />
            <div className="relative mx-auto max-w-[1240px] px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {settings.purchaseUrl && (
                  <a
                    href={settings.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-warm-white/15 p-6 text-center hover:border-accent/60"
                  >
                    <p className="font-serif text-[15px] font-bold text-warm-white">원두 구매</p>
                  </a>
                )}
                <Link
                  to={settings.businessUrl || '/business'}
                  className="border border-warm-white/15 p-6 text-center hover:border-accent/60"
                >
                  <p className="font-serif text-[15px] font-bold text-warm-white">납품 문의</p>
                </Link>
                <Link
                  to={settings.businessUrl || '/business'}
                  className="border border-warm-white/15 p-6 text-center hover:border-accent/60"
                >
                  <p className="font-serif text-[15px] font-bold text-warm-white">커피 교육</p>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
