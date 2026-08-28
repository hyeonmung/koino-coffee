import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { BUSINESS_POST_CATEGORIES, BUSINESS_POST_CATEGORY_LABEL } from '../../constants/businessPostCategories'
import { businessPostSlugExists, getBusinessPostById, upsertBusinessPost } from '../../data/repositories/businessPostRepository'
import type { BusinessLink, BusinessPost, BusinessPostCategory, PublishStatus } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

function emptyPost(): BusinessPost {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'published',
    title: '',
    category: 'NOTICE',
    excerpt: '',
    body: '',
    publishedDate: now.slice(0, 10),
    relatedLinks: [],
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminBusinessPostEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<BusinessPost>(() => (isNew ? emptyPost() : getBusinessPostById(id!) ?? emptyPost()))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const next = isNew ? emptyPost() : (getBusinessPostById(id!) ?? emptyPost())
    setDraft(next)
    setSlugTouched(!isNew)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<BusinessPost>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p }
      if (!slugTouched && p.title !== undefined) next.slug = slugifyFilename(p.title)
      return next
    })
  }

  const updateLink = (index: number, patchLink: Partial<BusinessLink>) => {
    patch({ relatedLinks: draft.relatedLinks.map((l, i) => (i === index ? { ...l, ...patchLink } : l)) })
  }
  const addLink = () => patch({ relatedLinks: [...draft.relatedLinks, { label: '', url: '' }] })
  const removeLink = (index: number) => patch({ relatedLinks: draft.relatedLinks.filter((_, i) => i !== index) })

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.body.trim()) {
      setError('제목, Slug, 본문은 필수입니다.')
      return
    }
    if (businessPostSlugExists(draft.slug.trim(), draft.id)) {
      setError('이미 사용 중인 slug입니다.')
      return
    }
    setError(null)
    const relatedLinks = draft.relatedLinks.filter((l) => l.label.trim() && l.url.trim())
    const next = { ...draft, slug: draft.slug.trim(), relatedLinks, updatedAt: new Date().toISOString() }
    await upsertBusinessPost(next)
    setDraft(next)
    if (isNew) navigate(`/admin/business/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <Link to="/admin/business" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 납품 · 교육 목록
      </Link>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-[22px] font-bold text-navy">
        {draft.isSystemPinned && <span className="text-[11px] font-bold tracking-wide text-accent">PIN</span>}
        {isNew ? '새 게시물' : draft.title}
      </h1>
      {draft.isSystemPinned && (
        <p className="mt-1 text-[11px] text-navy/45">
          항상 목록 최상단에 고정되는 시스템 게시물입니다. 삭제할 수 없지만 내용은 자유롭게 수정할 수 있습니다.
        </p>
      )}

      {error && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      <div className="mt-6 max-w-[680px] space-y-4">
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="카테고리">
            <select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as BusinessPostCategory })}
              className={inputClass}
            >
              {BUSINESS_POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {BUSINESS_POST_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="발행일">
            <input type="date" value={draft.publishedDate} onChange={(e) => patch({ publishedDate: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="요약">
          <textarea rows={1} value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} className={inputClass} />
        </Field>
        <ImageUploadField label="커버 이미지" value={draft.coverImage ?? ''} onChange={(url) => patch({ coverImage: url })} />
        <Field label="본문 (빈 줄로 문단 구분, ## 로 소제목)">
          <textarea value={draft.body} onChange={(e) => patch({ body: e.target.value })} className={`${inputClass} min-h-[220px]`} />
        </Field>

        <div>
          <span className="mb-2 block text-[10px] font-semibold text-navy/60">관련 링크 (전화, 이메일, 카카오/네이버 등)</span>
          <p className="mb-2 text-[11px] text-navy/40">
            전화는 tel:010-0000-0000, 이메일은 mailto:hello@koinocoffee.com 형식으로 입력하면 클릭 시 바로 연결됩니다.
          </p>
          <div className="space-y-2">
            {draft.relatedLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <textarea
                  rows={1}
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  className={inputClass}
                  placeholder="전화 문의"
                />
                <input
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  className={inputClass}
                  placeholder="tel:010-0000-0000"
                />
                <button type="button" onClick={() => removeLink(i)} className="shrink-0 text-navy/40 hover:text-red-500">
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLink} className="mt-2 text-[11px] font-semibold text-navy/50 hover:text-navy">
            + 링크 추가
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="SEO 제목">
            <textarea rows={1} value={draft.seoTitle ?? ''} onChange={(e) => patch({ seoTitle: e.target.value })} className={inputClass} />
          </Field>
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
