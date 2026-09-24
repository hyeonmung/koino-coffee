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
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title="커피 사전" description="향미, 센서리, 가공, 품종 등 궁금한 커피 단어를 검색해보세요." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[860px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">DICTIONARY</p>
        <h1 className="mt-1 text-[28px] font-bold text-ink">커피 사전</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="궁금한 커피 단어를 검색해보세요"
          className="mt-6 w-full border border-line/25 bg-surface px-4 py-3 text-[13px] text-ink outline-none placeholder:text-ink/35 focus:border-line"
        />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(['ALL', 'FLAVOR', 'SENSORY', 'PROCESS', 'VARIETY', 'GENERAL'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                category === c ? 'border-line bg-navy text-warm-white' : 'border-line/20 text-ink/55 hover:border-line/50'
              }`}
            >
              {c === 'ALL' ? '전체' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        {/* Alphabet / Hangul index navigation */}
        <div className="mt-5 border-y border-line/10 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIndexFilter(null)}
              className={`shrink-0 text-[12px] font-bold ${indexFilter === null ? 'text-ink' : 'text-ink/40 hover:text-ink'}`}
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
                      active ? 'bg-navy text-warm-white' : available ? 'text-ink/60 hover:text-ink' : 'text-ink/20'
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
                      active ? 'bg-navy text-warm-white' : available ? 'text-ink/60 hover:text-ink' : 'text-ink/20'
                    }`}
                  >
                    {cho}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-line/10 border-t border-line/15">
          {filtered.length === 0 && <p className="py-10 text-center text-[13px] text-ink/40">검색 결과가 없습니다.</p>}
          {filtered.map((entry) => (
            <Link key={entry.id} to={`/dictionary/${entry.id}`} className="block py-4 hover:bg-surface">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-[15px] font-bold text-ink">{entry.term}</p>
                {entry.termKo && <p className="text-[12px] text-ink/45">{entry.termKo}</p>}
                <span className="ml-auto text-[9px] font-semibold tracking-wide text-ink/35">
                  {CATEGORY_LABEL[entry.category]}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-[13px] text-ink/65">{entry.shortDefinition}</p>
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
