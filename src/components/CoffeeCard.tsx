import { Link } from 'react-router-dom'
import { CHARACTER_INFO } from '../constants/characters'
import type { Coffee } from '../data/schema'
import RadarChart from './RadarChart'

interface CoffeeCardProps {
  coffee: Coffee
}

const AVAILABILITY_LABEL: Record<Coffee['availability'], string> = {
  available: 'Available',
  limited: 'Limited',
  archive: 'Past Coffee',
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  const character = CHARACTER_INFO[coffee.character]

  return (
    <Link
      to={`/coffees/${coffee.slug}`}
      className="group block border border-navy/15 bg-white p-5 transition-colors hover:border-navy"
    >
      <div className="flex items-center justify-between">
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

      <h3 className="mt-1.5 font-serif text-[17px] font-bold leading-snug text-navy">{coffee.coffeeName}</h3>
      {coffee.koreanName && <p className="text-[11px] text-navy/40">{coffee.koreanName}</p>}

      <span className="mt-2 inline-block border border-navy bg-navy px-2 py-0.5 text-[9px] font-bold tracking-[0.15em] text-warm-white">
        {character.label}
      </span>

      {coffee.notes.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-navy/60">{coffee.notes.slice(0, 4).join(' · ')}</p>
      )}

      <div className="mt-2 flex justify-center pointer-events-none">
        <RadarChart sensory={coffee.sensory} size={140} showLabels={false} />
      </div>

      <p className="text-center text-[11px] font-semibold tracking-[0.1em] text-navy/40 opacity-0 transition-opacity group-hover:opacity-100">
        VIEW COFFEE
      </p>
    </Link>
  )
}
