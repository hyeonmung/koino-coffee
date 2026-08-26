import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getAllDictionaryTerms } from '../../data/repositories/dictionaryRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import type { DictionaryCategory } from '../../data/schema'

interface Entry {
  id: string
  term: string
  termKo?: string
  category: DictionaryCategory
  shortDefinition: string
}

const CATEGORY_LABEL: Record<DictionaryCategory, string> = {
  FLAVOR: '향미',
  SENSORY: '센서리',
  PROCESS: '가공',
  VARIETY: '품종',
  GENERAL: '일반',
}

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'ALL' | DictionaryCategory>('ALL')

  const entries = useMemo<Entry[]>(() => {
    const descriptors = getFlavorDescriptors()
    const families = getFlavorFamilies()
    const fromFlavors: Entry[] = descriptors.map((d) => {
      const family = families.find((f) => f.id === d.familyId)
      return {
        id: d.id,
        term: d.name,
        termKo: d.nameKo,
        category: 'FLAVOR',
        shortDefinition: d.description ?? `${family?.name ?? 'Flavor'} 계열의 향미 노트입니다.`,
      }
    })
    const fromTerms: Entry[] = getAllDictionaryTerms().map((t) => ({
      id: t.id,
      term: t.term,
      termKo: t.termKo,
      category: t.category,
      shortDefinition: t.shortDefinition,
    }))
    return [...fromTerms, ...fromFlavors].sort((a, b) => a.term.localeCompare(b.term))
  }, [])

  const filtered = entries
    .filter((e) => category === 'ALL' || e.category === category)
    .filter(
      (e) =>
        !query.trim() ||
        e.term.toLowerCase().includes(query.trim().toLowerCase()) ||
        (e.termKo ?? '').includes(query.trim()),
    )

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="커피 사전" description="향미, 센서리, 가공, 품종 등 궁금한 커피 단어를 검색해보세요." />
      <PublicHeader />

      <main className="mx-auto max-w-[860px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">DICTIONARY</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">커피 사전</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="궁금한 커피 단어를 검색해보세요"
          className="mt-6 w-full border border-navy/25 bg-white px-4 py-3 text-[13px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
        />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(['ALL', 'FLAVOR', 'SENSORY', 'PROCESS', 'VARIETY', 'GENERAL'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                category === c ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
              }`}
            >
              {c === 'ALL' ? '전체' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="mt-8 divide-y divide-navy/10 border-t border-navy/15">
          {filtered.length === 0 && <p className="py-10 text-center text-[13px] text-navy/40">검색 결과가 없습니다.</p>}
          {filtered.map((entry) => (
            <Link key={entry.id} to={`/dictionary/${entry.id}`} className="block py-4 hover:bg-white">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-serif text-[15px] font-bold text-navy">{entry.term}</p>
                {entry.termKo && <p className="text-[12px] text-navy/45">{entry.termKo}</p>}
                <span className="ml-auto text-[9px] font-semibold tracking-wide text-navy/35">
                  {CATEGORY_LABEL[entry.category]}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-navy/65">{entry.shortDefinition}</p>
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
