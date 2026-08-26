import { useEffect, useMemo, useState } from 'react'
import { CHARACTER_INFO } from '../constants/characters'
import { CUP_CHARACTERS, type CoffeeProfile, type CupCharacter } from '../types'

interface CoffeeListProps {
  coffees: CoffeeProfile[]
  activeId: string | null
  onSelect: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

type SortMode = 'name' | 'recent'
type FilterMode = 'ALL' | CupCharacter

export default function CoffeeList({ coffees, activeId, onSelect, onDuplicate, onDelete }: CoffeeListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterMode>('ALL')
  const [sort, setSort] = useState<SortMode>('recent')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    if (!confirmingId) return
    const t = setTimeout(() => setConfirmingId(null), 4000)
    return () => clearTimeout(t)
  }, [confirmingId])

  const filtered = useMemo(() => {
    let list = coffees
    if (filter !== 'ALL') {
      list = list.filter((c) => c.character === filter)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.coffeeName.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.notes.some((n) => n.toLowerCase().includes(q)),
      )
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === 'name') return a.coffeeName.localeCompare(b.coffeeName)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return sorted
  }, [coffees, filter, query, sort])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름, 국가, 노트로 검색"
          className="min-w-[160px] flex-1 border border-navy/25 bg-white px-2.5 py-1.5 text-[12px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="border border-navy/25 bg-white px-2 py-1.5 text-[11px] text-navy outline-none"
        >
          <option value="recent">최근 수정순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(['ALL', ...CUP_CHARACTERS] as FilterMode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`border px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors ${
              filter === key
                ? 'border-navy bg-navy text-warm-white'
                : 'border-navy/25 text-navy/60 hover:border-navy/50'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-[12px] text-navy/40">저장된 원두가 없습니다.</p>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex cursor-pointer items-center justify-between border px-3 py-2 transition-colors ${
              c.id === activeId ? 'border-navy bg-navy/5' : 'border-navy/15 hover:border-navy/40'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[12.5px] font-semibold text-navy">{c.coffeeName}</p>
                {c.isSample && (
                  <span className="shrink-0 border border-accent/60 bg-accent/15 px-1 text-[9px] font-semibold text-navy/70">
                    SAMPLE
                  </span>
                )}
              </div>
              <p className="truncate text-[10.5px] text-navy/50">
                {CHARACTER_INFO[c.character].label} · {c.country || '-'} {c.region ? `· ${c.region}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              {confirmingId === c.id ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmingId(null)
                      onDelete(c.id)
                    }}
                    className="border border-red-400 bg-red-500 px-1.5 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                  >
                    정말 삭제
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmingId(null)
                    }}
                    className="border border-navy/20 px-1.5 py-1 text-[10px] text-navy/60 hover:border-navy/50 hover:text-navy"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(c.id)
                    }}
                    title="복제"
                    className="border border-navy/20 px-1.5 py-1 text-[10px] text-navy/60 hover:border-navy/50 hover:text-navy"
                  >
                    복제
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmingId(c.id)
                    }}
                    title="삭제"
                    className="border border-navy/20 px-1.5 py-1 text-[10px] text-navy/60 hover:border-red-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
