import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { SPOTLIGHT_TYPE_LABEL } from '../../data/spotlightResolve'
import {
  deleteSpotlightSlide,
  getAllSpotlightSlides,
  reorderSpotlightSlide,
  upsertSpotlightSlide,
} from '../../data/repositories/spotlightRepository'
import type { SpotlightSlide } from '../../data/schema'

const CONTENT_TYPE_KOREAN: Record<SpotlightSlide['contentType'], string> = {
  FEATURED_COFFEE: '원두',
  NOTICE: '공지',
  EVENT: '이벤트',
  STORY: '콘텐츠',
  VIDEO: '영상',
  BREW: '브루 가이드',
  EDUCATION: '교육',
  BUSINESS: '납품',
  CUSTOM: '자유 배너',
}

export default function AdminSpotlightPage() {
  const [slides, setSlides] = useState<SpotlightSlide[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    setSlides(getAllSpotlightSlides())
  }, [])

  useEffect(() => {
    if (!confirmingId) return
    const t = setTimeout(() => setConfirmingId(null), 4000)
    return () => clearTimeout(t)
  }, [confirmingId])

  const refresh = () => setSlides(getAllSpotlightSlides())

  const togglePublished = (slide: SpotlightSlide) => {
    upsertSpotlightSlide({ ...slide, published: !slide.published, updatedAt: new Date().toISOString() })
    refresh()
  }

  const move = (id: string, direction: 'up' | 'down') => {
    reorderSpotlightSlide(id, direction)
    refresh()
  }

  const duplicate = (slide: SpotlightSlide) => {
    const now = new Date().toISOString()
    upsertSpotlightSlide({
      ...slide,
      id: crypto.randomUUID(),
      title: slide.title ? `${slide.title} (복제)` : slide.title,
      published: false,
      order: slides.length,
      createdAt: now,
      updatedAt: now,
    })
    refresh()
  }

  const remove = (id: string) => {
    deleteSpotlightSlide(id)
    setConfirmingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">SPOTLIGHT</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">메인 스포트라이트</h1>
          <p className="mt-1 text-[12px] text-navy/50">
            홈 화면 Hero 오른쪽에 순환 노출되는 콘텐츠입니다. 공개 상태인 슬라이드가 없으면 자동으로
            Featured 원두 1개가 대신 표시됩니다.
          </p>
        </div>
        <Link
          to="/admin/spotlight/new"
          className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
        >
          + 새 스포트라이트
        </Link>
      </div>

      {slides.length >= 8 && (
        <p className="mt-4 border border-accent/50 bg-accent/10 px-4 py-2.5 text-[12px] text-navy/70">
          메인 스포트라이트는 3~6개 사용을 권장합니다. 너무 많으면 손님이 원하는 정보를 보기 전에
          지나칠 수 있습니다.
        </p>
      )}

      <div className="mt-6 space-y-2">
        {slides.map((slide, i) => (
          <div key={slide.id} className="flex items-center gap-3 border border-navy/15 bg-white px-4 py-3">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(slide.id, 'up')}
                disabled={i === 0}
                className="text-navy/40 hover:text-navy disabled:opacity-20"
                aria-label="위로 이동"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(slide.id, 'down')}
                disabled={i === slides.length - 1}
                className="text-navy/40 hover:text-navy disabled:opacity-20"
                aria-label="아래로 이동"
              >
                ▼
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-navy/20 px-1.5 py-0.5 text-[10px] font-semibold text-navy/60">
                  {CONTENT_TYPE_KOREAN[slide.contentType]}
                </span>
                <p className="truncate text-[13px] font-semibold text-navy">
                  {slide.title || SPOTLIGHT_TYPE_LABEL[slide.contentType]}
                </p>
              </div>
              <p className="mt-0.5 text-[11px] text-navy/45">
                {slide.startDate || slide.endDate
                  ? `${slide.startDate ?? '제한 없음'} ~ ${slide.endDate ?? '제한 없음'}`
                  : '상시 노출'}
                {slide.ctaUrl && ` · ${slide.ctaUrl}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => togglePublished(slide)}
              className={`border px-2.5 py-1.5 text-[11px] font-semibold ${
                slide.published ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/50'
              }`}
            >
              {slide.published ? '공개 중' : '비공개'}
            </button>

            <Link
              to={`/admin/spotlight/${slide.id}`}
              className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={() => duplicate(slide)}
              className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy"
            >
              복제
            </button>
            {confirmingId === slide.id ? (
              <button
                type="button"
                onClick={() => remove(slide.id)}
                className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
              >
                정말 삭제
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingId(slide.id)}
                className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        {slides.length === 0 && (
          <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">
            등록된 스포트라이트가 없습니다. 지금은 Featured 원두가 자동으로 대신 노출됩니다.
          </p>
        )}
      </div>
    </AdminLayout>
  )
}
