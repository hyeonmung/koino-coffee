import { Link } from 'react-router-dom'
import { CHARACTER_INFO } from '../constants/characters'
import { getCharacterStyle } from '../constants/characterStyle'
import type { Coffee } from '../data/schema'
import { useTheme } from '../hooks/useTheme'
import { formatCoffeeNumber } from '../utils/coffeeNumber'
import CoffeePrice from './CoffeePrice'
import CoffeeVisual from './CoffeeVisual'
import FavoriteStar from './FavoriteStar'
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
  sold_out: '품절',
  restocking: '재입고 예정',
}

export default function CoffeeCard({ coffee, showRadar = false, narrowMobileGrid = false }: CoffeeCardProps) {
  const character = CHARACTER_INFO[coffee.character]
  const { resolved } = useTheme()
  const accent = getCharacterStyle(coffee.character, resolved === 'dark').accent

  return (
    <Link to={`/coffees/${coffee.slug}`} className="group block">
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-[1.02]">
          <CoffeeVisual coffee={coffee} focalPoint={coffee.imageFocalPoint} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {formatCoffeeNumber(coffee.coffeeNumber) && (
          <p className="text-[16px] font-bold text-ink/50" style={{ fontFamily: 'var(--font-gungseo)' }}>
            {formatCoffeeNumber(coffee.coffeeNumber)}
          </p>
        )}
        <div className="flex items-center gap-2">
          {coffee.availability !== 'available' && (
            <span
              className={`text-[9px] font-semibold tracking-[0.1em] ${
                coffee.availability === 'limited' ? 'text-accent' : 'text-ink/35'
              }`}
            >
              {AVAILABILITY_LABEL[coffee.availability]}
            </span>
          )}
          <FavoriteStar slug={coffee.slug} count={coffee.favoriteCount} size={16} className="text-ink/30" />
        </div>
      </div>

      {((coffee.badges?.length ?? 0) > 0 || coffee.isDecaf) && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {coffee.badges?.map((b) => (
            <span key={b} className="border border-accent/50 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.05em] text-accent">
              {b}
            </span>
          ))}
          {coffee.isDecaf && (
            <span className="border border-line/25 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.05em] text-ink/60">DECAF</span>
          )}
        </div>
      )}

      <div className="mt-1 flex items-stretch gap-3">
        <FlavorSpectrumSpine notes={coffee.notes} limit={3} size="md" />
        <div className="min-w-0">
          {/* min-h reserves enough lines that the Character/Flavor row below starts at the same point across a grid row. */}
          <h3
            className={`font-serif text-[17px] font-bold leading-snug whitespace-pre-line text-ink ${
              narrowMobileGrid ? 'min-h-[70px] lg:min-h-12' : 'min-h-12'
            }`}
          >
            {coffee.coffeeName}
          </h3>
          {coffee.koreanName && <p className="whitespace-pre-line text-[11px] text-ink/40">{coffee.koreanName}</p>}

          <div className="mt-2 min-w-0">
            <span className="text-[13px] font-bold tracking-[0.1em]" style={{ color: accent }}>
              {character.label}
            </span>
            {/* Two notes per line by construction (not a width-dependent wrap) — a long word
                left dangling alone on its own line (natural flow wrap) reads as a mistake. */}
            <div className="mt-1 space-y-0.5 text-[11px] text-ink/50">
              {[coffee.notes.slice(0, 2), coffee.notes.slice(2, 4)].map(
                (pair, i) => pair.length > 0 && <FlavorNotes key={i} notes={pair} className="block" />,
              )}
            </div>
          </div>
        </div>
      </div>

      {showRadar && (
        <div className="mt-3 flex justify-center border-t border-line/10 pt-3">
          <MiniSensoryRadar
            sensory={coffee.sensory}
            character={coffee.character}
            size={108}
            className="transition-opacity duration-500 group-hover:opacity-90"
          />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-line/10 pt-2">
        {/* Hover-only desktop affordance — hidden on mobile (no hover state there) so it stops
            reserving row width and squeezing the price into overflow. */}
        <p className="hidden text-[10px] font-semibold tracking-[0.1em] text-ink/0 transition-colors group-hover:text-ink/45 sm:block">
          VIEW COFFEE →
        </p>
        <CoffeePrice coffee={coffee} className="ml-auto" />
      </div>
    </Link>
  )
}
