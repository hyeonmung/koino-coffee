import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CharacterSelector from '../components/CharacterSelector'
import CoffeeForm from '../components/CoffeeForm'
import CoffeeList from '../components/CoffeeList'
import CoffeePreview from '../components/CoffeePreview'
import ExportControls from '../components/ExportControls'
import FlavorNoteInput from '../components/FlavorNoteInput'
import SensoryProfileInput from '../components/SensoryProfileInput'
import type { CoffeeDraft, CoffeeProfile } from '../types'
import { coffeesToCsv, csvToCoffees } from '../utils/csv'
import { downloadTextFile, slugifyFilename } from '../utils/download'
import { exportNodeAsPng } from '../utils/pngExport'
import { deleteCoffee, loadCoffees, saveCoffees, upsertCoffee } from '../utils/storage'
import { validateCoffeeDraft } from '../utils/validation'

const EMPTY_DRAFT: CoffeeDraft = {
  coffeeName: '',
  country: '',
  region: '',
  producer: '',
  variety: '',
  process: '',
  altitude: '',
  roastLevel: '',
  character: 'CLEAR',
  notes: [],
  sensory: {
    acidity: 3,
    sweetness: 3,
    body: 3,
    finish: 3,
    flavor: 3,
    accessibility: 3,
  },
}

type Banner = { type: 'success' | 'error'; text: string } | null

function draftFromCoffee(coffee: CoffeeProfile): CoffeeDraft {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...draft } = coffee
  return draft
}

