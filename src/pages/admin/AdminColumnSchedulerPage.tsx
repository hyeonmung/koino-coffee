import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { batchUpsertColumns, columnSlugExists, getColumnsInWeek } from '../../data/repositories/columnRepository'
import type { Column } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'
import { nextMondayISO, randomMorningTimeHHMM, toScheduledISO, weekDates } from '../../utils/scheduledTime'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

interface RowState {
  skip: boolean
  title: string
  trendSummary: string
  perspective: string
  storeNote: string
  closing: string
  sources: string
  coverImage: string
  time: string
}

function emptyRow(): RowState {
  return {
    skip: false,
    title: '',
    trendSummary: '',
    perspective: '',
    storeNote: '',
    closing: '',
    sources: '',
    coverImage: '',
    time: randomMorningTimeHHMM(),
  }
}

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

export default function AdminColumnSchedulerPage() {
  const navigate = useNavigate()
  const [mondayISO, setMondayISO] = useState(nextMondayISO())
  const [rows, setRows] = useState<RowState[]>(() => Array.from({ length: 7 }, emptyRow))
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<number | null>(null)

  const dates = useMemo(() => weekDates(mondayISO), [mondayISO])
  const existingInWeek = useMemo(() => getColumnsInWeek(mondayISO), [mondayISO])

  const patchRow = (i: number, p: Partial<RowState>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)))
  }

  const reshuffleAll = () => {
    setRows((prev) => prev.map((r) => (r.skip ? r : { ...r, time: randomMorningTimeHHMM() })))
  }

  const activeRows = rows.map((r, i) => ({ ...r, index: i, date: dates[i] })).filter((r) => !r.skip)

  const validate = (): string | null => {
    if (activeRows.length === 0) return '최소 1개 요일은 작성해야 합니다.'
    for (const r of activeRows) {
      if (!r.title.trim() || !r.trendSummary.trim() || !r.perspective.trim()) {
        return `${DAY_LABELS[r.index]}요일: 제목, 트렌드 요약, 코이노니아의 시각은 필수입니다.`
      }
    }
    return null
  }

  const goToConfirm = () => {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setConfirming(true)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const usedSlugs = new Set<string>()
      const now = new Date().toISOString()
      const toSave: Column[] = activeRows.map((r) => {
        const base = slugifyFilename(r.title)
        const suffix = r.date.slice(5).replace('-', '')
        let slug = `${base}-${suffix}`
        let n = 2
        while (columnSlugExists(slug) || usedSlugs.has(slug)) {
          slug = `${base}-${suffix}-${n}`
          n += 1
        }
        usedSlugs.add(slug)
        return {
          id: crypto.randomUUID(),
          slug,
          publishStatus: 'published',
          title: r.title.trim(),
          excerpt: r.trendSummary.trim().slice(0, 80),
          trendSummary: r.trendSummary.trim(),
          perspective: r.perspective.trim(),
          storeNote: r.storeNote.trim() || undefined,
          closing: r.closing.trim() || undefined,
          sources: r.sources.trim() || undefined,
          coverImage: r.coverImage || undefined,
          tags: ['트렌드'],
          scheduledAt: toScheduledISO(r.date, r.time),
          createdAt: now,
          updatedAt: now,
        }
      })
      await batchUpsertColumns(toSave)
      setDone(toSave.length)
    } catch {
      setError('저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setConfirming(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (done !== null) {
    return (
      <AdminLayout>
        <div className="max-w-[520px] border border-navy/15 bg-white px-6 py-14 text-center">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">완료</p>
          <p className="mt-2 text-[16px] font-semibold text-navy">칼럼 {done}건이 예약되었습니다.</p>
          <p className="mt-1 text-[12px] text-navy/55">각 예약 시각이 지나면 자동으로 공개됩니다.</p>
          <button
            type="button"
            onClick={() => navigate('/admin/columns')}
            className="mt-5 border border-navy bg-navy px-4 py-2 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
          >
            칼럼 목록으로
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Link to="/admin/columns" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 칼럼 목록
      </Link>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[22px] font-bold text-navy">이번 주 칼럼 예약하기</h1>
          <p className="mt-1 text-[12px] text-navy/55">월~일 7일치를 한 번에 작성하면, 각 요일에 아침 6~8시 사이 랜덤 시각으로 예약됩니다.</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">시작하는 월요일</span>
          <input type="date" value={mondayISO} onChange={(e) => setMondayISO(e.target.value)} className={inputClass} />
        </label>
      </div>

      {existingInWeek.length > 0 && !confirming && (
        <div className="mt-4 border border-accent/40 bg-accent/10 px-4 py-3 text-[12px] text-navy/70">
          이 주간에는 이미 예약된 칼럼이 {existingInWeek.length}건 있습니다: {existingInWeek.map((c) => c.title).join(', ')}
        </div>
      )}

      {error && <p className="mt-4 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      {!confirming ? (
        <>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={reshuffleAll}
              className="border border-navy/25 px-3 py-1.5 text-[11px] font-semibold text-navy/60 hover:border-navy hover:text-navy"
            >
              🎲 전체 시간 다시 뽑기
            </button>
          </div>

          <div className="mt-3 space-y-5">
            {rows.map((row, i) => (
              <div key={i} className={`border ${row.skip ? 'border-navy/10 bg-navy/[0.02]' : 'border-navy/15 bg-white'} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-navy">
                      {DAY_LABELS[i]}요일 <span className="font-normal text-navy/40">· {dates[i]}</span>
                    </span>
                    {!row.skip && (
                      <span className="flex items-center gap-1.5 text-[11px] text-navy/50">
                        예약 시각
                        <input
                          type="time"
                          value={row.time}
                          min="06:00"
                          max="07:59"
                          onChange={(e) => patchRow(i, { time: e.target.value })}
                          className="border border-navy/25 px-1.5 py-1 text-[12px] text-navy"
                        />
                        <button
                          type="button"
                          onClick={() => patchRow(i, { time: randomMorningTimeHHMM() })}
                          title="다시 뽑기"
                          className="text-navy/40 hover:text-navy"
                        >
                          🎲
                        </button>
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-navy/50">
                    <input type="checkbox" checked={row.skip} onChange={(e) => patchRow(i, { skip: e.target.checked })} />
                    이번 주는 쉬어가기
                  </label>
                </div>

                {!row.skip && (
                  <div className="mt-4 space-y-3">
                    <input value={row.title} onChange={(e) => patchRow(i, { title: e.target.value })} placeholder="제목 *" className={inputClass} />
                    <textarea
                      value={row.trendSummary}
                      onChange={(e) => patchRow(i, { trendSummary: e.target.value })}
                      placeholder="트렌드 요약 · 오늘의 소식 * (빈 줄로 문단 구분)"
                      className={`${inputClass} min-h-[100px]`}
                    />
                    <textarea
                      value={row.perspective}
                      onChange={(e) => patchRow(i, { perspective: e.target.value })}
                      placeholder="코이노니아의 시각 *"
                      className={`${inputClass} min-h-[90px]`}
                    />
                    <textarea
                      value={row.storeNote}
                      onChange={(e) => patchRow(i, { storeNote: e.target.value })}
                      placeholder="우리 매장 이야기 (선택)"
                      className={`${inputClass} min-h-[70px]`}
                    />
                    <textarea
                      rows={2}
                      value={row.closing}
                      onChange={(e) => patchRow(i, { closing: e.target.value })}
                      placeholder="마무리 한마디 (선택)"
                      className={inputClass}
                    />
                    <textarea
                      value={row.sources}
                      onChange={(e) => patchRow(i, { sources: e.target.value })}
                      placeholder="참고 출처 (선택, 한 줄에 하나씩)"
                      className={`${inputClass} min-h-[60px]`}
                    />
                    <ImageUploadField label="이미지 (선택)" value={row.coverImage} onChange={(url) => patchRow(i, { coverImage: url })} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goToConfirm}
            className="mt-6 border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
          >
            예약 확인하기
          </button>
        </>
      ) : (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-navy">아래 내용으로 예약을 확정할까요?</p>
          <div className="mt-3 divide-y divide-navy/10 border border-navy/15 bg-white">
            {activeRows.map((r) => (
              <div key={r.index} className="px-4 py-3">
                <p className="text-[13px] font-semibold text-navy">{r.title}</p>
                <p className="text-[11px] text-navy/45">
                  {DAY_LABELS[r.index]}요일 · {r.date} · {r.time}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="border border-navy/25 px-4 py-2.5 text-[12px] font-semibold text-navy/70 hover:border-navy hover:text-navy"
            >
              돌아가서 수정
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light disabled:opacity-50"
            >
              {submitting ? '예약 중…' : '예약 확정'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
