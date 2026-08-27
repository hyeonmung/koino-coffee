import { Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import { CHARACTER_STYLE } from '../../constants/characterStyle'
import { getCharacter } from '../../data/repositories/characterRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import type { SensoryKey, SensoryProfile } from '../../types'
import { CUP_CHARACTERS, SENSORY_KEYS, type CupCharacter } from '../../types'

function averageSensory(coffees: { sensory: SensoryProfile }[]): SensoryProfile | null {
  if (coffees.length === 0) return null
  const totals = Object.fromEntries(SENSORY_KEYS.map((k) => [k, 0])) as Record<SensoryKey, number>
  for (const c of coffees) {
    for (const key of SENSORY_KEYS) totals[key] += c.sensory[key]
  }
  const avg = Object.fromEntries(
    SENSORY_KEYS.map((k) => [k, Math.max(1, Math.min(5, Math.round(totals[k] / coffees.length))) as 1 | 2 | 3 | 4 | 5]),
  )
  return avg as unknown as SensoryProfile
}

export default function CharacterDetailPage() {
  const { key = '' } = useParams()
  const upperKey = key.toUpperCase()
  const isValid = CUP_CHARACTERS.includes(upperKey as CupCharacter)

  if (!isValid) return <Navigate to="/characters" replace />

  const character = getCharacter(upperKey as CupCharacter)
  const coffees = getPublishedCoffees().filter((c) => c.character === upperKey)
  const tendency = averageSensory(coffees)

  if (!character) return <Navigate to="/characters" replace />

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={character.label} description={character.description} />
      <PublicHeader />

      {character.image && (
        <div
          className="aspect-[21/9] w-full bg-navy/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${character.image})` }}
          role="img"
          aria-label={character.label}
        />
      )}

      <main className="flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <span className="inline-block border border-navy bg-navy px-4 py-2 text-[16px] font-bold tracking-[0.2em] text-warm-white">
          {character.label}
        </span>
        <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-navy/70">{character.heroCopy}</p>
        <p className="mt-2 text-[12px] font-semibold tracking-[0.1em] text-navy/45">{character.flavors}</p>

        {tendency && (
          <div className="mt-10 flex flex-col items-center border-t border-navy/15 pt-8 sm:flex-row sm:gap-10">
            <RadarChart
              sensory={tendency}
              size={220}
              accentColor={CHARACTER_STYLE[upperKey as CupCharacter].accent}
              accentSoft={CHARACTER_STYLE[upperKey as CupCharacter].accentSoft}
            />
            <p className="mt-4 max-w-[320px] text-center text-[11px] text-navy/45 sm:mt-0 sm:text-left">
              {character.label} 원두 {coffees.length}종의 평균 Sensory Profile입니다. 실제 원두마다 세부 수치는
              다를 수 있습니다.
            </p>
          </div>
        )}

        <section className="mt-14 border-t border-navy/15 pt-10">
          <h2 className="font-serif text-[20px] font-bold text-navy">{character.label} 원두</h2>
          {coffees.length === 0 ? (
            <p className="mt-4 border border-navy/15 bg-white px-6 py-10 text-center text-[13px] text-navy/45">
              현재 소개 중인 {character.label} 커피가 없습니다.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coffees.map((c) => (
                <CoffeeCard key={c.id} coffee={c} />
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
