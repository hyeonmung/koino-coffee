import { Link } from 'react-router-dom'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'
import KOIStarField from './decorative/KOIStarField'

export default function PublicFooter() {
  const settings = getSiteSettings()

  return (
    <footer className="koi-night-sky mt-20 overflow-hidden">
      <KOIStarField />
      <div className="relative mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-[16px] font-bold text-warm-white">{settings.logoText}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-warm-white/50">{settings.heroSubtitle}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-accent/70">EXPLORE</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link to="/coffees" className="text-[12px] text-warm-white/65 hover:text-warm-white">
                전체 커피 보기
              </Link>
              <Link to="/discover" className="text-[12px] text-warm-white/65 hover:text-warm-white">
                취향에 맞는 커피 찾기
              </Link>
              <Link to="/wholesale" className="text-[12px] text-warm-white/65 hover:text-warm-white">
                납품 · 도매 문의
              </Link>
              {settings.purchaseUrl && (
                <a
                  href={settings.purchaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] text-warm-white/65 hover:text-warm-white"
                >
                  원두 구매
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-accent/70">CONTACT</p>
            <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-warm-white/65">
              {settings.address && <p>{settings.address}</p>}
              {settings.phone && <p>{settings.phone}</p>}
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
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-warm-white/10 pt-5 text-[10px] text-warm-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.footerNote}</p>
          <Link to="/admin" className="hover:text-warm-white/60">
            관리자
          </Link>
        </div>
      </div>
    </footer>
  )
}
