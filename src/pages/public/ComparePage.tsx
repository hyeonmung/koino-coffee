import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlavorNotes from '../../components/FlavorNotes'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import RadarOverlayChart, { COMPARE_COLORS } from '../../components/RadarOverlayChart'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'

const MAX_COMPARE = 3

export default function ComparePage() {
  const coffees = useMemo(() => getPublishedCoffees(), [])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const selected = selectedIds.map((id) => coffees.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c))

  const candidates = coffees
    .filter((c) => !selectedIds.includes(c.id))
    .filter((c) => !query.trim() || c.coffeeName.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8)

  const addCoffee = (id: string) => {
    if (selectedIds.length >= MAX_COMPARE) return
    setSelectedIds((prev) => [...prev, id])
    setQuery('')
  }

  const removeCoffee = (id: string) => setSelectedIds((prev) => prev.filter((x) => x !== id))

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="원두 비교" description="최대 3개의 원두를 나란히 비교해보세요." />
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COMPARE</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">원두 비교하기</h1>
        <p className="mt-2 text-[13px] text-navy/55">최대 {MAX_COMPARE}개의 원두를 선택해 비교할 수 있습니다.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {selected.map((coffee, i) => (
            <span
              key={coffee.id}
              className="flex items-center gap-2 border px-3 py-1.5 text-[12px] font-semibold text-navy"
              style={{ borderColor: COMPARE_COLORS[i] }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i] }} />
              {coffee.coffeeName}
              <button type="button" onClick={() => removeCoffee(coffee.id)} className="text-navy/40 hover:text-navy">
                ×
              </button>
            </span>
          ))}
        </div>

        {selectedIds.length < MAX_COMPARE && (
          <div className="relative mt-3 max-w-[360px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="비교할 원두 검색 후 선택"
              className="w-full border border-navy/25 bg-white px-3 py-2 text-[12px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
            />
            {query && candidates.length > 0 && (
              <div className="absolute z-10 mt-1 w-full border border-navy/15 bg-white shadow-md">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => addCoffee(c.id)}
                    className="block w-full px-3 py-2 text-left text-[12px] text-navy hover:bg-warm-white"
                  >
                    {c.coffeeName} <span className="text-navy/40">· {c.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selected.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            비교할 원두를 검색해서 추가해보세요.
          </p>
        ) : (
          <>
            <div className="mt-10 flex justify-center">
              <RadarOverlayChart
                series={selected.map((c, i) => ({ label: c.coffeeName, sensory: c.sensory, color: COMPARE_COLORS[i] }))}
              />
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-[12px]">
                <tbody>
                  <CompareRow label="컵 캐릭터" cells={selected.map((c) => CHARACTER_INFO[c.character].label)} />
                  <CompareRow label="산지" cells={selected.map((c) => c.country || '-')} />
                  <CompareRow label="가공 방식" cells={selected.map((c) => c.process || '-')} />
                  <CompareRow label="품종" cells={selected.map((c) => c.variety || '-')} />
                  <CompareRow
                    label="플레이버 노트"
                    cells={selected.map((c) =>
                      c.notes.length > 0 ? <FlavorNotes notes={c.notes} character={c.character} /> : '-',
                    )}
                  />
                  {SENSORY_FIELDS.map((field) => (
                    <CompareRow
                      key={field.key}
                      label={field.labelKo}
                      cells={selected.map((c) => String(c.sensory[field.key]))}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selected.map((c) => (
                <Link
                  key={c.id}
                  to={`/coffees/${c.slug}`}
                  className="border border-navy/25 px-3 py-1.5 text-[11px] font-semibold text-navy/60 hover:border-navy hover:text-navy"
                >
                  {c.coffeeName} 상세보기 →
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

function CompareRow({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr className="border-b border-navy/10">
      <th className="w-[120px] py-2 pr-3 text-left text-[10px] font-semibold tracking-wide text-navy/45">{label}</th>
      {cells.map((cell, i) => (
        <td key={i} className="py-2 pr-4 text-navy">
          {cell}
        </td>
      ))}
    </tr>
  )
}
