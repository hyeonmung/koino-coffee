import { Link } from 'react-router-dom'

interface GalleryHeaderProps {
  backTo?: string
  backLabel?: string
}

export default function GalleryHeader({ backTo, backLabel }: GalleryHeaderProps) {
  return (
    <header className="border-b border-navy/15 bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">KOINO COFFEE</p>
          <Link to="/" className="mt-0.5 block font-serif text-[20px] font-bold tracking-tight text-navy">
            KOINO SENSORY MAP
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {backTo && (
            <Link
              to={backTo}
              className="text-[12px] font-semibold tracking-wide text-navy/60 hover:text-navy"
            >
              ← {backLabel ?? '전체 산지'}
            </Link>
          )}
          <Link to="/guide" className="text-[12px] font-semibold tracking-wide text-navy/60 hover:text-navy">
            평가 기준 안내
          </Link>
          <Link
            to="/admin"
            className="border border-navy/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-navy/50 hover:border-navy hover:text-navy"
          >
            관리자
          </Link>
        </div>
      </div>
    </header>
  )
}
