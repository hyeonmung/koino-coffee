import { useState, type FormEvent, type ReactNode } from 'react'
import { getPublishedCoffees } from '../data/repositories/coffeeRepository'
import { addWholesaleRequest } from '../data/repositories/wholesaleRequestRepository'
import type { WholesaleRequest } from '../data/schema'

const EMPTY = {
  name: '',
  phone: '',
  address: '',
  coffeeType: '',
  expectedKg: '',
  orderFrequency: '',
}

export default function WholesaleOrderForm() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const coffeeNames = getPublishedCoffees().map((c) => c.coffeeName)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('성함, 연락처, 주소는 필수입니다.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const request: WholesaleRequest = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        coffeeType: form.coffeeType.trim(),
        expectedKg: form.expectedKg.trim(),
        orderFrequency: form.orderFrequency.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
      }
      await addWholesaleRequest(request)
      setDone(true)
      setForm(EMPTY)
    } catch {
      setError('신청 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="border border-navy/15 bg-white px-6 py-16 text-center">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">신청 접수 완료</p>
        <p className="mt-2 text-[15px] font-semibold text-navy">원두 납품 신청이 정상적으로 접수되었습니다.</p>
        <p className="mt-1 text-[12px] text-navy/55">확인 후 남겨주신 연락처로 순차적으로 안내드리겠습니다.</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 border border-navy/25 px-4 py-2 text-[11px] font-semibold text-navy/70 hover:border-navy hover:text-navy"
        >
          새로 신청하기
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-navy/15 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="성함 *">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="연락 가능한 번호 *">
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="010-0000-0000"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="납품 받으실 주소 *">
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="원하시는 원두 종류 (선택)">
          <input
            value={form.coffeeType}
            onChange={(e) => set('coffeeType', e.target.value)}
            list="wholesale-coffee-names"
            placeholder="예: 에티오피아 계열"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
          <datalist id="wholesale-coffee-names">
            {coffeeNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>
        <Field label="예상 kg (선택)">
          <input
            value={form.expectedKg}
            onChange={(e) => set('expectedKg', e.target.value)}
            placeholder="예: 월 5kg"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
        <Field label="주문 예상 주기 (선택)">
          <input
            value={form.orderFrequency}
            onChange={(e) => set('orderFrequency', e.target.value)}
            placeholder="예: 2주에 한 번"
            className="w-full border border-navy/25 bg-white px-3 py-2.5 text-[13px] text-navy outline-none focus:border-navy"
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-[11px] text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full border border-navy bg-navy py-3 text-[13px] font-semibold tracking-[0.1em] text-warm-white hover:bg-navy-light disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {submitting ? '전송 중…' : '납품 신청하기'}
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
