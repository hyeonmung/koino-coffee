import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { STORY_CATEGORY_LABEL } from '../../constants/storyCategories'
import { getStoryById, storySlugExists, upsertStory } from '../../data/repositories/storyRepository'
import type { PublishStatus, Story, StoryCategory } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

const CATEGORIES: StoryCategory[] = ['NEWS', 'ORIGIN', 'COFFEE', 'ROASTING', 'BREWING', 'SENSORY', 'KOI', 'EDUCATION']

function emptyStory(): Story {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'published',
    title: '',
    excerpt: '',
    body: '',
    category: 'KOI',
    tags: [],
    publishedDate: now.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminStoryEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Story>(() => (isNew ? emptyStory() : getStoryById(id!) ?? emptyStory()))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [tagsInput, setTagsInput] = useState(() => draft.tags.join(', '))
  const [error, setError] = useState<string | null>(null)

  // /new and /:id render the same component without remounting, so a fresh "new"
  // screen opened right after editing another story would otherwise keep showing
  // that story's data. Reset explicitly whenever the route's id changes.
  useEffect(() => {
    const next = isNew ? emptyStory() : (getStoryById(id!) ?? emptyStory())
    setDraft(next)
    setSlugTouched(!isNew)
    setTagsInput(next.tags.join(', '))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<Story>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p }
      if (!slugTouched && p.title !== undefined) next.slug = slugifyFilename(p.title)
      return next
    })
  }

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.body.trim()) {
      setError('제목, Slug, 본문은 필수입니다.')
      return
    }
    if (storySlugExists(draft.slug.trim(), draft.id)) {
      setError('이미 사용 중인 slug입니다.')
      return
    }
    setError(null)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const next = { ...draft, slug: draft.slug.trim(), tags, updatedAt: new Date().toISOString() }
    await upsertStory(next)
    setDraft(next)
    if (isNew) navigate(`/admin/stories/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <Link to="/admin/stories" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 이야기 목록
      </Link>
      <h1 className="mt-1 font-serif text-[22px] font-bold text-navy">{isNew ? '새 스토리' : draft.title}</h1>

      {error && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      <div className="mt-6 max-w-[680px] space-y-4">
        <Field label="제목 (Title)">
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="카테고리">
            <select value={draft.category} onChange={(e) => patch({ category: e.target.value as StoryCategory })} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {STORY_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="발행일">
            <input type="date" value={draft.publishedDate} onChange={(e) => patch({ publishedDate: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="요약 (Excerpt)">
          <textarea rows={1} value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Tags (쉼표로 구분)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClass} placeholder="산지, 교육" />
        </Field>
        <ImageUploadField label="커버 이미지" value={draft.coverImage ?? ''} onChange={(url) => patch({ coverImage: url })} />
        <Field label="본문 (빈 줄로 문단 구분, ## 로 소제목)">
          <textarea value={draft.body} onChange={(e) => patch({ body: e.target.value })} className={`${inputClass} min-h-[220px]`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SEO 제목">
            <textarea rows={1} value={draft.seoTitle ?? ''} onChange={(e) => patch({ seoTitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="상태">
            <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })} className={inputClass}>
              <option value="published">공개</option>
              <option value="draft">비공개</option>
            </select>
          </Field>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
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
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}
