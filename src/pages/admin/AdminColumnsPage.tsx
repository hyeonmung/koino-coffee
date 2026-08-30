import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { deleteColumn, getAllColumns } from '../../data/repositories/columnRepository'
import type { Column } from '../../data/schema'
import { formatScheduledAt, isPublished } from '../../utils/scheduledTime'

function statusBadge(column: Column) {
  if (column.publishStatus !== 'published') return { label: '비공개', cls: 'text-navy/40' }
  if (isPublished(column.scheduledAt)) return { label: '게시됨', cls: 'text-green-700' }
  return { label: `예약됨 · ${formatScheduledAt(column.scheduledAt)}`, cls: 'font-semibold text-accent' }
}

export default function AdminColumnsPage() {
  const [columns, setColumns] = useState<Column[]>(() => getAllColumns())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const remove = async (id: string) => {
    await deleteColumn(id)
    setConfirmingId(null)
    setColumns(getAllColumns())
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">COLUMN</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">칼럼 관리</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/columns/schedule"
            className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
          >
            + 이번 주 칼럼 예약하기
          </Link>
          <Link to="/admin/columns/new" className="border border-navy/25 px-4 py-2.5 text-[12px] font-semibold text-navy/70 hover:border-navy hover:text-navy">
            + 낱개로 쓰기
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {columns.map((column) => {
          const badge = statusBadge(column)
          return (
            <div key={column.id} className="flex items-center justify-between border border-navy/15 bg-white px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-navy">{column.title}</p>
                <p className={`text-[11px] ${badge.cls}`}>{badge.label}</p>
              </div>
              <div className="flex gap-1.5">
                <Link
                  to={`/admin/columns/${column.id}`}
                  className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy"
                >
                  수정
                </Link>
                {confirmingId === column.id ? (
                  <button
                    type="button"
                    onClick={() => remove(column.id)}
                    className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
                  >
                    정말 삭제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(column.id)}
                    className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {columns.length === 0 && <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">등록된 칼럼이 없습니다.</p>}
      </div>
    </AdminLayout>
  )
}
