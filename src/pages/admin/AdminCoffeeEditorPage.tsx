import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import CharacterSelector from '../../components/CharacterSelector'
import CoffeePreview from '../../components/CoffeePreview'
import FlavorNoteInput from '../../components/FlavorNoteInput'
import SensoryProfileInput from '../../components/SensoryProfileInput'
import { getAllBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getCoffeeById, slugExists, upsertCoffee } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors } from '../../data/repositories/flavorRepository'
import { getAllStories } from '../../data/repositories/storyRepository'
import type { Availability, Coffee, PublishStatus, RoastType } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'
import { exportNodeAsPng } from '../../utils/pngExport'
import { validateCoffeeDraft } from '../../utils/validation'

const TABS = [
  '01 BASIC',
  '02 CHARACTER',
  '03 FLAVOR',
  '04 SENSORY',
  '05 ORIGIN',
  '06 PROCESS',
  '07 ROAST',
  '08 BREW',
  '09 STORY',
  '10 MEDIA',
  '11 SEO',
  '12 PUBLISH',
] as const

const now = () => new Date().toISOString()

function emptyCoffee(): Coffee {
  return {
    id: crypto.randomUUID(),
    slug: '',
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
    sensory: { acidity: 3, sweetness: 3, body: 3, finish: 3, flavor: 3, accessibility: 3 },
    createdAt: now(),
    updatedAt: now(),
    publishStatus: 'draft',
    featured: false,
    sortOrder: 0,
    availability: 'available',
    brewGuideIds: [],
    profileVersion: 1,
  } as Coffee
}

function field(label: string, children: React.ReactNode) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'
const textareaClass = `${inputClass} min-h-[80px]`

