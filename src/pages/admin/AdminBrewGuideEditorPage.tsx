import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllBrewCategories } from '../../data/repositories/brewCategoryRepository'
import { brewGuideSlugExists, getBrewGuideById, upsertBrewGuide } from '../../data/repositories/brewGuideRepository'
import type { BrewGuide, BrewPourStep, PublishStatus, RecipeSourceAttribution, RecipeSourceType, RecipeVerificationStatus } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass =
  'w-full border border-line/25 bg-surface px-2.5 py-2 text-[13px] text-ink outline-none placeholder:text-ink/30 focus:border-line'

const EQUIPMENT_OPTIONS = [
  'V60',
  'Kalita Wave',
  'Origami',
  'Orea',
  'Chemex',
  'April',
  'Hario Switch',
  'Aeropress',
  'Espresso',
  'French Press',
  'Cold Brew',
]

/** Presets mirroring how open-source recipe sites commonly bucket these — keeps admin input consistent for filtering. */
const COMPETITION_TYPE_PRESETS = ['대회 우승 레시피', '로스터리 공식', '제작사 공식', '바리스타 공개 레시피', '커뮤니티']

const SOURCE_TYPE_LABEL: Record<RecipeSourceType, string> = {
  official_website: '본인/브랜드 공식 홈페이지',
  official_youtube: '본인/브랜드 공식 유튜브',
  official_instagram: '본인 공식 SNS',
  official_competition: '공식 대회·기관 자료 (WBC/WBrC/SCA)',
  official_interview: '공식 인터뷰',
  other: '기타 (2·3순위 — 재검증 필요)',
}

const VERIFICATION_STATUS_LABEL: Record<RecipeVerificationStatus, string> = {
  VERIFIED: 'VERIFIED — 1순위 출처로 확인 완료',
  SOURCE_NOT_VERIFIED: 'SOURCE_NOT_VERIFIED — 공식 출처 못 찾음',
  CONFLICTING_SOURCE: 'CONFLICTING_SOURCE — 출처마다 수치가 다름',
  NEEDS_MANUAL_REVIEW: 'NEEDS_MANUAL_REVIEW — 재검증 필요',
}

function emptyAttribution(): RecipeSourceAttribution {
  return { creator: '', title: '', url: '', type: 'other', verified: false }
}

