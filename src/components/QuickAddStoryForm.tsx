import { useState, type FormEvent } from 'react'
import ImageUploadField from './admin/ImageUploadField'
import { STORY_CATEGORY_LABEL } from '../constants/storyCategories'
import { generateUniqueSlug } from '../data/migrate'
import { getAllStories, upsertStory } from '../data/repositories/storyRepository'
import type { Story, StoryCategory } from '../data/schema'

const CATEGORIES: StoryCategory[] = ['NEWS', 'ORIGIN', 'COFFEE', 'ROASTING', 'BREWING', 'SENSORY', 'KOI', 'EDUCATION']

const EMPTY = {
  title: '',
  category: 'NEWS' as StoryCategory,
  excerpt: '',
  body: '',
  coverImage: '',
}

export default function QuickAddStoryForm({ onClose, onCreated }: { onClose: () => void; onCreated: (story: Story) => void }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setError('제목과 본문은 필수입니다.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const existingSlugs = new Set(getAllStories().map((s) => s.slug))
      const now = new Date().toISOString()
      const story: Story = {
        id: crypto.randomUUID(),
        slug: generateUniqueSlug(form.title, existingSlugs),
        publishStatus: 'published',
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        category: form.category,
        tags: [],
        coverImage: form.coverImage || undefined,
        publishedDate: now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
      }
      await upsertStory(story)
      onCreated(story)
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
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">QUICK WRITE</p>
            <h2 className="mt-1 text-[18px] font-bold text-navy">새 글 작성</h2>
          </div>
          <button type="button" onClick={onClose} className="text-[20px] text-navy/40 hover:text-navy" aria-label="닫기">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">제목 *</span>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">카테고리</span>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as StoryCategory)}
                className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {STORY_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">요약 (선택)</span>
            <input
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="목록/공유 미리보기에 쓰일 한 줄 요약"
              className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">본문 *</span>
            <textarea
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={8}
              placeholder="빈 줄로 문단을 나눌 수 있습니다."
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
            {submitting ? '게시 중…' : '글 게시하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