export default function AdminCoffeeEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [draft, setDraft] = useState<Coffee>(() => (isNew ? emptyCoffee() : getCoffeeById(id!) ?? emptyCoffee()))
  const [tab, setTab] = useState<(typeof TABS)[number]>('01 BASIC')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const brewGuides = useMemo(() => getAllBrewGuides(), [])
  const stories = useMemo(() => getAllStories(), [])
  const flavorSuggestions = useMemo(() => getFlavorDescriptors().map((d) => d.name), [])

  useEffect(() => {
    if (!isNew && id) {
      const existing = getCoffeeById(id)
      if (existing) setDraft(existing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<Coffee>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p }
      if (!slugTouched && p.coffeeName !== undefined) {
        next.slug = slugifyFilename(p.coffeeName)
      }
      return next
    })
    setSaved(false)
  }

  const handleSave = () => {
    const validation = validateCoffeeDraft({
      coffeeName: draft.coffeeName,
      country: draft.country,
      region: draft.region,
      producer: draft.producer,
      variety: draft.variety,
      process: draft.process,
      altitude: draft.altitude,
      roastLevel: draft.roastLevel,
      character: draft.character,
      notes: draft.notes,
      sensory: draft.sensory,
    })
    const problems = validation.map((v) => v.message)
    if (!draft.slug.trim()) problems.push('Slug는 필수입니다.')
    if (draft.slug.trim() && slugExists(draft.slug.trim(), draft.id)) {
      problems.push('이미 사용 중인 slug입니다. 다른 값을 입력해주세요.')
    }
    if (problems.length > 0) {
      setErrors(problems)
      return
    }
    setErrors([])
    const next: Coffee = { ...draft, slug: draft.slug.trim(), updatedAt: now() }
    upsertCoffee(next)
    setDraft(next)
    setSaved(true)
    if (isNew) navigate(`/admin/coffees/${next.id}`, { replace: true })
  }

  const filenameBase = slugifyFilename(draft.coffeeName || 'coffee')
  const handleExportChart = async () => {
    setBusy('chart')
    try {
      await exportNodeAsPng(chartRef.current, `${filenameBase}-radar.png`, true)
    } finally {
      setBusy(null)
    }
  }
  const handleExportCard = async () => {
    setBusy('card')
    try {
      await exportNodeAsPng(cardRef.current, `${filenameBase}-profile.png`, false)
    } finally {
      setBusy(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/coffees" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
            ← 원두 목록
          </Link>
          <h1 className="mt-1 font-serif text-[22px] font-bold text-navy">
            {isNew ? '새 원두 등록' : draft.coffeeName || '원두 수정'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[11px] font-semibold text-navy/50">저장됨</span>}
          <button
            type="button"
            onClick={handleSave}
            className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
          >
            저장
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 border border-red-300 bg-red-50 px-4 py-2.5 text-[12px] text-red-600">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="flex flex-wrap gap-1 border-b border-navy/15 pb-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-2.5 py-1.5 text-[10px] font-semibold tracking-wide ${
                  tab === t ? 'border border-navy bg-navy text-warm-white' : 'border border-transparent text-navy/50 hover:text-navy'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {tab === '01 BASIC' && (
              <>
                {field(
                  'Coffee Name *',
                  <input value={draft.coffeeName} onChange={(e) => patch({ coffeeName: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '한글명 (선택)',
                  <input
                    value={draft.koreanName ?? ''}
                    onChange={(e) => patch({ koreanName: e.target.value })}
                    className={inputClass}
                    placeholder="에티오피아 벤티 넨카"
                  />,
                )}
                {field(
                  'Slug (URL)',
                  <input
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true)
                      patch({ slug: e.target.value })
                    }}
                    className={inputClass}
                    placeholder="ethiopia-yirgacheffe"
                  />,
                )}
                {field(
                  'Country *',
                  <input value={draft.country} onChange={(e) => patch({ country: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'Availability',
                  <select
                    value={draft.availability}
                    onChange={(e) => patch({ availability: e.target.value as Availability })}
                    className={inputClass}
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="archive">Archive (Past Coffee)</option>
                  </select>,
                )}
              </>
            )}

            {tab === '02 CHARACTER' && (
              <>
                <CharacterSelector value={draft.character} onChange={(character) => patch({ character })} />
                {field(
                  'Why this Character? (선택)',
                  <textarea
                    value={draft.characterReason ?? ''}
                    onChange={(e) => patch({ characterReason: e.target.value })}
                    className={textareaClass}
                    placeholder="이 원두가 왜 이 Character인지 설명해주세요."
                  />,
                )}
              </>
            )}

            {tab === '03 FLAVOR' && (
              <FlavorNoteInput notes={draft.notes} onChange={(notes) => patch({ notes })} suggestions={flavorSuggestions} />
            )}

            {tab === '04 SENSORY' && <SensoryProfileInput sensory={draft.sensory} onChange={(sensory) => patch({ sensory })} />}

            {tab === '05 ORIGIN' && (
              <div className="grid grid-cols-2 gap-3">
                {field('Region', <input value={draft.region} onChange={(e) => patch({ region: e.target.value })} className={inputClass} />)}
                {field(
                  'Subregion',
                  <input value={draft.subregion ?? ''} onChange={(e) => patch({ subregion: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'Producer',
                  <input value={draft.producer} onChange={(e) => patch({ producer: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'Farm / Washing Station',
                  <input
                    value={draft.farmOrStation ?? ''}
                    onChange={(e) => patch({ farmOrStation: e.target.value })}
                    className={inputClass}
                  />,
                )}
                {field(
                  'Altitude',
                  <input value={draft.altitude} onChange={(e) => patch({ altitude: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'Variety',
                  <input value={draft.variety} onChange={(e) => patch({ variety: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'Harvest',
                  <input value={draft.harvest ?? ''} onChange={(e) => patch({ harvest: e.target.value })} className={inputClass} />,
                )}
                {field('Lot', <input value={draft.lot ?? ''} onChange={(e) => patch({ lot: e.target.value })} className={inputClass} />)}
                {field(
                  'Grade',
                  <input value={draft.grade ?? ''} onChange={(e) => patch({ grade: e.target.value })} className={inputClass} />,
                )}
              </div>
            )}

            {tab === '06 PROCESS' && (
              <div className="space-y-3">
                {field(
                  'Process Name',
                  <input value={draft.process} onChange={(e) => patch({ process: e.target.value })} className={inputClass} placeholder="Washed" />,
                )}
                {field(
                  'Description',
                  <textarea
                    value={draft.processDescription ?? ''}
                    onChange={(e) => patch({ processDescription: e.target.value })}
                    className={textareaClass}
                  />,
                )}
                <div className="grid grid-cols-2 gap-3">
                  {field(
                    'Fermentation',
                    <input value={draft.fermentation ?? ''} onChange={(e) => patch({ fermentation: e.target.value })} className={inputClass} />,
                  )}
                  {field(
                    'Drying',
                    <input value={draft.drying ?? ''} onChange={(e) => patch({ drying: e.target.value })} className={inputClass} />,
                  )}
                  {field(
                    'Temperature',
                    <input
                      value={draft.processTemperature ?? ''}
                      onChange={(e) => patch({ processTemperature: e.target.value })}
                      className={inputClass}
                    />,
                  )}
                  {field(
                    'Duration',
                    <input
                      value={draft.processDuration ?? ''}
                      onChange={(e) => patch({ processDuration: e.target.value })}
                      className={inputClass}
                    />,
                  )}
                </div>
                <p className="text-[11px] text-navy/40">비워두면 공개 페이지에서 해당 항목은 표시되지 않습니다.</p>
              </div>
            )}

            {tab === '07 ROAST' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {field(
                    'Roast Type',
                    <select
                      value={draft.roastType ?? ''}
                      onChange={(e) => patch({ roastType: (e.target.value || undefined) as RoastType | undefined })}
                      className={inputClass}
                    >
                      <option value="">선택 안함</option>
                      <option value="Filter">Filter</option>
                      <option value="Espresso">Espresso</option>
                      <option value="Omni">Omni</option>
                    </select>,
                  )}
                  {field(
                    'Roast Level (Light / Medium Light / Medium / Medium Dark / Dark)',
                    <input value={draft.roastLevel} onChange={(e) => patch({ roastLevel: e.target.value })} className={inputClass} />,
                  )}
                  {field(
                    'Roast Direction',
                    <input
                      value={draft.roastDirection ?? ''}
                      onChange={(e) => patch({ roastDirection: e.target.value })}
                      className={inputClass}
                    />,
                  )}
                  {field(
                    '추천 디개싱 (Recommended Rest)',
                    <input
                      value={draft.recommendedRest ?? ''}
                      onChange={(e) => patch({ recommendedRest: e.target.value })}
                      className={inputClass}
                      placeholder="7–21 Days"
                    />,
                  )}
                  {field(
                    '로스터 (Roaster)',
                    <input value={draft.roaster ?? ''} onChange={(e) => patch({ roaster: e.target.value })} className={inputClass} />,
                  )}
                </div>

                {field(
                  '로스터의 생각 (Roaster’s Comment)',
                  <textarea
                    value={draft.roasterComment ?? ''}
                    onChange={(e) => patch({ roasterComment: e.target.value })}
                    className={textareaClass}
                  />,
                )}
                {field(
                  '바리스타의 생각 (Barista’s Comment, 선택)',
                  <textarea
                    value={draft.baristaComment ?? ''}
                    onChange={(e) => patch({ baristaComment: e.target.value })}
                    className={textareaClass}
                  />,
                )}

                <div>
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.1em] text-navy/60">
                    Advanced Roast Data (선택 — 입력한 항목만 공개 화면에 표시됩니다)
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(
                      [
                        ['batch', 'Batch'],
                        ['chargeTemp', 'Charge Temp'],
                        ['turningPoint', 'Turning Point'],
                        ['yellow', 'Yellow'],
                        ['firstCrack', 'First Crack'],
                        ['drop', 'Drop'],
                        ['totalTime', 'Total Time'],
                        ['developmentTime', 'Development Time'],
                        ['developmentRatio', 'Development Ratio'],
                        ['dropTemp', 'Drop Temp'],
                        ['machine', 'Machine'],
                      ] as const
                    ).map(([key, label]) => (
                      <input
                        key={key}
                        value={draft.roastData?.[key] ?? ''}
                        onChange={(e) => patch({ roastData: { ...draft.roastData, [key]: e.target.value } })}
                        className={inputClass}
                        placeholder={label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === '08 BREW' && (
              <div className="space-y-2">
                {brewGuides.length === 0 && <p className="text-[12px] text-navy/45">등록된 Brew Guide가 없습니다.</p>}
                {brewGuides.map((guide) => (
                  <label key={guide.id} className="flex items-center gap-2 border border-navy/15 px-3 py-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={draft.brewGuideIds.includes(guide.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...draft.brewGuideIds, guide.id]
                          : draft.brewGuideIds.filter((id_) => id_ !== guide.id)
                        patch({ brewGuideIds: next })
                      }}
                    />
                    <span className="font-semibold text-navy">{guide.equipment}</span>
                    <span className="text-navy/50">{guide.title}</span>
                  </label>
                ))}
              </div>
            )}

            {tab === '09 STORY' && (
              <div className="space-y-3">
                {field(
                  'Recommended For',
                  <textarea
                    value={draft.recommendedFor ?? ''}
                    onChange={(e) => patch({ recommendedFor: e.target.value })}
                    className={textareaClass}
                    placeholder="예: 화사하고 차처럼 깔끔한 커피를 좋아하는 분"
                  />,
                )}
                {field(
                  'Related Story',
                  <select
                    value={draft.storyId ?? ''}
                    onChange={(e) => patch({ storyId: e.target.value || undefined })}
                    className={inputClass}
                  >
                    <option value="">연결 안함</option>
                    {stories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>,
                )}
              </div>
            )}

            {tab === '10 MEDIA' && (
              <div className="space-y-3">
                {field(
                  'Hero Image URL',
                  <input
                    value={draft.heroImage ?? ''}
                    onChange={(e) => patch({ heroImage: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />,
                )}
                {field(
                  'Purchase URL',
                  <input
                    value={draft.purchaseUrl ?? ''}
                    onChange={(e) => patch({ purchaseUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />,
                )}
                <p className="text-[11px] text-navy/40">
                  중앙 Media Library 업로드는 Supabase Storage 연결 후 지원됩니다. 지금은 외부 이미지 URL을 입력해주세요.
                </p>
              </div>
            )}

            {tab === '11 SEO' && (
              <div className="space-y-3">
                {field(
                  'SEO Title',
                  <input value={draft.seoTitle ?? ''} onChange={(e) => patch({ seoTitle: e.target.value })} className={inputClass} />,
                )}
                {field(
                  'SEO Description',
                  <textarea
                    value={draft.seoDescription ?? ''}
                    onChange={(e) => patch({ seoDescription: e.target.value })}
                    className={textareaClass}
                  />,
                )}
              </div>
            )}

            {tab === '12 PUBLISH' && (
              <div className="space-y-3">
                {field(
                  'Status',
                  <select
                    value={draft.publishStatus}
                    onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>,
                )}
                <label className="flex items-center gap-2 text-[12px] text-navy">
                  <input type="checkbox" checked={draft.featured} onChange={(e) => patch({ featured: e.target.checked })} />
                  홈페이지 Featured 노출
                </label>
                <label className="flex items-center gap-2 text-[12px] text-navy">
                  <input
                    type="checkbox"
                    checked={draft.chartVisible !== false}
                    onChange={(e) => patch({ chartVisible: e.target.checked })}
                  />
                  원두 차트(/coffee-chart)에 노출
                </label>
                {field(
                  'Sort Order',
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                    className={inputClass}
                  />,
                )}

                {!isNew && draft.slug && (
                  <a
                    href={`#/coffee-chart/${draft.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block border border-navy/25 px-3 py-2 text-[11px] font-semibold text-navy hover:border-navy"
                  >
                    원두 차트 미리보기 ↗
                  </a>
                )}

                <div className="border-t border-navy/15 pt-4">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">PNG EXPORT</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={handleExportChart}
                      className="border border-navy/25 px-3 py-2 text-[11px] font-semibold text-navy hover:border-navy disabled:opacity-40"
                    >
                      {busy === 'chart' ? '저장 중...' : '레이더 차트 PNG'}
                    </button>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={handleExportCard}
                      className="border border-navy/25 px-3 py-2 text-[11px] font-semibold text-navy hover:border-navy disabled:opacity-40"
                    >
                      {busy === 'card' ? '저장 중...' : '카드 전체 PNG'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">LIVE PREVIEW</p>
          <CoffeePreview coffee={draft} ref={cardRef} chartRef={chartRef} />
        </div>
      </div>
    </AdminLayout>
  )
}
