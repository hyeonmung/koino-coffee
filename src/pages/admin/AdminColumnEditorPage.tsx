import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { columnSlugExists, getColumnById, upsertColumn } from '../../data/repositories/columnRepository'
import type { Column, PublishStatus } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function emptyColumn(): Column {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'published',
    title: '',
    excerpt: '',
    trendSummary: '',
    perspective: '',
    storeNote: '',
    closing: '',
    sources: '',
    tags: [],
    scheduledAt: now,
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminColumnEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Column>(() => (isNew ? emptyColumn() : getColumnById(id!) ?? emptyColumn()))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [tagsInput, setTagsInput] = useState(() => draft.tags.join(', '))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const next = isNew ? emptyColumn() : (getColumnById(id!) ?? emptyColumn())
    setDraft(next)
    setSlugTouched(!isNew)
    setTagsInput(next.tags.join(', '))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = (p: Partial<Column>) => {
    setDraft((prev) => {
      const next = { ...prev, ...p }
      if (!slugTouched && p.title !== undefined) next.slug = slugifyFilename(p.title)
      return next
    })
  }

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.trendSummary.trim() || !draft.perspective.trim()) {
      setError('제목, Slug, 트렌드 요약, 코이노니아의 시각은 필수입니다.')
      return
    }
    if (columnSlugExists(draft.slug.trim(), draft.id)) {
      setError('이미 사용 중인 slug입니다.')
      return
    }
    setError(null)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const next = { ...draft, slug: draft.slug.trim(), tags, updatedAt: new Date().toISOString() }
    await upsertColumn(next)
    setDraft(next)
    if (isNew) navigate(`/admin/columns/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <Link to="/admin/columns" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 칼럼 목록
      </Link>
      <h1 className="mt-1 font-serif text-[22px] font-bold text-navy">{isNew ? '새 칼럼' : draft.title}</h1>

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
        <Field label="요약 (목록 카드에 쓰일 한 줄)">
          <textarea rows={1} value={draft.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} className={inputClass} />
        </Field>

        <Field label="트렌드 요약 · 오늘의 소식 (필수, 빈 줄로 문단 구분)">
          <textarea value={draft.trendSummary} onChange={(e) => patch({ trendSummary: e.target.value })} className={`${inputClass} min-h-[140px]`} />
        </Field>
        <Field label="코이노니아의 시각 (필수)">
          <textarea value={draft.perspective} onChange={(e) => patch({ perspective: e.target.value })} className={`${inputClass} min-h-[120px]`} />
        </Field>
        <Field label="우리 매장 이야기 (선택)">
          <textarea value={draft.storeNote ?? ''} onChange={(e) => patch({ storeNote: e.target.value })} className={`${inputClass} min-h-[100px]`} />
        </Field>
        <Field label="마무리 한마디 (선택)">
          <textarea rows={2} value={draft.closing ?? ''} onChange={(e) => patch({ closing: e.target.value })} className={inputClass} />
        </Field>
        <Field label="참고 출처 (선택, 한 줄에 하나씩)">
          <textarea value={draft.sources ?? ''} onChange={(e) => patch({ sources: e.target.value })} className={`${inputClass} min-h-[80px]`} />
        </Field>

        <Field label="Tags (쉼표로 구분)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClass} placeholder="트렌드, 가공방식" />
        </Field>
        <ImageUploadField label="커버 이미지" value={draft.coverImage ?? ''} onChange={(url) => patch({ coverImage: url })} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="예약 발행 시각">
            <input
              type="datetime-local"
              value={toLocalInputValue(draft.scheduledAt)}
              onChange={(e) => patch({ scheduledAt: new Date(e.target.value).toISOString() })}
              className={inputClass}
            />
          </Field>
          <Field label="상태">
            <select value={draft.publishStatus} onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })} className={inputClass}>
              <option value="published">공개 (예약 시각에 노출)</option>
              <option value="draft">비공개</option>
            </select>
          </Field>
        </div>

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
