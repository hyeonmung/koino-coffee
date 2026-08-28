import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getAllDictionaryTerms } from '../../data/repositories/dictionaryRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import type { DictionaryCategory } from '../../data/schema'

const CATEGORY_LABEL: Record<DictionaryCategory, string> = {
  FLAVOR: '향미',
  SENSORY: '센서리',
  PROCESS: '가공',
  VARIETY: '품종',
  GENERAL: '일반',
}

interface Entry {
  id: string
  term: string
  termKo?: string
  category: DictionaryCategory
  short: string
  easy?: string
  example?: string
  matchWords: string[]
}

export default function DictionaryDetailPage() {
  const { slug = '' } = useParams()

  const entry = useMemo<Entry | undefined>(() => {
    const fromTerm = getAllDictionaryTerms().find((t) => t.id === slug)
    if (fromTerm) {
      return {
        id: fromTerm.id,
        term: fromTerm.term,
        termKo: fromTerm.termKo,
        category: fromTerm.category,
        short: fromTerm.shortDefinition,
        easy: fromTerm.detailedDefinition,
        example: fromTerm.example,
        matchWords: [fromTerm.term, ...(fromTerm.termKo ? [fromTerm.termKo] : [])],
      }
    }
    const descriptors = getFlavorDescriptors()
    const families = getFlavorFamilies()
    const fromFlavor = descriptors.find((d) => d.id === slug)
    if (fromFlavor) {
      const family = families.find((f) => f.id === fromFlavor.familyId)
      return {
        id: fromFlavor.id,
        term: fromFlavor.name,
        termKo: fromFlavor.nameKo,
        category: 'FLAVOR',
        short: fromFlavor.description ?? `${family?.name ?? 'Flavor'} 계열의 향미입니다.`,
        example: fromFlavor.example,
        matchWords: [fromFlavor.name, ...(fromFlavor.nameKo ? [fromFlavor.nameKo] : []), ...fromFlavor.aliases],
      }
    }
    return undefined
  }, [slug])

  const coffees = useMemo(() => getPublishedCoffees(), [])

  if (!entry) return <Navigate to="/dictionary" replace />

  const relatedCoffees = coffees.filter((c) =>
    c.notes.some((note) => entry.matchWords.some((w) => note.toLowerCase() === w.toLowerCase())),
  )

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={`${entry.term} — 커피 사전`} description={entry.short} />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[640px] px-6 py-10">
        <Link to="/dictionary" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
          ← 커피 사전
        </Link>

        <p className="mt-4 text-[9px] font-semibold tracking-[0.15em] text-navy/40">
          분류 · {CATEGORY_LABEL[entry.category]}
        </p>
        <h1 className="mt-1 text-[30px] font-bold uppercase text-navy">{entry.term}</h1>
        {entry.termKo && <p className="text-[15px] text-navy/50">{entry.termKo}</p>}

        <section className="mt-8 border-t border-navy/10 pt-6">
          <h2 className="text-[11px] font-semibold tracking-[0.1em] text-accent">쉽게 말하면</h2>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-navy/75">{entry.short}</p>
        </section>

        {entry.easy && (
          <section className="mt-6">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-accent">이런 느낌입니다</h2>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-navy/75">{entry.easy}</p>
          </section>
        )}

        {entry.example && (
          <section className="mt-6">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-accent">예를 들면</h2>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-navy/75">{entry.example}</p>
          </section>
        )}

        {relatedCoffees.length > 0 && (
          <section className="mt-10 border-t border-navy/10 pt-8">
            <h2 className="text-[11px] font-semibold tracking-[0.1em] text-navy/40">이런 커피에서 찾을 수 있습니다</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedCoffees.slice(0, 4).map((c) => (
                <CoffeeCard key={c.id} coffee={c} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
