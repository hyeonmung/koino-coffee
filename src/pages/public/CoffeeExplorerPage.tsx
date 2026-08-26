import { useMemo, useState } from 'react'
import CoffeeCard from '../../components/CoffeeCard'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import { findDescriptorByNote } from '../../data/flavorMatch'
import { CUP_CHARACTERS, type CupCharacter } from '../../types'
import type { Availability } from '../../data/schema'

type FilterValue<T extends string> = 'ALL' | T

export default function CoffeeExplorerPage() {
  const allCoffees = useMemo(() => getPublishedCoffees(), [])
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const families = useMemo(() => getFlavorFamilies(), [])

  const [query, setQuery] = useState('')
  const [character, setCharacter] = useState<FilterValue<CupCharacter>>('ALL')
  const [country, setCountry] = useState<FilterValue<string>>('ALL')
  const [process, setProcess] = useState<FilterValue<string>>('ALL')
  const [roastType, setRoastType] = useState<FilterValue<string>>('ALL')
  const [flavorFamily, setFlavorFamily] = useState<FilterValue<string>>('ALL')
  const [availability, setAvailability] = useState<FilterValue<Availability>>('ALL')

  const countries = useMemo(
    () => Array.from(new Set(allCoffees.map((c) => c.country).filter(Boolean))).sort(),
    [allCoffees],
  )
  const processes = useMemo(
    () => Array.from(new Set(allCoffees.map((c) => c.process).filter(Boolean))).sort(),
    [allCoffees],
  )
  const roastTypes = useMemo(() => {
    const values = allCoffees.map((c) => c.roastType).filter((v): v is NonNullable<typeof v> => Boolean(v))
    return Array.from(new Set<string>(values)).sort()
  }, [allCoffees])

  const filtered = allCoffees.filter((c) => {
    if (character !== 'ALL' && c.character !== character) return false
    if (country !== 'ALL' && c.country !== country) return false
    if (process !== 'ALL' && c.process !== process) return false
    if (roastType !== 'ALL' && c.roastType !== roastType) return false
    if (availability !== 'ALL' && c.availability !== availability) return false
    if (flavorFamily !== 'ALL') {
      const matches = c.notes.some((note) => findDescriptorByNote(note, descriptors)?.familyId === flavorFamily)
      if (!matches) return false
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      const haystack = [c.coffeeName, c.country, c.region, c.producer, c.farmOrStation, c.variety, c.process, ...c.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const resetFilters = () => {
    setCharacter('ALL')
    setCountry('ALL')
    setProcess('ALL')
    setRoastType('ALL')
    setFlavorFamily('ALL')
    setAvailability('ALL')
    setQuery('')
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="Explore Coffee" description="산지, 향미, 프로세스로 코이노커피 원두를 탐색하세요." />
      <PublicHeader />

      <main className="mx-auto max-w-[1240px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COFFEE LIBRARY</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">EXPLORE COFFEE</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="원두, 산지, 플레이버를 검색하세요"
          className="mt-6 w-full border border-navy/25 bg-white px-4 py-3 text-[13px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
        />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <FilterGroup label="CHARACTER">
              <FilterButtons
                value={character}
                onChange={setCharacter}
                options={CUP_CHARACTERS.map((k) => ({ value: k, label: k }))}
              />
            </FilterGroup>

            <FilterGroup label="ORIGIN">
              <FilterButtons value={country} onChange={setCountry} options={countries.map((c) => ({ value: c, label: c }))} />
            </FilterGroup>

            <FilterGroup label="PROCESS">
              <FilterButtons value={process} onChange={setProcess} options={processes.map((p) => ({ value: p, label: p }))} />
            </FilterGroup>

            {roastTypes.length > 0 && (
              <FilterGroup label="ROAST">
                <FilterButtons
                  value={roastType}
                  onChange={setRoastType}
                  options={roastTypes.map((r) => ({ value: r, label: r }))}
                />
              </FilterGroup>
            )}

            <FilterGroup label="FLAVOR FAMILY">
              <FilterButtons
                value={flavorFamily}
                onChange={setFlavorFamily}
                options={families.map((f) => ({ value: f.id, label: f.name }))}
              />
            </FilterGroup>

            <FilterGroup label="AVAILABILITY">
              <FilterButtons
                value={availability}
                onChange={setAvailability}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'limited', label: 'Limited' },
                  { value: 'archive', label: 'Past Coffees' },
                ]}
              />
            </FilterGroup>

            <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-navy/45 hover:text-navy">
              필터 초기화
            </button>
          </aside>

          <div>
            <p className="mb-4 text-[12px] text-navy/45">{filtered.length}종의 원두</p>
            {filtered.length === 0 ? (
              <div className="border border-navy/15 bg-white px-6 py-16 text-center">
                <p className="text-[13px] text-navy/50">조건에 맞는 원두가 없습니다.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 border border-navy px-4 py-2 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((coffee) => (
                  <CoffeeCard key={coffee.id} coffee={coffee} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">{label}</p>
      {children}
    </div>
  )
}

function FilterButtons<T extends string>({
  value,
  onChange,
  options,
}: {
  value: FilterValue<T>
  onChange: (v: FilterValue<T>) => void
  options: { value: T; label: string }[]
}) {
  if (options.length === 0) {
    return <p className="text-[11px] text-navy/35">해당 항목 없음</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange('ALL')}
        className={`border px-2 py-1 text-[10px] font-semibold tracking-wide ${
          value === 'ALL' ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
        }`}
      >
        ALL
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`border px-2 py-1 text-[10px] font-semibold tracking-wide ${
            value === opt.value ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
