import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getAllDictionaryTerms } from '../../data/repositories/dictionaryRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import type { DictionaryCategory } from '../../data/schema'
import { getHangulInitial, getLatinInitial, HANGUL_INDEX } from '../../utils/hangul'

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

const LATIN_INDEX = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

type IndexFilter = { type: 'EN' | 'KO'; value: string } | null

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'ALL' | DictionaryCategory>('ALL')
  const [indexFilter, setIndexFilter] = useState<IndexFilter>(null)

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

  const byCategory = entries.filter((e) => category === 'ALL' || e.category === category)

  const availableLatin = new Set(byCategory.map((e) => getLatinInitial(e.term)).filter(Boolean))
  const availableHangul = new Set(byCategory.map((e) => (e.termKo ? getHangulInitial(e.termKo) : null)).filter(Boolean))

  const filtered = byCategory
    .filter((e) => {
      if (!indexFilter) return true
      if (indexFilter.type === 'EN') return getLatinInitial(e.term) === indexFilter.value
      return e.termKo ? getHangulInitial(e.termKo) === indexFilter.value : false
    })
    .filter(
      (e) =>
        !query.trim() ||
        e.term.toLowerCase().includes(query.trim().toLowerCase()) ||
        (e.termKo ?? '').includes(query.trim()),
    )

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="커피 사전" description="향미, 센서리, 가공, 품종 등 궁금한 커피 단어를 검색해보세요." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[860px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">DICTIONARY</p>
        <h1 className="mt-1 text-[28px] font-bold text-navy">커피 사전</h1>

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

        {/* Alphabet / Hangul index navigation */}
        <div className="mt-5 border-y border-navy/10 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIndexFilter(null)}
              className={`shrink-0 text-[12px] font-bold ${indexFilter === null ? 'text-navy' : 'text-navy/40 hover:text-navy'}`}
            >
              전체
            </button>
            <div className="flex gap-1 overflow-x-auto">
              {LATIN_INDEX.map((letter) => {
                const active = indexFilter?.type === 'EN' && indexFilter.value === letter
                const available = availableLatin.has(letter)
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!available}
                    onClick={() => setIndexFilter({ type: 'EN', value: letter })}
                    className={`h-6 w-6 shrink-0 text-[11px] font-semibold ${
                      active ? 'bg-navy text-warm-white' : available ? 'text-navy/60 hover:text-navy' : 'text-navy/20'
                    }`}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="w-[26px] shrink-0" />
            <div className="flex gap-1 overflow-x-auto">
              {HANGUL_INDEX.map((cho) => {
                const active = indexFilter?.type === 'KO' && indexFilter.value === cho
                const available = availableHangul.has(cho)
                return (
                  <button
                    key={cho}
                    type="button"
                    disabled={!available}
                    onClick={() => setIndexFilter({ type: 'KO', value: cho })}
                    className={`h-6 w-6 shrink-0 text-[12px] font-semibold ${
                      active ? 'bg-navy text-warm-white' : available ? 'text-navy/60 hover:text-navy' : 'text-navy/20'
                    }`}
                  >
                    {cho}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-navy/10 border-t border-navy/15">
          {filtered.length === 0 && <p className="py-10 text-center text-[13px] text-navy/40">검색 결과가 없습니다.</p>}
          {filtered.map((entry) => (
            <Link key={entry.id} to={`/dictionary/${entry.id}`} className="block py-4 hover:bg-white">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-[15px] font-bold text-navy">{entry.term}</p>
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
