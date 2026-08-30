import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { deleteInquiry, getAllInquiries, updateInquiryStatus } from '../../data/repositories/inquiryRepository'
import type { Inquiry, InquiryStatus } from '../../data/schema'

const STATUS_LABEL: Record<InquiryStatus, string> = { new: '새 문의', read: '확인함', archived: '보관' }

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => getAllInquiries())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const setStatus = async (id: string, status: InquiryStatus) => {
    await updateInquiryStatus(id, status)
    setInquiries(getAllInquiries())
  }

  const remove = async (id: string) => {
    await deleteInquiry(id)
    setConfirmingId(null)
    setInquiries(getAllInquiries())
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">INQUIRIES</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">문의 관리</h1>

      <div className="mt-6 space-y-3">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="border border-navy/15 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[14px] font-semibold text-navy">
                  {inquiry.companyName} <span className="font-normal text-navy/50">· {inquiry.contactName}</span>
                </p>
                <p className="text-[11px] text-navy/45">
                  {inquiry.phone} · {inquiry.email}
                  {inquiry.businessType && ` · ${inquiry.businessType}`}
                  {inquiry.region && ` · ${inquiry.region}`}
                </p>
                {inquiry.interestArea && (
                  <p className="mt-1 inline-block border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-navy/70">
                    {inquiry.interestArea}
                  </p>
                )}
              </div>
              <select
                value={inquiry.status}
                onChange={(e) => setStatus(inquiry.id, e.target.value as InquiryStatus)}
                className="border border-navy/20 bg-white px-2 py-1 text-[11px] text-navy outline-none"
              >
                {(Object.keys(STATUS_LABEL) as InquiryStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            {inquiry.expectedVolume && <p className="mt-2 text-[12px] text-navy/55">예상 사용량: {inquiry.expectedVolume}</p>}
            {inquiry.message && <p className="mt-2 whitespace-pre-wrap text-[12px] text-navy/70">{inquiry.message}</p>}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-navy/35">{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</p>
              {confirmingId === inquiry.id ? (
                <button type="button" onClick={() => remove(inquiry.id)} className="border border-red-400 bg-red-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-600">
                  정말 삭제
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmingId(inquiry.id)} className="text-[10px] text-navy/35 hover:text-red-500">
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {inquiries.length === 0 && <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">접수된 문의가 없습니다.</p>}
      </div>
    </AdminLayout>
  )
}
