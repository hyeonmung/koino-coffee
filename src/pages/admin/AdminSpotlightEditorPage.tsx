import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import KOIStarField from '../../components/decorative/KOIStarField'
import { getAllBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getAllCoffees } from '../../data/repositories/coffeeRepository'
import { getAllStories } from '../../data/repositories/storyRepository'
import {
  getAllSpotlightSlides,
  getSpotlightSlideById,
  upsertSpotlightSlide,
} from '../../data/repositories/spotlightRepository'
import { resolveSpotlightSlide } from '../../data/spotlightResolve'
import type { SpotlightContentType, SpotlightOverlayStrength, SpotlightSlide } from '../../data/schema'

const CONTENT_TYPES: { value: SpotlightContentType; label: string; hint: string }[] = [
  { value: 'FEATURED_COFFEE', label: '원두', hint: '지금 소개하고 싶은 원두를 골라 자동으로 불러옵니다.' },
  { value: 'NOTICE', label: '공지', hint: '휴무, 운영시간 변경 등 안내 사항.' },
  { value: 'EVENT', label: '이벤트', hint: '기간이 있는 프로모션이나 행사.' },
  { value: 'STORY', label: '콘텐츠', hint: '기존에 작성한 이야기를 골라 자동으로 불러옵니다.' },
  { value: 'VIDEO', label: '영상', hint: 'YouTube 등 외부 영상 링크. 자동재생·소리 없이 썸네일만 노출됩니다.' },
  { value: 'BREW', label: '브루 가이드', hint: '기존 브루 가이드를 골라 자동으로 불러옵니다.' },
  { value: 'EDUCATION', label: '교육', hint: '커피 클래스, 교육 프로그램 모집 안내.' },
  { value: 'BUSINESS', label: '납품', hint: '납품·컨설팅 등 B2B 안내.' },
  { value: 'CUSTOM', label: '자유 배너', hint: '위 항목에 해당하지 않는 자유 문구 배너.' },
]

const OVERLAY_OPTIONS: { value: SpotlightOverlayStrength; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
]

const LINKED_TYPES: SpotlightContentType[] = ['FEATURED_COFFEE', 'STORY', 'BREW']

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

