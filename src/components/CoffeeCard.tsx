import { Link } from 'react-router-dom'
import { CHARACTER_INFO } from '../constants/characters'
import { CHARACTER_STYLE } from '../constants/characterStyle'
import type { Coffee } from '../data/schema'
import { formatCoffeeNumber } from '../utils/coffeeNumber'
import CoffeeVisual from './CoffeeVisual'
import FlavorNotes from './FlavorNotes'
import FlavorSpectrumSpine from './FlavorSpectrumSpine'
import MiniSensoryRadar from './MiniSensoryRadar'

interface CoffeeCardProps {
  coffee: Coffee
  /** Shows the compact 6-axis Sensory Radar below the text block — used on the Home coffee grid. */
  showRadar?: boolean
  /**
   * Set true only when this card renders inside a grid that stays 2-narrow-columns on mobile
   * (e.g. Home's "지금 만날 수 있는 커피" grid) — reserves 3 lines for the name instead of 2, since a
   * long all-caps name can reach 3 lines at that card width. Grids that go full-width or wider on
   * mobile (Explorer, Related, Character list, ...) should leave this off — reserving extra height
   * there just leaves unused space under short names.
   */
  narrowMobileGrid?: boolean
}

const AVAILABILITY_LABEL: Record<Coffee['availability'], string> = {
  available: 'Available',
  limited: 'Limited',
  archive: 'Past Coffee',
}

export default function CoffeeCard({ coffee, showRadar = false, narrowMobileGrid = false }: CoffeeCardProps) {
  const character = CHARACTER_INFO[coffee.character]
  const accent = CHARACTER_STYLE[coffee.character].accent

  return (
    <Link to={`/coffees/${coffee.slug}`} className="group block">
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          <CoffeeVisual coffee={coffee} focalPoint={coffee.imageFocalPoint} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {formatCoffeeNumber(coffee.coffeeNumber) && (
          <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/40">{formatCoffeeNumber(coffee.coffeeNumber)}</p>
        )}
        {coffee.availability !== 'available' && (
          <span
            className={`text-[9px] font-semibold tracking-[0.1em] ${
              coffee.availability === 'limited' ? 'text-accent' : 'text-navy/35'
            }`}
          >
            {AVAILABILITY_LABEL[coffee.availability]}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-stretch gap-3">
        <FlavorSpectrumSpine notes={coffee.notes} limit={3} size="md" />
        <div className="min-w-0">
          {/* min-h reserves enough lines that the Character/Flavor row below starts at the same point across a grid row. */}
          <h3
            className={`font-serif text-[17px] font-bold leading-snug whitespace-pre-line text-navy ${
              narrowMobileGrid ? 'min-h-[70px] lg:min-h-12' : 'min-h-12'
            }`}
          >
            {coffee.coffeeName}
          </h3>
          {coffee.koreanName && <p className="whitespace-pre-line text-[11px] text-navy/40">{coffee.koreanName}</p>}

          <div className="mt-2 flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[9px] font-bold tracking-[0.15em]" style={{ color: accent }}>
              {character.label}
            </span>
            <FlavorNotes notes={coffee.notes} limit={3} leading className="truncate text-[11px] text-navy/50" />
          </div>
        </div>
      </div>

      {showRadar && (
        <div className="mt-3 flex justify-center border-t border-navy/10 pt-3">
          <MiniSensoryRadar
            sensory={coffee.sensory}
            character={coffee.character}
            size={108}
            className="transition-opacity duration-500 group-hover:opacity-90"
          />
        </div>
      )}

      <p className="mt-2 border-t border-navy/10 pt-2 text-[10px] font-semibold tracking-[0.1em] text-navy/0 transition-colors group-hover:text-navy/45">
        VIEW COFFEE →
      </p>
    </Link>
  )
}
