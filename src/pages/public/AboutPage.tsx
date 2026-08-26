import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'

export default function AboutPage() {
  const settings = getSiteSettings()

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="코이노커피" description={settings.aboutIntro} />
      <PublicHeader />

      <main>
        <section className="border-b border-navy/15 bg-white px-6 py-16 text-center">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">KOINO COFFEE</p>
          <h1 className="mt-2 font-serif text-[28px] font-bold text-navy">코이노커피</h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[14px] leading-relaxed text-navy/65">
            {settings.aboutIntro}
          </p>
        </section>

        <div className="mx-auto max-w-[960px] px-6 py-16">
          {settings.aboutSections.map((section, i) =>
            section.image ? (
              <section
                key={i}
                className={`grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-14 ${
                  i > 0 ? 'mt-16 border-t border-navy/10 pt-16' : ''
                }`}
              >
                <div className={i % 2 === 1 ? 'sm:order-2' : ''}>
                  <div
                    className="aspect-[4/5] w-full bg-navy/5 bg-cover bg-center"
                    style={{ backgroundImage: `url(${section.image})` }}
                    role="img"
                    aria-label={section.heading}
                  />
                </div>
                <div className={i % 2 === 1 ? 'sm:order-1' : ''}>
                  <h2 className="font-serif text-[20px] font-bold text-navy">{section.heading}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-navy/70">{section.body}</p>
                </div>
              </section>
            ) : (
              <section key={i} className={`mx-auto max-w-[560px] ${i > 0 ? 'mt-16 border-t border-navy/10 pt-16' : ''}`}>
                <h2 className="font-serif text-[20px] font-bold text-navy">{section.heading}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-navy/70">{section.body}</p>
              </section>
            ),
          )}

          <div className="mt-16 flex flex-wrap justify-center gap-3 border-t border-navy/10 pt-10">
            <Link
              to="/coffees"
              className="border border-navy bg-navy px-6 py-3 text-[12px] font-semibold tracking-[0.1em] text-warm-white hover:bg-navy-light"
            >
              원두 둘러보기
            </Link>
            <Link
              to={settings.businessUrl || '/business'}
              className="border border-navy/25 px-6 py-3 text-[12px] font-semibold tracking-[0.1em] text-navy hover:border-navy"
            >
              납품 · 교육 문의
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
