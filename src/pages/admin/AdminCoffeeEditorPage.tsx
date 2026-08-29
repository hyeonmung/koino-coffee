import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import CharacterRecommendationPanel from '../../components/admin/CharacterRecommendationPanel'
import ImageUploadField from '../../components/admin/ImageUploadField'
import CharacterSelector from '../../components/CharacterSelector'
import CoffeePreview from '../../components/CoffeePreview'
import FlavorNoteInput from '../../components/FlavorNoteInput'
import SensoryProfileInput from '../../components/SensoryProfileInput'
import { recommendCharacter } from '../../data/characterRecommend'
import { getAllCoffees, getCoffeeById, slugExists, upsertCoffee } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors } from '../../data/repositories/flavorRepository'
import type { Availability, Coffee, PublishStatus } from '../../data/schema'
import { COFFEE_CARD_ASPECT_RATIO } from '../../constants/media'
import { formatCoffeeNumber } from '../../utils/coffeeNumber'
import { slugifyFilename } from '../../utils/download'
import { exportNodeAsPng } from '../../utils/pngExport'
import { validateCoffeeDraft } from '../../utils/validation'

const TABS = ['01 기본정보', '02 향미', '03 센서리', '04 캐릭터', '05 산지', '06 발행'] as const

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
    publishStatus: 'published',
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
  const [tab, setTab] = useState<(typeof TABS)[number]>('01 기본정보')
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [heroImageSize, setHeroImageSize] = useState<{ width: number; height: number } | null>(null)

  // /new and /:id render the same component without remounting, so a fresh "new"
  // screen opened right after editing another coffee would otherwise keep showing
  // that coffee's data. Reset explicitly whenever the route's id changes.
  useEffect(() => {
    setDraft(isNew ? emptyCoffee() : (getCoffeeById(id!) ?? emptyCoffee()))
    setTab('01 기본정보')
    setSlugTouched(!isNew)
    setErrors([])
    setSaved(false)
    setBusy(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const cardRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const flavorSuggestions = useMemo(() => getFlavorDescriptors().map((d) => d.name), [])

  useEffect(() => {
    if (!isNew && id) {
      const existing = getCoffeeById(id)
      if (existing) setDraft(existing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const recommendation = useMemo(() => recommendCharacter(draft.notes, draft.sensory), [draft.notes, draft.sensory])

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

  // Measures the uploaded photo's real dimensions so the MEDIA tab can show a
  // non-blocking ratio-mismatch warning — never used to reject the upload.
  useEffect(() => {
    const url = draft.heroImage
    if (!url) {
      setHeroImageSize(null)
      return
    }
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setHeroImageSize({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      if (!cancelled) setHeroImageSize(null)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [draft.heroImage])

  const handleSave = async () => {
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
    if (draft.coffeeNumber !== undefined) {
      const dup = getAllCoffees().find((c) => c.id !== draft.id && c.coffeeNumber === draft.coffeeNumber)
      if (dup) {
        problems.push(
          `#${String(draft.coffeeNumber).padStart(3, '0')}은(는) 이미 "${dup.coffeeName}"에서 사용 중입니다. 다른 번호를 입력해주세요.`,
        )
      }
    }
    if (problems.length > 0) {
      setErrors(problems)
      return
    }
    setErrors([])
    const next: Coffee = { ...draft, slug: draft.slug.trim(), updatedAt: now() }
    await upsertCoffee(next)
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
            {tab === '01 기본정보' && (
              <>
                {field(
                  '원두 이름 *',
                  <textarea rows={1} value={draft.coffeeName} onChange={(e) => patch({ coffeeName: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '원두 번호 (아카이브 번호)',
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={draft.coffeeNumber ?? ''}
                      onChange={(e) => patch({ coffeeNumber: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className={inputClass}
                      placeholder="번호 미지정"
                    />
                    <p className="mt-1 text-[11px] text-navy/40">
                      손님 화면에는 {formatCoffeeNumber(draft.coffeeNumber) ?? '#···'}으로 표시됩니다. 다른 원두와 중복될 수
                      없습니다. 비워두면 손님 화면에 번호가 표시되지 않습니다.
                    </p>
                  </div>,
                )}
                {field(
                  '한글명 (선택)',
                  <textarea
                    rows={1}
                    value={draft.koreanName ?? ''}
                    onChange={(e) => patch({ koreanName: e.target.value })}
                    className={inputClass}
                    placeholder="에티오피아 벤티 넨카"
                  />,
                )}
                {field(
                  'URL 주소 (Slug)',
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
                  '원산지 국가 *',
                  <textarea rows={1} value={draft.country} onChange={(e) => patch({ country: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '재고 상태',
                  <select
                    value={draft.availability}
                    onChange={(e) => patch({ availability: e.target.value as Availability })}
                    className={inputClass}
                  >
                    <option value="available">판매중</option>
                    <option value="limited">한정 수량</option>
                    <option value="archive">지난 원두 (단종)</option>
                  </select>,
                )}
                <ImageUploadField label="대표 이미지" value={draft.heroImage ?? ''} onChange={(url) => patch({ heroImage: url })} />
                <div className="space-y-1 text-[11px] leading-relaxed text-navy/45">
                  <p>권장 비율: 850 × 550 (17:11) — 원두 카드는 항상 이 비율로 잘려서 표시됩니다.</p>
                  <p>권장 최소 해상도: 1700 × 1100px</p>
                  <p>고화질 권장: 2550 × 1650px 이상</p>
                </div>
                {heroImageSize && Math.abs(heroImageSize.width / heroImageSize.height - COFFEE_CARD_ASPECT_RATIO) > 0.05 && (
                  <p className="border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] text-navy/70">
                    권장 비율과 다릅니다 ({heroImageSize.width} × {heroImageSize.height}). 카드에서는 일부 영역이 잘릴 수 있습니다.
                  </p>
                )}
              </>
            )}

            {tab === '02 향미' && (
              <FlavorNoteInput notes={draft.notes} onChange={(notes) => patch({ notes })} suggestions={flavorSuggestions} />
            )}

            {tab === '03 센서리' && <SensoryProfileInput sensory={draft.sensory} onChange={(sensory) => patch({ sensory })} />}

            {tab === '04 캐릭터' && (
              <>
                <CharacterRecommendationPanel
                  recommendation={recommendation}
                  current={draft.character}
                  onApply={(character) => patch({ character })}
                />
                <div className="mt-5">
                  <CharacterSelector value={draft.character} onChange={(character) => patch({ character })} />
                </div>
                {field(
                  '이 캐릭터를 선택한 이유 (선택)',
                  <textarea
                    value={draft.characterReason ?? ''}
                    onChange={(e) => patch({ characterReason: e.target.value })}
                    className={textareaClass}
                    placeholder="이 원두가 왜 이 Character인지 설명해주세요."
                  />,
                )}
              </>
            )}

            {tab === '05 산지' && (
              <div className="grid grid-cols-2 gap-3">
                {field('지역', <textarea rows={1} value={draft.region} onChange={(e) => patch({ region: e.target.value })} className={inputClass} />)}
                {field(
                  '세부 지역',
                  <textarea rows={1} value={draft.subregion ?? ''} onChange={(e) => patch({ subregion: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '생산자',
                  <textarea rows={1} value={draft.producer} onChange={(e) => patch({ producer: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '농장 / 워싱 스테이션',
                  <textarea
                    rows={1}
                    value={draft.farmOrStation ?? ''}
                    onChange={(e) => patch({ farmOrStation: e.target.value })}
                    className={inputClass}
                  />,
                )}
                {field(
                  '고도',
                  <textarea rows={1} value={draft.altitude} onChange={(e) => patch({ altitude: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '품종',
                  <textarea rows={1} value={draft.variety} onChange={(e) => patch({ variety: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '수확 시기',
                  <textarea rows={1} value={draft.harvest ?? ''} onChange={(e) => patch({ harvest: e.target.value })} className={inputClass} />,
                )}
                {field('로트', <textarea rows={1} value={draft.lot ?? ''} onChange={(e) => patch({ lot: e.target.value })} className={inputClass} />)}
                {field(
                  '등급',
                  <textarea rows={1} value={draft.grade ?? ''} onChange={(e) => patch({ grade: e.target.value })} className={inputClass} />,
                )}
                {field(
                  '가공 방식',
                  <textarea rows={1} value={draft.process} onChange={(e) => patch({ process: e.target.value })} className={inputClass} placeholder="Washed" />,
                )}
                {field(
                  '로스팅 단계 (라이트 / 미디엄 라이트 / 미디엄 / 미디엄 다크 / 다크)',
                  <textarea rows={1} value={draft.roastLevel} onChange={(e) => patch({ roastLevel: e.target.value })} className={inputClass} />,
                )}
              </div>
            )}

            {tab === '06 발행' && (
              <div className="space-y-3">
                {field(
                  '공개 상태',
                  <select
                    value={draft.publishStatus}
                    onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })}
                    className={inputClass}
                  >
                    <option value="published">공개</option>
                    <option value="draft">비공개</option>
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
                  '정렬 순서',
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                    className={inputClass}
                  />,
                )}

                {!isNew && draft.slug && (
                  <a
                    href={`/coffee-chart/${draft.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block border border-navy/25 px-3 py-2 text-[11px] font-semibold text-navy hover:border-navy"
                  >
                    원두 차트 미리보기 ↗
                  </a>
                )}

                <div className="border-t border-navy/15 pt-4">
                  <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">PNG 내보내기</p>
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
          <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">실시간 미리보기</p>
          <CoffeePreview coffee={draft} ref={cardRef} chartRef={chartRef} />
        </div>
      </div>
    </AdminLayout>
  )
}