function emptySlide(order: number): SpotlightSlide {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    contentType: 'CUSTOM',
    order,
    published: false,
    title: '',
    overlayStrength: 'medium',
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminSpotlightEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<SpotlightSlide>(() =>
    isNew ? emptySlide(getAllSpotlightSlides().length) : (getSpotlightSlideById(id!) ?? emptySlide(getAllSpotlightSlides().length)),
  )
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [error, setError] = useState<string | null>(null)

  // Route params alone don't remount this component (both /new and /:id render the
  // same element), so without this a "new" screen opened right after editing another
  // slide would silently keep showing that slide's data. Reset explicitly on id change.
  useEffect(() => {
    setDraft(isNew ? emptySlide(getAllSpotlightSlides().length) : (getSpotlightSlideById(id!) ?? emptySlide(getAllSpotlightSlides().length)))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<SpotlightSlide>) => setDraft((prev) => ({ ...prev, ...p }))

  const isLinked = LINKED_TYPES.includes(draft.contentType)

  const linkedOptions =
    draft.contentType === 'FEATURED_COFFEE'
      ? getAllCoffees().map((c) => ({ id: c.id, label: c.coffeeName }))
      : draft.contentType === 'STORY'
        ? getAllStories().map((s) => ({ id: s.id, label: s.title }))
        : draft.contentType === 'BREW'
          ? getAllBrewGuides().map((g) => ({ id: g.id, label: g.title }))
          : []

  const loadFromLinked = () => {
    if (draft.contentType === 'FEATURED_COFFEE') {
      const coffee = getAllCoffees().find((c) => c.id === draft.linkedId)
      if (coffee) patch({ title: coffee.coffeeName, desktopImage: coffee.heroImage ?? draft.desktopImage })
    } else if (draft.contentType === 'STORY') {
      const story = getAllStories().find((s) => s.id === draft.linkedId)
      if (story) patch({ title: story.title, description: story.excerpt, desktopImage: story.coverImage ?? draft.desktopImage })
    } else if (draft.contentType === 'BREW') {
      const guide = getAllBrewGuides().find((g) => g.id === draft.linkedId)
      if (guide) patch({ title: guide.title, description: `${guide.coffeeDose} · ${guide.ratio} · ${guide.totalTime}` })
    }
  }

  const handleSave = () => {
    if (isLinked && !draft.linkedId) {
      setError('연결할 항목을 선택해주세요.')
      return
    }
    if (!isLinked && !draft.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    setError(null)
    const next = { ...draft, updatedAt: new Date().toISOString() }
    upsertSpotlightSlide(next)
    setDraft(next)
    if (isNew) navigate(`/admin/spotlight/${next.id}`, { replace: true })
  }

  const preview = resolveSpotlightSlide(draft)

  return (
    <AdminLayout>
      <Link to="/admin/spotlight" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 메인 스포트라이트 목록
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="font-serif text-[22px] font-bold text-navy">{isNew ? '새 스포트라이트' : draft.title || '스포트라이트 편집'}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-navy/60">
            <input type="checkbox" checked={draft.published} onChange={(e) => patch({ published: e.target.checked })} />
            공개
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
          >
            저장
          </button>
        </div>
      </div>

      {error && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          {/* STEP 1 */}
          <section className="border border-navy/15 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 1 · 콘텐츠 종류</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => patch({ contentType: t.value, linkedId: undefined })}
                  className={`border px-2 py-2.5 text-[12px] font-semibold ${
                    draft.contentType === t.value ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/60 hover:border-navy/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-navy/45">{CONTENT_TYPES.find((t) => t.value === draft.contentType)?.hint}</p>
          </section>

          {isLinked && (
            <section className="border border-navy/15 bg-white p-5">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">연결할 항목</p>
              <div className="mt-2 flex gap-2">
                <select
                  value={draft.linkedId ?? ''}
                  onChange={(e) => patch({ linkedId: e.target.value || undefined })}
                  className={inputClass}
                >
                  <option value="">선택 안 함</option>
                  {linkedOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadFromLinked}
                  disabled={!draft.linkedId}
                  className="shrink-0 border border-navy px-4 py-2 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white disabled:opacity-30"
                >
                  불러오기
                </button>
              </div>
              <p className="mt-2 text-[11px] text-navy/45">
                "불러오기"를 누르면 제목·사진을 자동으로 채웁니다. 이후 아래에서 자유롭게 수정할 수 있습니다.
              </p>
            </section>
          )}

          {/* STEP 2 */}
          <section className="border border-navy/15 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 2 · 제목 / 설명</p>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="mb-1 flex items-center justify-between text-[10px] font-semibold text-navy/60">
                  <span>제목 (Category Label)</span>
                  <span className="text-navy/30">한글 약 20~28자 권장</span>
                </span>
                <input
                  value={draft.label ?? ''}
                  onChange={(e) => patch({ label: e.target.value })}
                  placeholder="비워두면 콘텐츠 종류에 맞는 기본 라벨이 표시됩니다"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">제목</span>
                <input value={draft.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center justify-between text-[10px] font-semibold text-navy/60">
                  <span>짧은 설명 (선택)</span>
                  <span className="text-navy/30">약 40~70자 권장</span>
                </span>
                <textarea
                  value={draft.description ?? ''}
                  onChange={(e) => patch({ description: e.target.value })}
                  className={`${inputClass} min-h-[60px]`}
                />
              </label>
            </div>
          </section>

          {/* STEP 3 */}
          <section className="border border-navy/15 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 3 · 사진 {draft.contentType === 'VIDEO' && '/ 영상'}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">Desktop 사진 URL</span>
                <input value={draft.desktopImage ?? ''} onChange={(e) => patch({ desktopImage: e.target.value })} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">Mobile 사진 URL (선택)</span>
                <input
                  value={draft.mobileImage ?? ''}
                  onChange={(e) => patch({ mobileImage: e.target.value })}
                  placeholder="비워두면 Desktop 사진을 사용합니다"
                  className={inputClass}
                />
              </label>
            </div>
            {draft.contentType === 'VIDEO' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">영상 URL (YouTube 등)</span>
                  <input value={draft.videoUrl ?? ''} onChange={(e) => patch({ videoUrl: e.target.value })} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">영상 썸네일(Poster) URL</span>
                  <input value={draft.videoPoster ?? ''} onChange={(e) => patch({ videoPoster: e.target.value })} className={inputClass} />
                </label>
              </div>
            )}
            <label className="mt-3 block">
              <span className="mb-1 block text-[10px] font-semibold text-navy/60">대체 텍스트 (Alt Text, 선택)</span>
              <input
                value={draft.altText ?? ''}
                onChange={(e) => patch({ altText: e.target.value })}
                placeholder="비워두면 제목을 사용합니다"
                className={inputClass}
              />
            </label>
            <p className="mt-3 text-[11px] text-navy/45">
              사진 URL이 비어 있으면 KOINO 브랜드 플레이스홀더(남색 배경 + 별)가 자동으로 표시됩니다.
            </p>
          </section>

          {/* STEP 4 */}
          <section className="border border-navy/15 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 4 · 링크 / 표시 방식</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">버튼 문구</span>
                <input
                  value={draft.ctaText ?? ''}
                  onChange={(e) => patch({ ctaText: e.target.value })}
                  placeholder="자세히 보기"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">이동 링크</span>
                <input
                  value={draft.ctaUrl ?? ''}
                  onChange={(e) => patch({ ctaUrl: e.target.value })}
                  placeholder="/coffees/... 또는 https://..."
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-3">
              <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">사진 위 어둡기</span>
              <div className="flex gap-2">
                {OVERLAY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => patch({ overlayStrength: o.value })}
                    className={`border px-4 py-1.5 text-[12px] font-semibold ${
                      draft.overlayStrength === o.value ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/60'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* STEP 5 */}
          <section className="border border-navy/15 bg-white p-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 5 · 공개 기간 (선택)</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">시작일</span>
                <input type="date" value={draft.startDate ?? ''} onChange={(e) => patch({ startDate: e.target.value || undefined })} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold text-navy/60">종료일</span>
                <input type="date" value={draft.endDate ?? ''} onChange={(e) => patch({ endDate: e.target.value || undefined })} className={inputClass} />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-navy/45">비워두면 기간 제한 없이 상시 노출됩니다.</p>
          </section>
        </div>

        {/* STEP 6 — Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">STEP 6 · 미리보기</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`px-2 py-1 text-[10px] font-semibold ${previewMode === 'desktop' ? 'border border-navy text-navy' : 'text-navy/40'}`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-2 py-1 text-[10px] font-semibold ${previewMode === 'mobile' ? 'border border-navy text-navy' : 'text-navy/40'}`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className={`relative mt-3 overflow-hidden border border-navy/15 ${
              previewMode === 'desktop' ? 'aspect-[16/9] w-full' : 'mx-auto aspect-[9/16] w-[220px]'
            }`}
          >
            {preview ? (
              <>
                {(previewMode === 'desktop' ? preview.desktopImage : preview.mobileImage) ? (
                  <div
                    className="h-full w-full bg-navy/10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${previewMode === 'desktop' ? preview.desktopImage : preview.mobileImage})` }}
                  />
                ) : (
                  <div className="koi-night-sky relative h-full w-full overflow-hidden">
                    <KOIStarField />
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    draft.overlayStrength === 'low'
                      ? 'from-navy/55 via-navy/10'
                      : draft.overlayStrength === 'high'
                        ? 'from-navy/95 via-navy/55'
                        : 'from-navy/80 via-navy/30'
                  } to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 text-warm-white">
                  <p className="text-[9px] font-semibold tracking-[0.25em] text-accent">{preview.label}</p>
                  <p className="mt-1 font-serif text-[16px] font-bold leading-snug">{preview.title}</p>
                  {preview.description && <p className="mt-1 text-[10px] text-warm-white/70">{preview.description}</p>}
                  <p className="mt-2 text-[10px] font-semibold text-warm-white/70">{preview.ctaText} →</p>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-navy/5 px-4 text-center text-[12px] text-navy/40">
                {isLinked ? '연결할 항목을 선택하면 미리보기가 표시됩니다.' : '제목을 입력하면 미리보기가 표시됩니다.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