function emptyGuide(): BrewGuide {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'published',
    equipment: 'V60',
    title: '',
    coffeeDose: '',
    water: '',
    ratio: '',
    temperature: '',
    grind: '',
    totalTime: '',
    pourSteps: [],
    source: 'KOI',
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

  const patchAttribution = (p: Partial<RecipeSourceAttribution>) => {
    patch({ attribution: { ...(draft.attribution ?? emptyAttribution()), ...p } })
  }

  const handleSave = async () => {
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
    await upsertBrewGuide(next)
    setDraft(next)
    if (isNew) navigate(`/admin/brew-guides/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <Link to="/admin/brew-guides" className="text-[11px] font-semibold text-ink/45 hover:text-ink">
        ← 브루잉 레시피 목록
      </Link>
      <h1 className="mt-1 font-serif text-[22px] font-bold text-ink">{isNew ? '새 브루잉 레시피' : draft.title}</h1>

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
          <Link to="/admin/brew-guides/categories" className="mt-1 inline-block text-[11px] text-ink/40 hover:text-ink">
            카테고리 관리 →
          </Link>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="장비 (Equipment)">
            <select value={draft.equipment} onChange={(e) => patch({ equipment: e.target.value })} className={inputClass}>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </Field>
          <Field label="서빙 스타일">
            <select
              value={draft.servingStyle ?? ''}
              onChange={(e) => patch({ servingStyle: (e.target.value || undefined) as BrewGuide['servingStyle'] })}
              className={inputClass}
            >
              <option value="">미지정</option>
              <option value="HOT">따뜻하게</option>
              <option value="ICED">아이스</option>
            </select>
          </Field>
          <Field label="평점 (0~10)">
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={draft.rating ?? ''}
              onChange={(e) => patch({ rating: e.target.value === '' ? undefined : Number(e.target.value) })}
              placeholder="미지정"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="제목">
          <textarea rows={1} value={draft.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
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
          <span className="mb-2 block text-[10px] font-semibold text-ink/60">추출 순서 (Pour Steps)</span>
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
                <button type="button" onClick={() => removeStep(i)} className="shrink-0 text-ink/40 hover:text-red-500">
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="mt-2 text-[11px] font-semibold text-ink/50 hover:text-ink">
            + Pour Step 추가
          </button>
        </div>

        <Field label="이렇게 추출해보세요 (Tips)">
          <textarea value={draft.tips ?? ''} onChange={(e) => patch({ tips: e.target.value })} className={`${inputClass} min-h-[70px]`} />
        </Field>

        <Field label="레시피 출처">
          <select value={draft.source} onChange={(e) => patch({ source: e.target.value as BrewGuide['source'] })} className={inputClass}>
            <option value="KOI">코이 레시피 (직접 작성)</option>
            <option value="OPEN">오픈 레시피 (본인이 공개한 레시피, 출처 표기)</option>
          </select>
        </Field>

        {draft.source === 'OPEN' && (
          <div className="grid grid-cols-2 gap-3 border border-line/15 bg-line/[0.02] p-3">
            <Field label="대회 · 분류">
              <select
                value={COMPETITION_TYPE_PRESETS.includes(draft.competitionType ?? '') ? draft.competitionType : '직접입력'}
                onChange={(e) => patch({ competitionType: e.target.value === '직접입력' ? '' : e.target.value })}
                className={inputClass}
              >
                {COMPETITION_TYPE_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="직접입력">직접입력</option>
              </select>
              {!COMPETITION_TYPE_PRESETS.includes(draft.competitionType ?? '') && (
                <input
                  value={draft.competitionType ?? ''}
                  onChange={(e) => patch({ competitionType: e.target.value })}
                  className={`${inputClass} mt-1.5`}
                  placeholder="예: WBrC 2016 결승 레시피"
                />
              )}
            </Field>
            <Field label="검증 상태">
              <select
                value={draft.verificationStatus ?? 'NEEDS_MANUAL_REVIEW'}
                onChange={(e) => patch({ verificationStatus: e.target.value as RecipeVerificationStatus })}
                className={inputClass}
              >
                {(Object.keys(VERIFICATION_STATUS_LABEL) as RecipeVerificationStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {VERIFICATION_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="원작자 (바리스타/브랜드명)">
              <input value={draft.attribution?.creator ?? ''} onChange={(e) => patchAttribution({ creator: e.target.value })} className={inputClass} />
            </Field>
            <Field label="출처 자료 제목">
              <input
                value={draft.attribution?.title ?? ''}
                onChange={(e) => patchAttribution({ title: e.target.value })}
                className={inputClass}
                placeholder="예: The Ultimate V60 Technique"
              />
            </Field>
            <Field label="출처 유형">
              <select
                value={draft.attribution?.type ?? 'other'}
                onChange={(e) => patchAttribution({ type: e.target.value as RecipeSourceType })}
                className={inputClass}
              >
                {(Object.keys(SOURCE_TYPE_LABEL) as RecipeSourceType[]).map((t) => (
                  <option key={t} value={t}>
                    {SOURCE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="원문 링크 (본인/브랜드 공식 채널 주소 — cup-timer.com 등 재게시 사이트 금지)">
                <input value={draft.attribution?.url ?? ''} onChange={(e) => patchAttribution({ url: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="영상 타임스탬프 (선택)">
              <input
                value={draft.attribution?.sourceTimestamp ?? ''}
                onChange={(e) => patchAttribution({ sourceTimestamp: e.target.value || undefined })}
                className={inputClass}
                placeholder="예: 05:12"
              />
            </Field>
            <Field label="검증 완료">
              <label className="flex items-center gap-2 py-2 text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={draft.attribution?.verified ?? false}
                  onChange={(e) =>
                    patchAttribution({
                      verified: e.target.checked,
                      verifiedAt: e.target.checked ? new Date().toISOString().slice(0, 10) : undefined,
                    })
                  }
                />
                1순위(또는 2순위) 공식 출처에서 직접 확인함
              </label>
            </Field>
            <div className="col-span-2">
              <Field label="검증 메모 (공식 출처에 명시 안 된 항목이 있으면 여기 기록 — 절대 다른 사이트 수치로 채우지 말 것)">
                <textarea
                  value={draft.verificationNote ?? ''}
                  onChange={(e) => patch({ verificationNote: e.target.value || undefined })}
                  className={`${inputClass} min-h-[60px]`}
                  placeholder="예: 공식 출처에 총 추출시간 명시 없음"
                />
              </Field>
            </div>
          </div>
        )}

        <div className="col-span-2 grid gap-3 rounded-lg border border-line/15 p-4">
          <p className="text-[12px] font-semibold text-ink">코이의 피드백 — 직접 내려보고 남기는 메모</p>
          <Field label="사용한 원두">
            <input
              value={draft.koiFeedbackCoffee ?? ''}
              onChange={(e) => patch({ koiFeedbackCoffee: e.target.value || undefined })}
              className={inputClass}
              placeholder="예: 에티오피아 우라가"
            />
          </Field>
          <Field label="피드백">
            <textarea
              value={draft.koiFeedbackNote ?? ''}
              onChange={(e) => patch({ koiFeedbackNote: e.target.value || undefined })}
              className={`${inputClass} min-h-[80px]`}
              placeholder="직접 내려본 소감을 자유롭게 적어주세요."
            />
          </Field>
        </div>

        <Field label="상태">
          <select
            value={draft.publishStatus}
            onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })}
            className={inputClass}
          >
            <option value="published">공개</option>
            <option value="draft">비공개</option>
          </select>
        </Field>

        <button
          type="button"
          onClick={handleSave}
          className="border border-line bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
        >
          글쓰기
        </button>
      </div>
    </AdminLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-ink/60">{label}</span>
      {children}
    </label>
  )
}