export default function AdminPage() {
  const [coffees, setCoffees] = useState<CoffeeProfile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CoffeeDraft>(EMPTY_DRAFT)
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [banner, setBanner] = useState<Banner>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loaded = loadCoffees()
    setCoffees(loaded)
    if (loaded.length > 0) {
      setEditingId(loaded[0].id)
      setDraft(draftFromCoffee(loaded[0]))
    }
  }, [])

  useEffect(() => {
    if (!banner) return
    const t = setTimeout(() => setBanner(null), 3200)
    return () => clearTimeout(t)
  }, [banner])

  const patchDraft = (patch: Partial<CoffeeDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    if (patch.coffeeName !== undefined && patch.coffeeName.trim()) {
      setNameError(undefined)
    }
  }

  const handleNewCoffee = () => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setNameError(undefined)
  }

  const handleSelect = (id: string) => {
    const coffee = coffees.find((c) => c.id === id)
    if (!coffee) return
    setEditingId(id)
    setDraft(draftFromCoffee(coffee))
    setNameError(undefined)
  }

  const handleSave = () => {
    const errors = validateCoffeeDraft(draft)
    if (errors.length > 0) {
      const nameErr = errors.find((e) => e.field === 'coffeeName')
      setNameError(nameErr?.message)
      setBanner({ type: 'error', text: errors[0].message })
      return
    }

    const now = new Date().toISOString()
    const existing = editingId ? coffees.find((c) => c.id === editingId) : undefined
    const coffee: CoffeeProfile = {
      ...draft,
      id: existing?.id ?? crypto.randomUUID(),
      isSample: existing?.isSample,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    const next = upsertCoffee(coffees, coffee)
    setCoffees(next)
    setEditingId(coffee.id)
    setBanner({ type: 'success', text: '원두 프로파일이 저장되었습니다.' })
  }

  const handleDuplicate = (id: string) => {
    const coffee = coffees.find((c) => c.id === id)
    if (!coffee) return
    const now = new Date().toISOString()
    const copy: CoffeeProfile = {
      ...coffee,
      id: crypto.randomUUID(),
      coffeeName: `${coffee.coffeeName} (Copy)`,
      isSample: false,
      createdAt: now,
      updatedAt: now,
    }
    const next = upsertCoffee(coffees, copy)
    setCoffees(next)
    setEditingId(copy.id)
    setDraft(draftFromCoffee(copy))
    setBanner({ type: 'success', text: '원두가 복제되었습니다.' })
  }

  const handleDelete = (id: string) => {
    const coffee = coffees.find((c) => c.id === id)
    if (!coffee) return
    const next = deleteCoffee(coffees, id)
    setCoffees(next)
    if (editingId === id) {
      if (next.length > 0) {
        setEditingId(next[0].id)
        setDraft(draftFromCoffee(next[0]))
      } else {
        handleNewCoffee()
      }
    }
    setBanner({ type: 'success', text: '원두가 삭제되었습니다.' })
  }

  const slug = useMemo(() => slugifyFilename(draft.coffeeName), [draft.coffeeName])

  const handleExportChartPng = async () => {
    try {
      await exportNodeAsPng(chartRef.current, `${slug}-radar.png`, true)
    } catch {
      setBanner({ type: 'error', text: 'PNG 저장 중 오류가 발생했습니다.' })
    }
  }

  const handleExportCardPng = async () => {
    try {
      await exportNodeAsPng(cardRef.current, `${slug}-profile.png`, false)
    } catch {
      setBanner({ type: 'error', text: 'PNG 저장 중 오류가 발생했습니다.' })
    }
  }

  const handleExportJson = () => {
    downloadTextFile('koi-coffee-profiles.json', JSON.stringify(coffees, null, 2), 'application/json')
  }

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const list: unknown[] = Array.isArray(parsed) ? parsed : [parsed]
      const now = new Date().toISOString()
      const imported: CoffeeProfile[] = []
      for (const item of list) {
        if (typeof item !== 'object' || item === null) continue
        const record = item as Record<string, unknown>
        if (typeof record.coffeeName !== 'string' || !record.coffeeName.trim()) continue
        imported.push({
          id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
          coffeeName: record.coffeeName,
          country: typeof record.country === 'string' ? record.country : '',
          region: typeof record.region === 'string' ? record.region : '',
          producer: typeof record.producer === 'string' ? record.producer : '',
          variety: typeof record.variety === 'string' ? record.variety : '',
          process: typeof record.process === 'string' ? record.process : '',
          altitude: typeof record.altitude === 'string' ? record.altitude : '',
          roastLevel: typeof record.roastLevel === 'string' ? record.roastLevel : '',
          character: (['CLEAR', 'VIVID', 'JUICY', 'CALM', 'ELEGANT'].includes(record.character as string)
            ? record.character
            : 'CLEAR') as CoffeeProfile['character'],
          notes: Array.isArray(record.notes) ? (record.notes as string[]).slice(0, 6) : [],
          sensory: {
            acidity: clamp(record.sensory && (record.sensory as Record<string, unknown>).acidity),
            sweetness: clamp(record.sensory && (record.sensory as Record<string, unknown>).sweetness),
            body: clamp(record.sensory && (record.sensory as Record<string, unknown>).body),
            finish: clamp(record.sensory && (record.sensory as Record<string, unknown>).finish),
            flavor: clamp(record.sensory && (record.sensory as Record<string, unknown>).flavor),
            accessibility: clamp(record.sensory && (record.sensory as Record<string, unknown>).accessibility),
          },
          isSample: false,
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : now,
          updatedAt: now,
        })
      }
      if (imported.length === 0) {
        setBanner({ type: 'error', text: '가져올 수 있는 원두 데이터가 없습니다.' })
        return
      }
      const merged = [...coffees]
      for (const c of imported) {
        const idx = merged.findIndex((m) => m.id === c.id)
        if (idx === -1) merged.push(c)
        else merged[idx] = c
      }
      saveCoffees(merged)
      setCoffees(merged)
      setBanner({ type: 'success', text: `${imported.length}개 원두를 JSON에서 가져왔습니다.` })
    } catch {
      setBanner({ type: 'error', text: 'JSON 파일을 읽을 수 없습니다. 형식을 확인해 주세요.' })
    }
  }

  const handleExportCsv = () => {
    downloadTextFile('koi-coffee-profiles.csv', coffeesToCsv(coffees), 'text/csv')
  }

  const handleImportCsv = async (file: File) => {
    const text = await file.text()
    const { coffees: imported, errors } = csvToCoffees(text)
    if (imported.length > 0) {
      const next = [...coffees, ...imported]
      saveCoffees(next)
      setCoffees(next)
    }
    if (errors.length > 0) {
      setBanner({ type: 'error', text: `${imported.length}개 가져옴, ${errors.length}건 오류: ${errors[0]}` })
    } else if (imported.length > 0) {
      setBanner({ type: 'success', text: `${imported.length}개 원두를 CSV에서 가져왔습니다.` })
    } else {
      setBanner({ type: 'error', text: 'CSV에서 가져올 데이터가 없습니다.' })
    }
  }

  return (
    <div className="min-h-screen bg-warm-white pb-16">
      <header className="border-b border-navy/15 bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">KOINO COFFEE</p>
            <h1 className="mt-0.5 font-serif text-[20px] font-bold tracking-tight text-navy">
              KOINO SENSORY MAP
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="border border-navy/25 px-3.5 py-2 text-[12px] font-semibold tracking-wide text-navy/70 hover:border-navy hover:text-navy"
            >
              갤러리 보기
            </Link>
            <button
              type="button"
              onClick={handleNewCoffee}
              className="border border-navy px-3.5 py-2 text-[12px] font-semibold tracking-wide text-navy hover:bg-navy hover:text-warm-white"
            >
              + 새 원두
            </button>
          </div>
        </div>
      </header>

      {banner && (
        <div className="mx-auto mt-4 max-w-[1240px] px-6">
          <div
            className={`border px-4 py-2.5 text-[12px] ${
              banner.type === 'success'
                ? 'border-navy/20 bg-navy/5 text-navy'
                : 'border-red-300 bg-red-50 text-red-600'
            }`}
          >
            {banner.text}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1240px] px-6 pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left: input panel */}
          <div className="space-y-6">
            <section>
              <SectionHeader step={1} title="원두 정보" />
              <CoffeeForm coffee={draft} onChange={patchDraft} nameError={nameError} />
            </section>

            <section>
              <SectionHeader step={2} title="CUP CHARACTER" />
              <CharacterSelector value={draft.character} onChange={(character) => patchDraft({ character })} />
            </section>

            <section>
              <SectionHeader step={3} title="Flavor Notes" />
              <FlavorNoteInput notes={draft.notes} onChange={(notes) => patchDraft({ notes })} />
            </section>

            <section>
              <SectionHeader step={4} title="Sensory Profile" />
              <SensoryProfileInput sensory={draft.sensory} onChange={(sensory) => patchDraft({ sensory })} />
            </section>

            <section>
              <button
                type="button"
                onClick={handleSave}
                className="w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
              >
                {editingId ? '변경사항 저장' : '원두 저장'}
              </button>
            </section>

            <section>
              <SectionHeader title="저장된 원두" />
              <CoffeeList
                coffees={coffees}
                activeId={editingId}
                onSelect={handleSelect}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </section>
          </div>

          {/* Right: live preview */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section>
              <SectionHeader step={5} title="Live Preview" />
              <CoffeePreview coffee={draft} ref={cardRef} chartRef={chartRef} />
            </section>

            <section>
              <SectionHeader step={7} title="Export" />
              <ExportControls
                onExportChartPng={handleExportChartPng}
                onExportCardPng={handleExportCardPng}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onExportCsv={handleExportCsv}
                onImportCsv={handleImportCsv}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionHeader({ step, title }: { step?: number; title: string }) {
  return (
    <div className="mb-2.5 flex items-baseline gap-2 border-b border-navy/15 pb-1.5">
      {step !== undefined && (
        <span className="text-[10px] font-semibold tracking-[0.15em] text-accent">STEP {step}</span>
      )}
      <h2 className="text-[13px] font-bold tracking-wide text-navy">{title}</h2>
    </div>
  )
}

function clamp(value: unknown): 1 | 2 | 3 | 4 | 5 {
  const n = Number(value)
  const c = Math.min(5, Math.max(1, Number.isFinite(n) ? Math.round(n) : 3))
  return c as 1 | 2 | 3 | 4 | 5
}
