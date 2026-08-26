import { Link } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getPublishedStories } from '../../data/repositories/storyRepository'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { CUP_CHARACTERS } from '../../types'

export default function HomePage() {
  const settings = getSiteSettings()
  const coffees = getPublishedCoffees().filter((c) => c.availability !== 'archive')
  const featured = coffees.filter((c) => c.featured).slice(0, 6)
  const currentCoffees = (featured.length > 0 ? featured : coffees).slice(0, 6)
  const brewGuides = getPublishedBrewGuides().slice(0, 3)
  const stories = getPublishedStories().slice(0, 3)

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO />
      <PublicHeader />

      <main>
        {/* HERO */}
        <section className="border-b border-navy/15 bg-white">
          <div className="mx-auto max-w-[1240px] px-6 py-20 text-center">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-accent">{settings.brandName}</p>
            <h1 className="mx-auto mt-3 max-w-[720px] font-serif text-[36px] font-bold leading-tight text-navy sm:text-[48px]">
              {settings.heroTitle}
            </h1>
            <p className="mt-4 text-[15px] text-navy/60">{settings.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

        {/* CURRENT COFFEES */}
        <section className="mx-auto max-w-[1240px] px-6 py-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">NOW SERVING</p>
              <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">현재 소개 중인 커피</h2>
            </div>
            <Link to="/coffees" className="hidden text-[12px] font-semibold text-navy/50 hover:text-navy sm:block">
              전체 보기 →
            </Link>
          </div>

          {currentCoffees.length === 0 ? (
            <p className="mt-8 border border-navy/15 bg-white px-6 py-12 text-center text-[13px] text-navy/45">
              현재 소개 중인 커피가 없습니다.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentCoffees.map((coffee) => (
                <CoffeeCard key={coffee.id} coffee={coffee} />
              ))}
            </div>
          )}
        </section>

        {/* FIND YOUR CHARACTER */}
        <section className="border-y border-navy/15 bg-white py-16">
          <div className="mx-auto max-w-[1240px] px-6">
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">
              FIND YOUR CHARACTER
            </p>
            <h2 className="mt-1 text-center font-serif text-[24px] font-bold text-navy">
              당신의 취향은 어떤 성격인가요?
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
              {CUP_CHARACTERS.map((key) => {
                const info = CHARACTER_INFO[key]
                return (
                  <Link
                    key={key}
                    to={`/characters/${key.toLowerCase()}`}
                    className="group border border-navy/15 p-5 text-center transition-colors hover:border-navy hover:bg-navy"
                  >
                    <p className="text-[13px] font-bold tracking-[0.15em] text-navy group-hover:text-warm-white">
                      {info.label}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-navy/50 group-hover:text-warm-white/70">
                      {info.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* FIND YOUR COFFEE CTA */}
        <section className="mx-auto max-w-[1240px] px-6 py-16 text-center">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">FIND YOUR COFFEE</p>
          <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">어떤 커피를 좋아하세요?</h2>
          <p className="mt-2 text-[13px] text-navy/55">몇 가지 질문에 답하면 어울리는 커피를 찾아드립니다.</p>
          <Link
            to="/discover"
            className="mt-6 inline-block border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
          >
            취향 찾기 시작
          </Link>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-navy/15 bg-white py-16">
          <div className="mx-auto max-w-[1240px] px-6">
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">HOW TO READ</p>
            <h2 className="mt-1 text-center font-serif text-[24px] font-bold text-navy">
              KOI SENSORY MAP 읽는 법
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                { n: '01', title: 'Character', desc: '커피의 전체적인 인상' },
                { n: '02', title: 'Flavor Notes', desc: '컵에서 느껴지는 구체적인 향미' },
                { n: '03', title: 'Sensory Profile', desc: '산미·단맛·바디·여운 등을 시각화' },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <p className="font-serif text-[28px] font-bold text-accent">{step.n}</p>
                  <p className="mt-2 text-[15px] font-bold text-navy">{step.title}</p>
                  <p className="mt-1 text-[12px] text-navy/55">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/about-sensory-map" className="text-[12px] font-semibold text-navy/60 hover:text-navy">
                자세히 알아보기 →
              </Link>
            </div>
          </div>
        </section>

        {/* BREW BETTER */}
        {brewGuides.length > 0 && (
          <section className="mx-auto max-w-[1240px] px-6 py-16">
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
                  className="border border-navy/15 bg-white p-5 hover:border-navy"
                >
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{guide.equipment}</p>
                  <p className="mt-1 font-serif text-[16px] font-bold text-navy">{guide.title}</p>
                  <p className="mt-2 text-[11px] text-navy/50">
                    {guide.coffeeDose} · {guide.ratio} · {guide.totalTime}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* JOURNAL */}
        {stories.length > 0 && (
          <section className="border-t border-navy/15 bg-white py-16">
            <div className="mx-auto max-w-[1240px] px-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">JOURNAL</p>
                  <h2 className="mt-1 font-serif text-[24px] font-bold text-navy">이야기</h2>
                </div>
                <Link to="/stories" className="hidden text-[12px] font-semibold text-navy/50 hover:text-navy sm:block">
                  전체 보기 →
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stories.map((story) => (
                  <Link key={story.id} to={`/stories/${story.slug}`} className="border border-navy/15 p-5 hover:border-navy">
                    <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{story.category}</p>
                    <p className="mt-1 font-serif text-[16px] font-bold text-navy">{story.title}</p>
                    <p className="mt-2 line-clamp-2 text-[12px] text-navy/55">{story.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
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
              <Link to="/wholesale" className="border border-warm-white/15 p-6 text-center hover:border-accent/60">
                <p className="font-serif text-[15px] font-bold text-warm-white">납품 문의</p>
              </Link>
              <Link to="/brew-guide" className="border border-warm-white/15 p-6 text-center hover:border-accent/60">
                <p className="font-serif text-[15px] font-bold text-warm-white">커피 교육</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
