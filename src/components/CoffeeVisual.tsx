import { COFFEE_CARD_ASPECT_CLASS, FOCAL_POINT_POSITION, type ImageFocalPoint } from '../constants/media'
import type { Coffee } from '../data/schema'
import KOIStarField from './decorative/KOIStarField'

interface CoffeeVisualProps {
  coffee: Pick<Coffee, 'heroImage' | 'coffeeName' | 'koreanName' | 'country' | 'harvest'>
  className?: string
  /** Full identity (name/country/year) for standalone contexts. Off in list cards, where a caption already shows this — avoids showing the same text twice. */
  showIdentity?: boolean
  /** Tailwind aspect-ratio class. Defaults to the shared Coffee Card ratio (17:11); pass a wider one for page heroes. */
  aspect?: string
  /** Which part of the photo stays visible when the frame crops it. Ignored by the no-photo placeholder. */
  focalPoint?: ImageFocalPoint
}

/**
 * The card-level "image" slot: a real photo when one has been uploaded, otherwise a
 * KOI-branded typographic placeholder (Navy + tiny stars) instead of an empty box or a
 * stock photo. Never fabricates a photo.
 */
export default function CoffeeVisual({
  coffee,
  className = '',
  showIdentity = false,
  aspect = COFFEE_CARD_ASPECT_CLASS,
  focalPoint = 'center',
}: CoffeeVisualProps) {
  if (coffee.heroImage) {
    return (
      <div
        className={`${aspect} w-full bg-navy/5 bg-cover ${className}`}
        style={{ backgroundImage: `url(${coffee.heroImage})`, backgroundPosition: FOCAL_POINT_POSITION[focalPoint] }}
        role="img"
        aria-label={coffee.coffeeName}
      />
    )
  }

  const year = coffee.harvest?.match(/\d{4}/)?.[0]

  return (
    <div className={`koi-night-sky relative ${aspect} w-full overflow-hidden ${className}`}>
      <KOIStarField />
      <div className="relative flex h-full flex-col justify-between p-4">
        <p className="text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">KOINONIA</p>
        {showIdentity && (
          <div>
            <p className="font-serif text-[15px] font-bold leading-tight text-warm-white/90">{coffee.coffeeName}</p>
            {coffee.koreanName && <p className="mt-0.5 text-[10px] text-warm-white/40">{coffee.koreanName}</p>}
            {(coffee.country || year) && (
              <p className="mt-1.5 text-[9px] tracking-[0.15em] text-accent/70">
                {[coffee.country, year].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
