import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getAllCharacters } from '../../data/repositories/characterRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'

export default function CharactersIndexPage() {
  const characters = getAllCharacters()
  const coffees = getPublishedCoffees()

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="Cup Character" description="코이노커피의 5가지 CUP CHARACTER를 소개합니다." />
      <PublicHeader />

      <main className="mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">CUP CHARACTER</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">커피의 5가지 성격</h1>
        <p className="mt-2 max-w-[560px] text-[13px] text-navy/60">
          우열이 아니라 스타일의 차이입니다. 나에게 맞는 인상을 먼저 골라보세요.
        </p>

        <div className="mt-10 space-y-4">
          {characters.map((character) => {
            const count = coffees.filter((c) => c.character === character.key).length
            return (
              <Link
                key={character.key}
                to={`/characters/${character.key.toLowerCase()}`}
                className="group grid grid-cols-1 gap-3 border border-navy/15 bg-white p-6 transition-colors hover:border-navy sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="inline-block w-fit border border-navy bg-navy px-3 py-1.5 text-[12px] font-bold tracking-[0.15em] text-warm-white">
                  {character.label}
                </span>
                <div>
                  <p className="text-[13px] text-navy/70">{character.description}</p>
                  <p className="mt-1 text-[11px] text-navy/40">{character.flavors}</p>
                </div>
                <p className="text-[11px] font-semibold tracking-wide text-navy/45 group-hover:text-accent">
                  {count}종의 원두 →
                </p>
              </Link>
            )
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
