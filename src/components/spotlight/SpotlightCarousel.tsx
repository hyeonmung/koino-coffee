import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import KOIStarField from '../decorative/KOIStarField'
import { resolveSpotlightSlide } from '../../data/spotlightResolve'
import type { SpotlightSlide } from '../../data/schema'

const AUTOPLAY_MS = 3000

const OVERLAY_CLASS: Record<string, string> = {
  low: 'from-navy/55 via-navy/10',
  medium: 'from-navy/80 via-navy/30',
  high: 'from-navy/95 via-navy/55',
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

interface SpotlightCarouselProps {
  slides: SpotlightSlide[]
}

export default function SpotlightCarousel({ slides }: SpotlightCarouselProps) {
  const resolved = useMemo(
    () =>
      slides
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((slide) => ({ slide, content: resolveSpotlightSlide(slide) }))
        .filter((s): s is { slide: SpotlightSlide; content: NonNullable<ReturnType<typeof resolveSpotlightSlide>> } =>
          Boolean(s.content),
        ),
    [slides],
  )

  const [index, setIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const count = resolved.length
  const safeIndex = count > 0 ? ((index % count) + count) % count : 0

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = hovering || tabHidden || count <= 1
  const next = () => setIndex((i) => i + 1)
  const prev = () => setIndex((i) => i - 1)

  useEffect(() => {
    if (paused) return
    const t = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, count])

  if (count === 0) return null

  const current = resolved[safeIndex]
  const { content } = current

  return (
    <div
      className="group/spotlight relative h-full w-full overflow-hidden focus:outline-none"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const delta = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(delta) > 40) (delta < 0 ? next : prev)()
        touchStartX.current = null
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="KOI 스포트라이트"
      tabIndex={0}
    >
      {resolved.map(({ slide, content: c }, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== safeIndex}
          className={`absolute inset-0 ${reducedMotion ? '' : 'transition-opacity duration-500 ease-out'} ${
            i === safeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {c.desktopImage ? (
            <>
              <div
                className="hidden h-full w-full bg-navy/10 bg-cover bg-center sm:block"
                style={{ backgroundImage: `url(${c.desktopImage})` }}
                role="img"
                aria-label={c.altText}
              />
              <div
                className="block h-full w-full bg-navy/10 bg-cover bg-center sm:hidden"
                style={{ backgroundImage: `url(${c.mobileImage || c.desktopImage})` }}
                role="img"
                aria-label={c.altText}
              />
            </>
          ) : (
            <div className="koi-night-sky relative h-full w-full overflow-hidden">
              <KOIStarField />
            </div>
          )}
          <div className={`absolute inset-0 bg-gradient-to-t ${OVERLAY_CLASS[slide.overlayStrength] ?? OVERLAY_CLASS.medium} to-transparent`} />
        </div>
      ))}

      {/* content overlay for the active slide only — keeps text/CTA in one stable DOM node */}
      <Link
        to={content.ctaUrl.startsWith('/') ? content.ctaUrl : '#'}
        onClick={(e) => {
          if (!content.ctaUrl.startsWith('/')) {
            e.preventDefault()
            window.open(content.ctaUrl, '_blank', 'noreferrer')
          }
        }}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-6 py-6 text-warm-white sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-8 sm:py-7"
      >
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-[0.25em] text-accent">{content.label}</p>
          <p className="mt-1 font-serif text-[19px] font-bold leading-snug sm:truncate sm:text-[22px]">{content.title}</p>
          {content.description && <p className="mt-1 max-w-[440px] text-[11px] text-warm-white/70">{content.description}</p>}
        </div>
        <span className="shrink-0 text-[11px] font-semibold tracking-[0.1em] text-warm-white/70 group-hover/spotlight:text-warm-white">
          {content.ctaText} →
        </span>
      </Link>

      {count > 1 && (
        <div className="absolute left-6 top-5 flex items-center gap-3 sm:left-8 sm:top-6">
          <span className="text-[10px] font-semibold tracking-[0.1em] text-warm-white/60">
            {String(safeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <div className="flex h-[3px] w-16 overflow-hidden bg-warm-white/20">
            <div
              key={`${safeIndex}-${paused}`}
              className="h-full bg-accent"
              style={{
                width: reducedMotion ? '100%' : '0%',
                animation: reducedMotion || paused ? 'none' : `koi-spotlight-progress ${AUTOPLAY_MS}ms linear forwards`,
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                prev()
              }}
              aria-label="이전 슬라이드"
              className="flex h-6 w-6 items-center justify-center text-warm-white/60 hover:text-warm-white"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                next()
              }}
              aria-label="다음 슬라이드"
              className="flex h-6 w-6 items-center justify-center text-warm-white/60 hover:text-warm-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
