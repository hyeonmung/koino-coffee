import { Link } from 'react-router-dom'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'
import KOIStarField from './decorative/KOIStarField'

export default function PublicFooter() {
  const settings = getSiteSettings()

  const quickLinks = (
    <>
      <Link to="/coffees" className="text-[12px] text-warm-white/65 hover:text-warm-white">
        전체 원두 보기
      </Link>
      <Link to="/coffee-chart" className="text-[12px] text-warm-white/65 hover:text-warm-white">
        원두 차트
      </Link>
      <Link to="/discover" className="text-[12px] text-warm-white/65 hover:text-warm-white">
        취향에 맞는 커피 찾기
      </Link>
      <Link to="/compare" className="text-[12px] text-warm-white/65 hover:text-warm-white">
        원두 비교하기
      </Link>
      {settings.purchaseUrl && (
        <a href={settings.purchaseUrl} target="_blank" rel="noreferrer" className="text-[12px] text-warm-white/65 hover:text-warm-white">
          원두 구매
        </a>
      )}
    </>
  )

  const contactInfo = (
    <>
      {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
      {settings.businessHours && <p className="whitespace-pre-line">{settings.businessHours}</p>}
      {settings.phone && <p className="whitespace-pre-line">{settings.phone}</p>}
      {settings.instagramUrl && (
        <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-warm-white">
          Instagram
        </a>
      )}
      {settings.naverUrl && (
        <a href={settings.naverUrl} target="_blank" rel="noreferrer" className="hover:text-warm-white">
          Naver
        </a>
      )}
    </>
  )

  return (
    <footer className="koi-night-sky overflow-hidden">
      <KOIStarField />
      <div className="relative mx-auto max-w-[1240px] px-5 py-6 sm:px-6 sm:py-12">
        {/* Mobile: logo + tagline inline, nav groups stacked tightly right below. Desktop (sm:) switches to the 3-column layout. */}
        <div className="flex items-center gap-3 sm:hidden">
          <img src="/brand/koinonia-wordmark-gold.png" alt="KOINONIA Roasters" className="h-10 w-auto shrink-0" />
          <p className="text-[11px] leading-tight text-warm-white/50">{settings.heroSubtitle}</p>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="hidden sm:block">
            <img src="/brand/koinonia-wordmark-gold.png" alt="KOINONIA Roasters" className="h-14 w-auto" />
            <p className="mt-3 whitespace-pre-line text-[12px] leading-relaxed text-warm-white/50">
              {settings.heroSubtitle}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-accent/70">바로가기</p>
            <div className="mt-2 flex flex-col gap-1.5">{quickLinks}</div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-accent/70">문의처</p>
            <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-warm-white/65">{contactInfo}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-warm-white/10 pt-4 text-[10px] text-warm-white/35 sm:mt-10 sm:pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="whitespace-pre-line">{settings.footerNote}</p>
            {settings.businessRegistrationInfo && (
              <p className="whitespace-pre-line text-warm-white/25">{settings.businessRegistrationInfo}</p>
            )}
          </div>
          <Link to="/admin" className="hover:text-warm-white/60">
            관리자
          </Link>
        </div>
      </div>
    </footer>
  )
}
