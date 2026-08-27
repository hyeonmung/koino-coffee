import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllBrewCategories } from '../../data/repositories/brewCategoryRepository'
import { brewGuideSlugExists, getBrewGuideById, upsertBrewGuide } from '../../data/repositories/brewGuideRepository'
import type { BrewGuide, BrewPourStep, PublishStatus } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

function emptyGuide(): BrewGuide {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'draft',
    equipment: 'V60',
    title: '',
    coffeeDose: '',
    water: '',
    ratio: '',
    temperature: '',
    grind: '',
    totalTime: '',
    pourSteps: [],
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminBrewGuideEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const categories = getAllBrewCategories()
  const [draft, setDraft] = useState<BrewGuide>(() => (isNew ? emptyGuide() : getBrewGuideById(id!) ?? emptyGuide()))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  // /new and /:id render the same component without remounting, so a fresh "new"
  // screen opened right after editing another guide would otherwise keep showing
  // that guide's data. Reset explicitly whenever the route's id changes.
  useEffect(() => {
    setDraft(isNew ? emptyGuide() : (getBrewGuideById(id!) ?? emptyGuide()))
    setSlugTouched(!isNew)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<BrewGuide>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p }
      if (!slugTouched && p.title !== undefined) next.slug = slugifyFilename(p.title)
      return next
    })
  }

  const updateStep = (index: number, patchStep: Partial<BrewPourStep>) => {
    const steps = draft.pourSteps.map((s, i) => (i === index ? { ...s, ...patchStep } : s))
    patch({ pourSteps: steps })
  }

  const addStep = () => patch({ pourSteps: [...draft.pourSteps, { label: '', water: '', time: '' }] })
  const removeStep = (index: number) => patch({ pourSteps: draft.pourSteps.filter((_, i) => i !== index) })

  const handleSave = () => {
    if (!draft.title.trim() || !draft.slug.trim()) {
      setError('Title과 Slug는 필수입니다.')
      return
    }
    if (brewGuideSlugExists(draft.slug.trim(), draft.id)) {
      setError('이미 사용 중인 slug입니다.')
      return
    }
    setError(null)
    const next = { ...draft, slug: draft.slug.trim(), updatedAt: new Date().toISOString() }
    upsertBrewGuide(next)
    setDraft(next)
    if (isNew) navigate(`/admin/brew-guides/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <Link to="/admin/brew-guides" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 브루 가이드 목록
      </Link>
      <h1 className="mt-1 font-serif text-[22px] font-bold text-navy">{isNew ? '새 브루 가이드' : draft.title}</h1>

      {error && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      <div className="mt-6 max-w-[560px] space-y-4">
        <Field label="카테고리">
          <select
            value={draft.categoryId ?? ''}
            onChange={(e) => patch({ categoryId: e.target.value || undefined })}
            className={inputClass}
          >
            <option value="">선택 안 함</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Link to="/admin/brew-guides/categories" className="mt-1 inline-block text-[11px] text-navy/40 hover:text-navy">
            카테고리 관리 →
          </Link>
        </Field>
        <Field label="장비 (Equipment)">
          <select value={draft.equipment} onChange={(e) => patch({ equipment: e.target.value })} className={inputClass}>
            {['V60', 'Origami', 'Kalita', 'Aeropress', 'Espresso', 'French Press', 'Cold Brew'].map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </Field>
        <Field label="제목">
          <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Slug (URL)">
          <input
            value={draft.slug}
            onChange={(e) => {
              setSlugTouched(true)
              patch({ slug: e.target.value })
            }}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="원두량 (Coffee Dose)">
            <input value={draft.coffeeDose} onChange={(e) => patch({ coffeeDose: e.target.value })} className={inputClass} />
          </Field>
          <Field label="물 (Water)">
            <input value={draft.water} onChange={(e) => patch({ water: e.target.value })} className={inputClass} />
          </Field>
          <Field label="비율 (Ratio)">
            <input value={draft.ratio} onChange={(e) => patch({ ratio: e.target.value })} className={inputClass} />
          </Field>
          <Field label="물 온도 (Temperature)">
            <input value={draft.temperature} onChange={(e) => patch({ temperature: e.target.value })} className={inputClass} />
          </Field>
          <Field label="분쇄도 (Grind)">
            <input value={draft.grind} onChange={(e) => patch({ grind: e.target.value })} className={inputClass} />
          </Field>
          <Field label="총 추출 시간 (Total Time)">
            <input value={draft.totalTime} onChange={(e) => patch({ totalTime: e.target.value })} className={inputClass} />
          </Field>
        </div>

        <div>
          <span className="mb-2 block text-[10px] font-semibold text-navy/60">추출 순서 (Pour Steps)</span>
          <div className="space-y-2">
            {draft.pourSteps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={step.label}
                  onChange={(e) => updateStep(i, { label: e.target.value })}
                  className={inputClass}
                  placeholder="Bloom"
                />
                <input
                  value={step.water}
                  onChange={(e) => updateStep(i, { water: e.target.value })}
                  className={inputClass}
                  placeholder="60g"
                />
                <input
                  value={step.time}
                  onChange={(e) => updateStep(i, { time: e.target.value })}
                  className={inputClass}
                  placeholder="0:00"
                />
                <button type="button" onClick={() => removeStep(i)} className="shrink-0 text-navy/40 hover:text-red-500">
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="mt-2 text-[11px] font-semibold text-navy/50 hover:text-navy">
            + Pour Step 추가
          </button>
        </div>

        <Field label="이렇게 추출해보세요 (Tips)">
          <textarea value={draft.tips ?? ''} onChange={(e) => patch({ tips: e.target.value })} className={`${inputClass} min-h-[70px]`} />
        </Field>
        <Field label="이런 맛이 난다면 (Common Problems)">
          <textarea
            value={draft.commonProblems ?? ''}
            onChange={(e) => patch({ commonProblems: e.target.value })}
            className={`${inputClass} min-h-[70px]`}
          />
        </Field>
        <Field label="상태">
          <select
            value={draft.publishStatus}
            onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })}
            className={inputClass}
          >
            <option value="draft">초안</option>
            <option value="published">공개</option>
            <option value="archived">보관</option>
          </select>
        </Field>

        <button
          type="button"
          onClick={handleSave}
          className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
        >
          저장
        </button>
      </div>
    </AdminLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}
