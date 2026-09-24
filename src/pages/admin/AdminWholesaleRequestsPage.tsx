import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { deleteWholesaleRequest, getAllWholesaleRequests, updateWholesaleRequestStatus } from '../../data/repositories/wholesaleRequestRepository'
import type { InquiryStatus, WholesaleRequest } from '../../data/schema'

const STATUS_LABEL: Record<InquiryStatus, string> = { new: '새 신청', read: '확인함', archived: '보관' }

export default function AdminWholesaleRequestsPage() {
  const [requests, setRequests] = useState<WholesaleRequest[]>(() => getAllWholesaleRequests())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const setStatus = async (id: string, status: InquiryStatus) => {
    await updateWholesaleRequestStatus(id, status)
    setRequests(getAllWholesaleRequests())
  }

  const remove = async (id: string) => {
    await deleteWholesaleRequest(id)
    setConfirmingId(null)
    setRequests(getAllWholesaleRequests())
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">WHOLESALE ORDERS</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-ink">원두 납품 신청</h1>
      <p className="mt-1 text-[12px] text-ink/50">납품·교육 &gt; 원두 납품 게시물의 공개 신청 폼으로 접수된 내역입니다.</p>

      <div className="mt-6 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="border border-line/15 bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[14px] font-semibold text-ink">{r.name}</p>
                <p className="text-[11px] text-ink/45">{r.phone}</p>
                <p className="mt-1 text-[12px] text-ink/70">{r.address}</p>
              </div>
              <select
                value={r.status}
                onChange={(e) => setStatus(r.id, e.target.value as InquiryStatus)}
                className="border border-line/20 bg-surface px-2 py-1 text-[11px] text-ink outline-none"
              >
                {(Object.keys(STATUS_LABEL) as InquiryStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink/60">
              {r.coffeeType && <span>원두 종류: {r.coffeeType}</span>}
              {r.expectedKg && <span>예상 kg: {r.expectedKg}</span>}
              {r.orderFrequency && <span>주문 주기: {r.orderFrequency}</span>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-ink/35">{new Date(r.createdAt).toLocaleString('ko-KR')}</p>
              {confirmingId === r.id ? (
                <button type="button" onClick={() => remove(r.id)} className="border border-red-400 bg-red-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-600">
                  정말 삭제
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmingId(r.id)} className="text-[10px] text-ink/35 hover:text-red-500">
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="border border-line/15 bg-surface px-4 py-10 text-center text-[13px] text-ink/40">접수된 신청이 없습니다.</p>
        )}
      </div>
    </AdminLayout>
  )
}
