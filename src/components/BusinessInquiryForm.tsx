import { useState, type FormEvent, type ReactNode } from 'react'
import { addInquiry } from '../data/repositories/inquiryRepository'
import type { Inquiry } from '../data/schema'

const INTEREST_OPTIONS = ['원두 납품', '바리스타 교육', '커피 클래스', '카페 컨설팅', '기타']

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  businessType: '',
  region: '',
  interestArea: '',
  expectedVolume: '',
  message: '',
  consent: false,
}

export default function BusinessInquiryForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.companyName.trim() || !form.contactName.trim() || !form.phone.trim() || !form.email.trim() || !form.message.trim()) {
      setError('필수 항목을 모두 입력해 주세요.')
      return
    }
    if (!form.consent) {
      setError('개인정보 수집 및 이용에 동의해 주세요.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const inquiry: Inquiry = {
        id: crypto.randomUUID(),
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        businessType: form.businessType.trim(),
        region: form.region.trim(),
        interestArea: form.interestArea || undefined,
        expectedVolume: form.expectedVolume.trim() || undefined,
        message: form.message.trim(),
        consent: form.consent,
        status: 'new',
        createdAt: new Date().toISOString(),
      }
      await addInquiry(inquiry)
      setDone(true)
      setForm(EMPTY_FORM)
    } catch {
      setError('문의 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="border border-navy/15 bg-white px-6 py-16 text-center">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">문의 접수 완료</p>
        <p className="mt-2 text-[15px] font-semibold text-navy">문의가 정상적으로 접수되었습니다.</p>
        <p className="mt-1 text-[12px] text-navy/55">확인 후 남겨주신 연락처로 순차적으로 답변드리겠습니다.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 border border-navy/25 px-4 py-2 text-[11px] font-semibold text-navy/70 hover:border-navy hover:text-navy"
        >
          새 문의 작성하기
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-navy/15 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="업체명 / 성함 *">
          <input
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="담당자명 *">
          <input
            value={form.contactName}
            onChange={(e) => set('contactName', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="연락처 *">
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="010-0000-0000"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="이메일 *">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="업종 (선택)">
          <input
            value={form.businessType}
            onChange={(e) => set('businessType', e.target.value)}
            placeholder="예: 카페, 레스토랑, 개인"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="지역 (선택)">
          <input
            value={form.region}
            onChange={(e) => set('region', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="관심 분야 (선택)">
          <select
            value={form.interestArea}
            onChange={(e) => set('interestArea', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          >
            <option value="">선택 안 함</option>
            {INTEREST_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="예상 사용량 (선택)">
          <input
            value={form.expectedVolume}
            onChange={(e) => set('expectedVolume', e.target.value)}
            placeholder="예: 월 5kg"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="문의 내용 *">
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            rows={5}
            className="w-full resize-y border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
      </div>

      <label className="mt-5 flex items-start gap-2 text-[11px] text-navy/60">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set('consent', e.target.checked)}
          className="mt-0.5"
        />
        문의 답변을 위해 남겨주신 연락처와 문의 내용을 수집·이용하는 것에 동의합니다. (필수)
      </label>

      {error && <p className="mt-3 text-[11px] text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.1em] text-warm-white hover:bg-navy-light disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {submitting ? '전송 중…' : '문의 보내기'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/50">{label}</span>
      {children}
    </div>
  )
}
