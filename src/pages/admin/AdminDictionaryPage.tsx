import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  deleteDictionaryTerm,
  getAllDictionaryTerms,
  upsertDictionaryTerm,
} from '../../data/repositories/dictionaryRepository'
import type { DictionaryCategory, DictionaryTerm } from '../../data/schema'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

const CATEGORIES: DictionaryCategory[] = ['FLAVOR', 'SENSORY', 'PROCESS', 'VARIETY', 'GENERAL']

function emptyTerm(): DictionaryTerm {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    term: '',
    category: 'GENERAL',
    shortDefinition: '',
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminDictionaryPage() {
  const [terms, setTerms] = useState<DictionaryTerm[]>(() => getAllDictionaryTerms())
  const [editing, setEditing] = useState<DictionaryTerm | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const refresh = () => setTerms(getAllDictionaryTerms())

  const save = async () => {
    if (!editing || !editing.term.trim() || !editing.shortDefinition.trim()) return
    await upsertDictionaryTerm({ ...editing, updatedAt: new Date().toISOString() })
    setEditing(null)
    refresh()
  }

  const remove = async (id: string) => {
    await deleteDictionaryTerm(id)
    setConfirmingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">DICTIONARY</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">커피 사전 관리</h1>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyTerm())}
          className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          + 새 용어 추가
        </button>
      </div>

      {editing && (
        <div className="mt-6 max-w-[560px] space-y-3 border border-navy/15 bg-white p-6">
          <p className="text-[11px] font-semibold text-navy/50">
            {terms.some((t) => t.id === editing.id) ? '용어 수정' : '새 용어'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="영문 (Term) *">
              <input value={editing.term} onChange={(e) => setEditing({ ...editing, term: e.target.value })} className={inputClass} />
            </Field>
            <Field label="한글">
              <input value={editing.termKo ?? ''} onChange={(e) => setEditing({ ...editing, termKo: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="분류 (Category)">
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as DictionaryCategory })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="뜻 · 쉽게 말하면 (Short Definition) *">
            <textarea
              value={editing.shortDefinition}
              onChange={(e) => setEditing({ ...editing, shortDefinition: e.target.value })}
              className={`${inputClass} min-h-[60px]`}
            />
          </Field>
          <Field label="이런 느낌입니다 (Easy Explanation)">
            <textarea
              value={editing.detailedDefinition ?? ''}
              onChange={(e) => setEditing({ ...editing, detailedDefinition: e.target.value })}
              className={`${inputClass} min-h-[60px]`}
            />
          </Field>
          <Field label="예를 들면 (Example)">
            <textarea
              value={editing.example ?? ''}
              onChange={(e) => setEditing({ ...editing, example: e.target.value })}
              className={`${inputClass} min-h-[60px]`}
            />
          </Field>
          <div className="flex gap-2">
            <button type="button" onClick={save} className="border border-navy bg-navy px-4 py-2 text-[12px] font-semibold text-warm-white hover:bg-navy-light">
              저장
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-navy/25 px-4 py-2 text-[12px] text-navy/60 hover:border-navy">
              취소
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 divide-y divide-navy/10 border-t border-navy/15">
        {terms.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-[13px] font-semibold text-navy">
                {t.term} {t.termKo && <span className="font-normal text-navy/45">· {t.termKo}</span>}
              </p>
              <p className="text-[11px] text-navy/50">{t.shortDefinition}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button type="button" onClick={() => setEditing(t)} className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy">
                수정
              </button>
              {confirmingId === t.id ? (
                <button type="button" onClick={() => remove(t.id)} className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">
                  정말 삭제
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmingId(t.id)} className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500">
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {terms.length === 0 && <p className="py-10 text-center text-[13px] text-navy/40">등록된 용어가 없습니다.</p>}
      </div>

      <p className="mt-6 text-[11px] text-navy/40">
        Flavor Notes(향미 단어)는 별도로{' '}
        <a href="#/admin/flavors" className="underline">
          향미 관리
        </a>
        에서 등록합니다.
      </p>
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
