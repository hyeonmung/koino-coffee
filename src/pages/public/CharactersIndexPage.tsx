import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getCharacterStyle } from '../../constants/characterStyle'
import { getAllCharacters } from '../../data/repositories/characterRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { useTheme } from '../../hooks/useTheme'

export default function CharactersIndexPage() {
  const characters = getAllCharacters()
  const coffees = getPublishedCoffees()
  const { resolved } = useTheme()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title="KOINO CUP CHARACTER" description="코이노니아의 5가지 CUP CHARACTER를 소개합니다." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">CUP CHARACTER</p>
        <h1 className="mt-1 text-[28px] font-bold text-ink">커피의 5가지 성격</h1>
        <p className="mt-2 max-w-[560px] text-[13px] text-ink/60">
          우열이 아니라 스타일의 차이입니다. 나에게 맞는 인상을 먼저 골라보세요.
        </p>

        <div className="mt-10 space-y-4">
          {characters.map((character) => {
            const count = coffees.filter((c) => c.character === character.key).length
            return (
              <Link
                key={character.key}
                to={`/characters/${character.key.toLowerCase()}`}
                className="group grid grid-cols-1 gap-3 border border-line/15 border-l-[3px] bg-surface p-6 transition-colors hover:border-line sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center"
                style={{ borderLeftColor: getCharacterStyle(character.key, resolved === 'dark').accent }}
              >
                <div className="flex items-center gap-3">
                  {character.image && (
                    <div
                      className="h-12 w-12 shrink-0 bg-navy/5 bg-cover bg-center"
                      style={{ backgroundImage: `url(${character.image})` }}
                      role="img"
                      aria-label={character.label}
                    />
                  )}
                  <span className="inline-block w-fit border border-line bg-navy px-3 py-1.5 text-[12px] font-bold tracking-[0.15em] text-warm-white">
                    {character.label}
                  </span>
                </div>
                <div>
                  <p className="whitespace-pre-line text-[13px] text-ink/70">{character.description}</p>
                  <p className="mt-1 whitespace-pre-line text-[11px] text-ink/40">{character.flavors}</p>
                </div>
                <p className="text-[11px] font-semibold tracking-wide text-ink/45 group-hover:text-accent">
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
