import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { getPlaylistById, playlistSlugExists, upsertPlaylist } from '../../data/repositories/playlistRepository'
import type { Playlist, PublishStatus } from '../../data/schema'
import { randomMorningTime } from '../../utils/scheduledTime'
import { parsePlaylistFile, playlistSlug, playlistTitle } from '../../utils/playlistParse'

const inputClass =
  'w-full border border-line/25 bg-surface px-2.5 py-2 text-[13px] text-ink outline-none placeholder:text-ink/30 focus:border-line'

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function emptyPlaylist(): Playlist {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    slug: '',
    publishStatus: 'draft',
    title: '',
    caption: '',
    tracks: [],
    scheduledAt: now,
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminPlaylistEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()

  const [draft, setDraft] = useState<Playlist>(() => (isNew ? emptyPlaylist() : (getPlaylistById(id) ?? emptyPlaylist())))
  const [rawPaste, setRawPaste] = useState('')
  const [parseError, setParseError] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  const patch = (p: Partial<Playlist>) => {
    setSaved(false)
    setDraft((d) => ({ ...d, ...p }))
  }

  const handleParse = () => {
    setParseError('')
    try {
      const { year, month, moodQuote, tracks, caption } = parsePlaylistFile(rawPaste)
      const slug = playlistSlug(year, month)
      patch({
        slug,
        title: playlistTitle(year, month, moodQuote),
        caption,
        tracks,
        scheduledAt: randomMorningTime(`${year}-${String(month).padStart(2, '0')}-01`),
      })
    } catch (e) {
      setParseError(e instanceof Error ? e.message : '파싱에 실패했습니다.')
    }
  }

  const handleSave = async () => {
    const problems: string[] = []
    if (!draft.slug.trim()) problems.push('Slug는 필수입니다 (원문 붙여넣기 → 불러오기로 자동 생성됩니다).')
    if (draft.slug.trim() && playlistSlugExists(draft.slug.trim(), draft.id)) {
      problems.push('이미 사용 중인 slug입니다 (같은 달이 이미 등록되어 있을 수 있습니다).')
    }
    if (!draft.title.trim()) problems.push('제목이 비어 있습니다.')
    if (draft.tracks.length !== 20) problems.push(`트랙이 20개가 아닙니다 (현재 ${draft.tracks.length}개).`)
    if (problems.length > 0) {
      setErrors(problems)
      return
    }
    setErrors([])
    const next: Playlist = { ...draft, slug: draft.slug.trim(), updatedAt: new Date().toISOString() }
    await upsertPlaylist(next)
    setDraft(next)
    setSaved(true)
    if (isNew) navigate(`/admin/playlists/${next.id}`, { replace: true })
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/playlists" className="text-[11px] font-semibold text-ink/45 hover:text-ink">
            ← J&B 플레이리스트 관리
          </Link>
          <h1 className="mt-1 font-serif text-[22px] font-bold text-ink">{isNew ? '새 플레이리스트 등록' : draft.title || '플레이리스트 수정'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[11px] font-semibold text-ink/50">저장됨</span>}
          <button
            type="button"
            onClick={handleSave}
            className="border border-line bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
          >
            저장
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 border border-red-300 bg-red-50 px-4 py-3">
          {errors.map((e) => (
            <p key={e} className="text-[12px] text-red-600">
              {e}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 max-w-[680px] space-y-5">
        <div>
          <p className="mb-1 text-[11px] font-semibold text-ink/60">월별 원문 붙여넣기 (.txt 전체 내용)</p>
          <textarea
            rows={8}
            value={rawPaste}
            onChange={(e) => setRawPaste(e.target.value)}
            placeholder={'Jazzy & Bluesy | 2026년 10월 플레이리스트\n"무드 문구"\n\n(트랙 20개)\n\n[인스타그램 캡션]\n...'}
            className={`${inputClass} font-mono text-[11.5px]`}
          />
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleParse}
              className="border border-line/25 px-3 py-1.5 text-[11px] font-semibold text-ink/70 hover:border-line hover:text-ink"
            >
              불러오기 (파싱)
            </button>
            {parseError && <span className="text-[11px] text-red-500">{parseError}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold text-ink/60">Slug</p>
            <input value={draft.slug} onChange={(e) => patch({ slug: e.target.value.trim() })} className={inputClass} placeholder="2610" />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold text-ink/60">발행 상태</p>
            <select
              value={draft.publishStatus}
              onChange={(e) => patch({ publishStatus: e.target.value as PublishStatus })}
              className={inputClass}
            >
              <option value="draft">비공개 (draft)</option>
              <option value="published">발행 (published)</option>
              <option value="archived">보관 (archived)</option>
            </select>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold text-ink/60">제목 (YYYY.MM + 무드 문구)</p>
          <textarea rows={2} value={draft.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold text-ink/60">예약 발행 시각 (매달 1일 06:00~07:59 KST 권장)</p>
          <input
            type="datetime-local"
            value={toLocalInputValue(draft.scheduledAt)}
            onChange={(e) => patch({ scheduledAt: new Date(e.target.value).toISOString() })}
            className={inputClass}
          />
        </div>

        <ImageUploadField
          label="표지 사진 (3:4)"
          value={draft.coverImage ?? ''}
          onChange={(url) => patch({ coverImage: url })}
          helpText={<p className="mt-1 text-[11px] text-ink/40">0. 플리 표지 폴더의 yymm 표지 파일을 그 달에 맞춰 업로드하세요.</p>}
        />

        <div>
          <p className="mb-1 text-[11px] font-semibold text-ink/60">인스타그램 피드 캡션</p>
          <textarea rows={8} value={draft.caption} onChange={(e) => patch({ caption: e.target.value })} className={inputClass} />
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold text-ink/60">트랙리스트 ({draft.tracks.length}/20, 한 줄에 한 곡 — "Title - Artist")</p>
          <textarea
            rows={12}
            value={draft.tracks.join('\n')}
            onChange={(e) =>
              patch({
                tracks: e.target.value
                  .split('\n')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            className={`${inputClass} font-mono text-[12px]`}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
