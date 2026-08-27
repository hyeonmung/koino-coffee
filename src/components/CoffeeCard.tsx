import { Link } from 'react-router-dom'
import { CHARACTER_INFO } from '../constants/characters'
import { CHARACTER_STYLE } from '../constants/characterStyle'
import type { Coffee } from '../data/schema'
import CoffeeVisual from './CoffeeVisual'
import FlavorNotes from './FlavorNotes'
import MiniSensoryRadar from './MiniSensoryRadar'

interface CoffeeCardProps {
  coffee: Coffee
  /** Shows the compact 6-axis Sensory Radar below the text block — used on the Home coffee grid. */
  showRadar?: boolean
}

const AVAILABILITY_LABEL: Record<Coffee['availability'], string> = {
  available: 'Available',
  limited: 'Limited',
  archive: 'Past Coffee',
}

export default function CoffeeCard({ coffee, showRadar = false }: CoffeeCardProps) {
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
        <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/45">{coffee.country || 'ORIGIN'}</p>
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

      <h3 className="mt-1 font-serif text-[17px] font-bold leading-snug text-navy">{coffee.coffeeName}</h3>
      {coffee.koreanName && <p className="text-[11px] text-navy/40">{coffee.koreanName}</p>}

      <div className="mt-2 flex items-center gap-2">
        <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color: accent }}>
          {character.label}
        </span>
        <FlavorNotes notes={coffee.notes} character={coffee.character} limit={3} leading className="truncate text-[11px] text-navy/50" />
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
