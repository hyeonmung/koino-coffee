import { Link } from 'react-router-dom'
import { CHARACTER_INFO } from '../constants/characters'
import type { CoffeeProfile } from '../types'
import RadarChart from './RadarChart'

interface CoffeeGalleryCardProps {
  coffee: CoffeeProfile
  to: string
}

export default function CoffeeGalleryCard({ coffee, to }: CoffeeGalleryCardProps) {
  const character = CHARACTER_INFO[coffee.character]

  return (
    <Link
      to={to}
      className="block border border-navy/15 bg-white p-5 transition-colors hover:border-navy"
    >
      <div className="flex items-center justify-between">
        <span className="border border-navy bg-navy px-2 py-0.5 text-[9px] font-bold tracking-[0.15em] text-warm-white">
          {character.label}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-[16px] font-bold leading-snug text-navy">{coffee.coffeeName}</h3>
      {coffee.region && <p className="text-[11px] text-navy/45">{coffee.region}</p>}

      <div className="mt-2 flex justify-center pointer-events-none">
        <RadarChart sensory={coffee.sensory} size={140} showLabels={false} />
      </div>

      {coffee.notes.length > 0 && (
        <p className="mt-2 truncate text-[11px] text-navy/60">{coffee.notes.join(' · ')}</p>
      )}
    </Link>
  )
}
