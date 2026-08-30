import { useState, type FormEvent } from 'react'
import ImageUploadField from './admin/ImageUploadField'
import { generateUniqueSlug } from '../data/migrate'
import { getAllColumns, upsertColumn } from '../data/repositories/columnRepository'
import type { Column } from '../data/schema'

const EMPTY = {
  title: '',
  trendSummary: '',
  perspective: '',
  storeNote: '',
  closing: '',
  sources: '',
  coverImage: '',
}

export default function QuickAddColumnForm({ onClose, onCreated }: { onClose: () => void; onCreated: (column: Column) => void }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.trendSummary.trim() || !form.perspective.trim()) {
      setError('제목, 트렌드 요약, 코이노니아의 시각은 필수입니다.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const existingSlugs = new Set(getAllColumns().map((c) => c.slug))
      const now = new Date().toISOString()
      const column: Column = {
        id: crypto.randomUUID(),
        slug: generateUniqueSlug(form.title, existingSlugs),
        publishStatus: 'published',
        title: form.title.trim(),
        excerpt: form.trendSummary.trim().slice(0, 80),
        trendSummary: form.trendSummary.trim(),
        perspective: form.perspective.trim(),
        storeNote: form.storeNote.trim() || undefined,
        closing: form.closing.trim() || undefined,
        sources: form.sources.trim() || undefined,
        coverImage: form.coverImage || undefined,
        tags: [],
        scheduledAt: now,
        createdAt: now,
        updatedAt: now,
      }
      await upsertColumn(column)
      onCreated(column)
    } catch {
      setError('글 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4 py-8" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto border border-navy/15 bg-white p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">QUICK WRITE</p>
            <h2 className="mt-1 text-[18px] font-bold text-navy">새 칼럼 작성</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[20px] text-navy/40 hover:text-navy" aria-label="닫기">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">제목 *</span>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">트렌드 요약 · 오늘의 소식 *</span>
            <textarea
              value={form.trendSummary}
              onChange={(e) => set('trendSummary', e.target.value)}
              rows={5}
              placeholder="빈 줄로 문단을 나눌 수 있습니다."
              className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">코이노니아의 시각 *</span>
            <textarea
              value={form.perspective}
              onChange={(e) => set('perspective', e.target.value)}
              rows={4}
              className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">우리 매장 이야기 (선택)</span>
            <textarea
              value={form.storeNote}
              onChange={(e) => set('storeNote', e.target.value)}
              rows={3}
              className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">마무리 한마디 (선택)</span>
            <textarea
              value={form.closing}
              onChange={(e) => set('closing', e.target.value)}
              rows={2}
              className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">참고 출처 (선택, 한 줄에 하나씩)</span>
            <textarea
              value={form.sources}
              onChange={(e) => set('sources', e.target.value)}
              rows={3}
              className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <ImageUploadField label="커버 이미지 (선택)" value={form.coverImage} onChange={(url) => set('coverImage', url)} />

          {error && <p className="text-[11px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.1em] text-warm-white hover:bg-navy-light disabled:opacity-50"
          >
            {submitting ? '게시 중…' : '바로 게시하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
