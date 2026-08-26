import { useState, type FormEvent } from 'react'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { addInquiry } from '../../data/repositories/inquiryRepository'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import type { Inquiry } from '../../data/schema'

const inputClass =
  'w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none placeholder:text-navy/35 focus:border-navy'

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

export default function BusinessPage() {
  const settings = getSiteSettings()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const patch = (p: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...p }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.companyName.trim() || !form.contactName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('업체명, 담당자, 전화번호, 이메일은 필수 입력 항목입니다.')
      return
    }
    if (!form.consent) {
      setError('개인정보 수집 및 이용에 동의해주세요.')
      return
    }
    setError(null)
    const inquiry: Inquiry = {
      id: crypto.randomUUID(),
      ...form,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    addInquiry(inquiry)
    setSubmitted(true)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="납품 · 교육" description={settings.businessIntro} />
      <PublicHeader />

      <main className="mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BUSINESS</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">납품 · 교육</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-navy/60">{settings.businessIntro}</p>

        {settings.businessSections.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {settings.businessSections.map((section) => (
              <div key={section.key} className="border border-navy/15 bg-white p-5">
                <p className="font-serif text-[15px] font-bold text-navy">{section.title}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-navy/60">{section.body}</p>
              </div>
            ))}
          </div>
        )}

        {submitted ? (
          <div className="mt-10 border border-navy/15 bg-white px-6 py-12 text-center">
            <p className="font-serif text-[18px] font-bold text-navy">문의가 접수되었습니다.</p>
            <p className="mt-2 text-[13px] text-navy/55">빠른 시일 내에 담당자가 연락드리겠습니다.</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-5 border border-navy px-4 py-2 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
            >
              새 문의 작성
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4 border border-navy/15 bg-white p-6">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">문의하기</p>
            {error && <p className="border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

            {settings.businessSections.length > 0 && (
              <FormField label="관심 분야">
                <select
                  value={form.interestArea}
                  onChange={(e) => patch({ interestArea: e.target.value })}
                  className={inputClass}
                >
                  <option value="">선택 안함</option>
                  {settings.businessSections.map((section) => (
                    <option key={section.key} value={section.title}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="업체명 *">
                <input value={form.companyName} onChange={(e) => patch({ companyName: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="담당자 *">
                <input value={form.contactName} onChange={(e) => patch({ contactName: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="전화번호 *">
                <input value={form.phone} onChange={(e) => patch({ phone: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="이메일 *">
                <input type="email" value={form.email} onChange={(e) => patch({ email: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="업종">
                <input value={form.businessType} onChange={(e) => patch({ businessType: e.target.value })} className={inputClass} placeholder="카페, 레스토랑 등" />
              </FormField>
              <FormField label="지역">
                <input value={form.region} onChange={(e) => patch({ region: e.target.value })} className={inputClass} />
              </FormField>
            </div>

            <FormField label="예상 사용량">
              <input
                value={form.expectedVolume}
                onChange={(e) => patch({ expectedVolume: e.target.value })}
                className={inputClass}
                placeholder="예: 월 20kg"
              />
            </FormField>

            <FormField label="문의 내용">
              <textarea
                value={form.message}
                onChange={(e) => patch({ message: e.target.value })}
                className={`${inputClass} min-h-[100px]`}
              />
            </FormField>

            <label className="flex items-start gap-2 text-[12px] text-navy/70">
              <input type="checkbox" checked={form.consent} onChange={(e) => patch({ consent: e.target.checked })} className="mt-0.5" />
              문의 처리를 위한 개인정보 수집 및 이용에 동의합니다. *
            </label>

            <button
              type="submit"
              className="w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.15em] text-warm-white hover:bg-navy-light"
            >
              문의 제출
            </button>
          </form>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}
