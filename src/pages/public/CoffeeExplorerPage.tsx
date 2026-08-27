import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
type FilterKey = 'character' | 'country' | 'process' | 'roastType' | 'flavorFamily' | 'availability'

const PROCESS_LABEL_KO: Record<string, string> = {
  washed: '워시드 · Washed',
  natural: '내추럴 · Natural',
  honey: '허니 · Honey',
  anaerobic: '무산소 · Anaerobic',
  experimental: '실험가공 · Experimental',
  'pulped natural': '펄프드 내추럴 · Pulped Natural',
  'semi-washed': '세미워시드 · Semi-washed',
  'wet hulled': '웨트헐드 · Wet Hulled',
}

const ROAST_LABEL_KO: Record<string, string> = {
  Filter: '필터 · Filter',
  Espresso: '에스프레소 · Espresso',
  Omni: '옴니 · Omni',
}

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'archive', label: '지난 커피' },
]

export default function CoffeeExplorerPage() {
  const allCoffees = useMemo(() => getPublishedCoffees(), [])
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const families = useMemo(() => getFlavorFamilies(), [])
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const [character, setCharacter] = useState<FilterValue<CupCharacter>>('ALL')
  const [country, setCountry] = useState<FilterValue<string>>('ALL')
  const [process, setProcess] = useState<FilterValue<string>>('ALL')
  const [roastType, setRoastType] = useState<FilterValue<string>>('ALL')
  const [flavorFamily, setFlavorFamily] = useState<FilterValue<string>>('ALL')
  const [availability, setAvailability] = useState<FilterValue<Availability>>('ALL')
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

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
  }

  const hasActiveFilter =
    character !== 'ALL' || country !== 'ALL' || process !== 'ALL' || roastType !== 'ALL' || flavorFamily !== 'ALL' || availability !== 'ALL'

  const activeChips: { key: FilterKey; group: string; label: string; clear: () => void }[] = []
  if (character !== 'ALL') activeChips.push({ key: 'character', group: '캐릭터', label: character, clear: () => setCharacter('ALL') })
  if (country !== 'ALL') activeChips.push({ key: 'country', group: '산지', label: country, clear: () => setCountry('ALL') })
  if (process !== 'ALL')
    activeChips.push({
      key: 'process',
      group: '가공',
      label: PROCESS_LABEL_KO[process.toLowerCase()]?.split(' · ')[0] ?? process,
      clear: () => setProcess('ALL'),
    })
  if (roastType !== 'ALL')
    activeChips.push({
      key: 'roastType',
      group: '로스팅',
      label: ROAST_LABEL_KO[roastType]?.split(' · ')[0] ?? roastType,
      clear: () => setRoastType('ALL'),
    })
  if (flavorFamily !== 'ALL')
    activeChips.push({
      key: 'flavorFamily',
      group: '향미',
      label: families.find((f) => f.id === flavorFamily)?.nameKo ?? families.find((f) => f.id === flavorFamily)?.name ?? '',
      clear: () => setFlavorFamily('ALL'),
    })
  if (availability !== 'ALL')
    activeChips.push({
      key: 'availability',
      group: '판매 상태',
      label: AVAILABILITY_OPTIONS.find((o) => o.value === availability)?.label ?? availability,
      clear: () => setAvailability('ALL'),
    })

  const toggle = (key: FilterKey) => setOpenFilter((prev) => (prev === key ? null : key))

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="원두" description="산지, 향미, 프로세스로 코이노커피 원두를 탐색하세요." />
      <PublicHeader />

      <main className="flex-1 mx-auto max-w-[1240px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COFFEE LIBRARY</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">원두</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="원두, 산지, 플레이버를 검색하세요"
          className="mt-6 w-full border border-navy/25 bg-white px-4 py-3 text-[13px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
        />

        {/* Desktop — Editorial Filter Bar */}
        <div className="relative mt-6 hidden border-b border-navy/15 lg:block">
          <div className="flex items-center gap-7">
            <button
              type="button"
              onClick={resetFilters}
              className={`border-b-2 pb-3 text-[13px] font-semibold tracking-wide transition-colors ${
                !hasActiveFilter ? 'border-navy text-navy' : 'border-transparent text-navy/50 hover:text-navy'
              }`}
            >
              전체
            </button>
            <FilterDropdown
              label="캐릭터"
              open={openFilter === 'character'}
              onToggle={() => toggle('character')}
              active={character !== 'ALL'}
              options={CUP_CHARACTERS.map((k) => ({ value: k, label: k }))}
              value={character}
              onChange={(v) => {
                setCharacter(v)
                setOpenFilter(null)
              }}
            />
            <FilterDropdown
              label="산지"
              open={openFilter === 'country'}
              onToggle={() => toggle('country')}
              active={country !== 'ALL'}
              options={countries.map((c) => ({ value: c, label: c }))}
              value={country}
              onChange={(v) => {
                setCountry(v)
                setOpenFilter(null)
              }}
            />
            <FilterDropdown
              label="가공"
              open={openFilter === 'process'}
              onToggle={() => toggle('process')}
              active={process !== 'ALL'}
              options={processes.map((p) => ({ value: p, label: PROCESS_LABEL_KO[p.toLowerCase()] ?? p }))}
              value={process}
              onChange={(v) => {
                setProcess(v)
                setOpenFilter(null)
              }}
            />
            {roastTypes.length > 0 && (
              <FilterDropdown
                label="로스팅"
                open={openFilter === 'roastType'}
                onToggle={() => toggle('roastType')}
                active={roastType !== 'ALL'}
                options={roastTypes.map((r) => ({ value: r, label: ROAST_LABEL_KO[r] ?? r }))}
                value={roastType}
                onChange={(v) => {
                  setRoastType(v)
                  setOpenFilter(null)
                }}
              />
            )}
            <FilterDropdown
              label="향미"
              open={openFilter === 'flavorFamily'}
              onToggle={() => toggle('flavorFamily')}
              active={flavorFamily !== 'ALL'}
              options={families.map((f) => ({ value: f.id, label: f.nameKo ?? f.name }))}
              value={flavorFamily}
              onChange={(v) => {
                setFlavorFamily(v)
                setOpenFilter(null)
              }}
            />
            <FilterDropdown
              label="판매 상태"
              open={openFilter === 'availability'}
              onToggle={() => toggle('availability')}
              active={availability !== 'ALL'}
              options={AVAILABILITY_OPTIONS}
              value={availability}
              onChange={(v) => {
                setAvailability(v)
                setOpenFilter(null)
              }}
            />
          </div>
          {openFilter && <div className="fixed inset-0 z-10" onClick={() => setOpenFilter(null)} />}
        </div>

        {/* Mobile — single Filter button opening a bottom sheet */}
        <div className="mt-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 border border-navy/25 px-4 py-2.5 text-[12px] font-semibold text-navy"
          >
            필터 {hasActiveFilter && <span className="text-accent">· {activeChips.length}</span>}
          </button>
        </div>

        {/* Active filter chips (desktop + mobile) */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="border border-navy/25 px-2.5 py-1 text-[11px] text-navy/70 hover:border-navy hover:text-navy"
              >
                <span className="text-navy/40">{chip.group}</span> {chip.label} <span className="ml-0.5">×</span>
              </button>
            ))}
            <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-navy/45 hover:text-navy">
              필터 초기화
            </button>
          </div>
        )}

        <div className="mt-8">
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
      </main>

      <PublicFooter />

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto bg-warm-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[18px] font-bold text-navy">필터</h2>
              <button type="button" onClick={() => setMobileOpen(false)} className="text-[13px] text-navy/50" aria-label="필터 닫기">
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-6">
              <MobileFilterGroup label="캐릭터">
                <FilterPills value={character} onChange={setCharacter} options={CUP_CHARACTERS.map((k) => ({ value: k, label: k }))} />
              </MobileFilterGroup>
              <MobileFilterGroup label="산지">
                <FilterPills value={country} onChange={setCountry} options={countries.map((c) => ({ value: c, label: c }))} />
              </MobileFilterGroup>
              <MobileFilterGroup label="가공">
                <FilterPills
                  value={process}
                  onChange={setProcess}
                  options={processes.map((p) => ({ value: p, label: PROCESS_LABEL_KO[p.toLowerCase()]?.split(' · ')[0] ?? p }))}
                />
              </MobileFilterGroup>
              {roastTypes.length > 0 && (
                <MobileFilterGroup label="로스팅">
                  <FilterPills
                    value={roastType}
                    onChange={setRoastType}
                    options={roastTypes.map((r) => ({ value: r, label: ROAST_LABEL_KO[r]?.split(' · ')[0] ?? r }))}
                  />
                </MobileFilterGroup>
              )}
              <MobileFilterGroup label="향미">
                <FilterPills
                  value={flavorFamily}
                  onChange={setFlavorFamily}
                  options={families.map((f) => ({ value: f.id, label: f.nameKo ?? f.name }))}
                />
              </MobileFilterGroup>
              <MobileFilterGroup label="판매 상태">
                <FilterPills value={availability} onChange={setAvailability} options={AVAILABILITY_OPTIONS} />
              </MobileFilterGroup>
            </div>

            <div className="mt-6 flex gap-2 border-t border-navy/10 pt-5">
              <button type="button" onClick={resetFilters} className="flex-1 border border-navy/25 py-2.5 text-[12px] font-semibold text-navy/60">
                필터 초기화
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex-1 border border-navy bg-navy py-2.5 text-[12px] font-semibold text-warm-white"
              >
                {filtered.length}종의 원두 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  open,
  onToggle,
  active,
}: {
  label: string
  value: FilterValue<T>
  options: { value: T; label: string }[]
  onChange: (v: FilterValue<T>) => void
  open: boolean
  onToggle: () => void
  active: boolean
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`border-b-2 pb-3 text-[13px] font-semibold tracking-wide transition-colors ${
          open || active ? 'border-navy text-navy' : 'border-transparent text-navy/50 hover:text-navy'
        }`}
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 min-w-[200px] border border-navy/15 bg-white py-2 shadow-sm">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-navy/35">해당 항목 없음</p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onChange('ALL')}
                className={`block w-full px-3 py-1.5 text-left text-[12px] ${
                  value === 'ALL' ? 'font-semibold text-navy' : 'text-navy/55 hover:text-navy'
                }`}
              >
                전체
              </button>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={`block w-full px-3 py-1.5 text-left text-[12px] ${
                    value === opt.value ? 'font-semibold text-navy' : 'text-navy/55 hover:text-navy'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MobileFilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">{label}</p>
      {children}
    </div>
  )
}

function FilterPills<T extends string>({
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
        className={`border px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
          value === 'ALL' ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55'
        }`}
      >
        전체
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`border px-2.5 py-1.5 text-[11px] font-semibold tracking-wide ${
            value === opt.value ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
