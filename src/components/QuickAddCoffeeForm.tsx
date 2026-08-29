import { useState, type FormEvent } from 'react'
import ImageUploadField from './admin/ImageUploadField'
import { generateUniqueSlug } from '../data/migrate'
import { getAllCoffees, upsertCoffee } from '../data/repositories/coffeeRepository'
import type { Coffee } from '../data/schema'
import { CUP_CHARACTERS, type CupCharacter } from '../types'

const CHARACTER_LABEL: Record<CupCharacter, string> = {
  CLEAR: 'CLEAR · 맑고 깔끔한',
  VIVID: 'VIVID · 개성과 대비가 강한',
  JUICY: 'JUICY · 과즙같이 풍부한',
  CALM: 'CALM · 편안하고 부드러운',
  ELEGANT: 'ELEGANT · 우아하고 섬세한',
}

const EMPTY = {
  coffeeName: '',
  country: '',
  region: '',
  process: '',
  roastLevel: '',
  character: 'CLEAR' as CupCharacter,
  notes: '',
  heroImage: '',
}

export default function QuickAddCoffeeForm({ onClose, onCreated }: { onClose: () => void; onCreated: (coffee: Coffee) => void }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.coffeeName.trim() || !form.country.trim()) {
      setError('원두 이름과 원산지는 필수입니다.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const existingSlugs = new Set(getAllCoffees().map((c) => c.slug))
      const now = new Date().toISOString()
      const coffee: Coffee = {
        id: crypto.randomUUID(),
        slug: generateUniqueSlug(form.coffeeName, existingSlugs),
        coffeeName: form.coffeeName.trim(),
        country: form.country.trim(),
        region: form.region.trim(),
        producer: '',
        variety: '',
        process: form.process.trim(),
        altitude: '',
        roastLevel: form.roastLevel.trim(),
        character: form.character,
        notes: form.notes
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean),
        sensory: { acidity: 3, sweetness: 3, body: 3, finish: 3, flavor: 3, accessibility: 3 },
        createdAt: now,
        updatedAt: now,
        publishStatus: 'published',
        featured: false,
        sortOrder: 0,
        availability: 'available',
        brewGuideIds: [],
        profileVersion: 1,
        heroImage: form.heroImage || undefined,
      }
      await upsertCoffee(coffee)
      onCreated(coffee)
    } catch {
      setError('원두 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4 py-8" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-navy/15 bg-white p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">QUICK ADD</p>
            <h2 className="mt-1 text-[18px] font-bold text-navy">원두 추가</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[20px] text-navy/40 hover:text-navy" aria-label="닫기">
            ✕
          </button>
        </div>
        <p className="mt-2 text-[11px] text-navy/50">
          핵심 정보만 빠르게 등록합니다. 산지 상세, 센서리 수치 등 나머지 항목은 관리자 페이지에서 이어서 채울 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">원두 이름 *</span>
              <input
                value={form.coffeeName}
                onChange={(e) => set('coffeeName', e.target.value)}
                placeholder="예: ETHIOPIA Yirgacheffe Washed G1"
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">원산지 *</span>
              <input
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                placeholder="예: Ethiopia"
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">지역 (선택)</span>
              <input
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">가공 방식 (선택)</span>
              <input
                value={form.process}
                onChange={(e) => set('process', e.target.value)}
                placeholder="예: Natural"
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">로스팅 (선택)</span>
              <input
                value={form.roastLevel}
                onChange={(e) => set('roastLevel', e.target.value)}
                placeholder="예: Medium"
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">캐릭터</span>
              <select
                value={form.character}
                onChange={(e) => set('character', e.target.value as CupCharacter)}
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              >
                {CUP_CHARACTERS.map((c) => (
                  <option key={c} value={c}>
                    {CHARACTER_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">Flavor Notes (선택, 쉼표로 구분)</span>
            <input
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="예: Strawberry, Raspberry, Cane Sugar"
              className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <ImageUploadField label="대표 이미지 (선택)" value={form.heroImage} onChange={(url) => set('heroImage', url)} />

          {error && <p className="text-[11px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.1em] text-warm-white hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? '등록 중…' : '원두 등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
