import { Link } from 'react-router-dom'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'

export default function PublicFooter() {
  const settings = getSiteSettings()

  return (
    <footer className="mt-20 border-t border-navy/15 bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-[16px] font-bold text-navy">{settings.logoText}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-navy/50">{settings.heroSubtitle}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">EXPLORE</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link to="/coffees" className="text-[12px] text-navy/60 hover:text-navy">
                전체 커피 보기
              </Link>
              <Link to="/discover" className="text-[12px] text-navy/60 hover:text-navy">
                취향에 맞는 커피 찾기
              </Link>
              <Link to="/wholesale" className="text-[12px] text-navy/60 hover:text-navy">
                납품 · 도매 문의
              </Link>
              {settings.purchaseUrl && (
                <a
                  href={settings.purchaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] text-navy/60 hover:text-navy"
                >
                  원두 구매
                </a>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">CONTACT</p>
            <div className="mt-2 flex flex-col gap-1.5 text-[12px] text-navy/60">
              {settings.address && <p>{settings.address}</p>}
              {settings.phone && <p>{settings.phone}</p>}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-navy">
                  Instagram
                </a>
              )}
              {settings.naverUrl && (
                <a href={settings.naverUrl} target="_blank" rel="noreferrer" className="hover:text-navy">
                  Naver
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-navy/10 pt-5 text-[10px] text-navy/35 sm:flex-row sm:items-center sm:justify-between">
          <p>{settings.footerNote}</p>
          <Link to="/admin" className="hover:text-navy/60">
            관리자
          </Link>
        </div>
      </div>
    </footer>
  )
}
