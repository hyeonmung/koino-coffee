import AboutBlockRenderer from '../../components/about/AboutBlockRenderer'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getAboutPageSettings, getVisibleAboutBlocks } from '../../data/repositories/aboutRepository'

const OVERLAY_CLASS = { low: 'bg-navy/25', medium: 'bg-navy/45', high: 'bg-navy/65' } as const
const TEXT_POSITION_CLASS = { LEFT: 'items-start text-left', CENTER: 'items-center text-center', RIGHT: 'items-end text-right' } as const

export default function AboutPage() {
  const { hero, seoTitle, seoDescription } = getAboutPageSettings()
  const blocks = getVisibleAboutBlocks()

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={seoTitle || '코이노커피'} description={seoDescription || hero.subtitle} />
      <PublicHeader />

      <main className="flex-1">
        {/* HERO */}
        <div
          className={`relative flex min-h-[280px] w-full flex-col justify-center overflow-hidden px-6 py-16 sm:min-h-[380px] ${
            hero.imageDesktop ? '' : 'koi-night-sky'
          }`}
          style={
            hero.imageDesktop
              ? { backgroundImage: `url(${hero.imageDesktop})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          {!hero.imageDesktop && <KOIStarField />}
          {hero.imageDesktop && <div className={`absolute inset-0 ${OVERLAY_CLASS[hero.overlay]}`} />}
          <div className={`relative mx-auto flex w-full max-w-[1280px] flex-col px-0 ${TEXT_POSITION_CLASS[hero.textPositionDesktop]}`}>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">KOINO COFFEE</p>
            <h1 className="mt-2 font-serif text-[32px] font-bold text-warm-white sm:text-[40px]">{hero.title}</h1>
            {hero.subtitle && <p className="mx-0 mt-3 max-w-[520px] text-[14px] leading-relaxed text-warm-white/75">{hero.subtitle}</p>}
          </div>
        </div>

        {/* EDITORIAL BLOCKS */}
        {blocks.map((block) => (
          <AboutBlockRenderer key={block.id} block={block} />
        ))}
      </main>

      <PublicFooter />
    </div>
  )
}
