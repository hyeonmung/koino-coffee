import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { CHARACTER_INFO } from '../../constants/characters'
import { checkCompleteness } from '../../data/completeness'
import type { Coffee, PublishStatus } from '../../data/schema'
import { deleteCoffee, getAllCoffees, upsertCoffee } from '../../data/repositories/coffeeRepository'
import { CUP_CHARACTERS, type CupCharacter } from '../../types'

const STATUS_LABEL: Record<PublishStatus, string> = { draft: '초안', published: '공개', archived: '보관' }

export default function AdminCoffeeListPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [query, setQuery] = useState('')
  const [character, setCharacter] = useState<'ALL' | CupCharacter>('ALL')
  const [status, setStatus] = useState<'ALL' | PublishStatus>('ALL')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    setCoffees(getAllCoffees())
  }, [])

  useEffect(() => {
    if (!confirmingId) return
    const t = setTimeout(() => setConfirmingId(null), 4000)
    return () => clearTimeout(t)
  }, [confirmingId])

  const refresh = () => setCoffees(getAllCoffees())

  const filtered = coffees
    .filter((c) => character === 'ALL' || c.character === character)
    .filter((c) => status === 'ALL' || c.publishStatus === status)
    .filter((c) => !query.trim() || c.coffeeName.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const setPublishStatus = (coffee: Coffee, publishStatus: PublishStatus) => {
    upsertCoffee({ ...coffee, publishStatus, updatedAt: new Date().toISOString() })
    refresh()
  }

  const toggleFeatured = (coffee: Coffee) => {
    upsertCoffee({ ...coffee, featured: !coffee.featured, updatedAt: new Date().toISOString() })
    refresh()
  }

  const duplicate = (coffee: Coffee) => {
    const now = new Date().toISOString()
    const copy: Coffee = {
      ...coffee,
      id: crypto.randomUUID(),
      slug: `${coffee.slug}-copy-${Date.now().toString(36)}`,
      coffeeName: `${coffee.coffeeName} (Copy)`,
      publishStatus: 'draft',
      featured: false,
      isSample: false,
      createdAt: now,
      updatedAt: now,
    }
    upsertCoffee(copy)
    refresh()
  }

  const remove = (id: string) => {
    deleteCoffee(id)
    setConfirmingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COFFEE MANAGEMENT</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">원두 관리</h1>
        </div>
        <Link
          to="/admin/coffees/new"
          className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
        >
          + 새 원두 등록
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="원두 이름 검색"
          className="min-w-[200px] flex-1 border border-navy/25 bg-white px-3 py-2 text-[12px] text-navy outline-none placeholder:text-navy/35 focus:border-navy"
        />
        <select
          value={character}
          onChange={(e) => setCharacter(e.target.value as 'ALL' | CupCharacter)}
          className="border border-navy/25 bg-white px-2 py-2 text-[12px] text-navy outline-none"
        >
          <option value="ALL">전체 Character</option>
          {CUP_CHARACTERS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'ALL' | PublishStatus)}
          className="border border-navy/25 bg-white px-2 py-2 text-[12px] text-navy outline-none"
        >
          <option value="ALL">전체 상태</option>
          <option value="published">공개</option>
          <option value="draft">초안</option>
          <option value="archived">보관</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto border border-navy/15 bg-white">
        <table className="w-full min-w-[880px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-navy/15 bg-warm-white text-left text-[10px] font-semibold tracking-wide text-navy/45">
              <th className="px-3 py-2">이름</th>
              <th className="px-3 py-2">Character</th>
              <th className="px-3 py-2">산지</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">Featured</th>
              <th className="px-3 py-2">완성도</th>
              <th className="px-3 py-2 text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((coffee) => (
              <tr key={coffee.id} className="border-b border-navy/10">
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-navy">{coffee.coffeeName}</p>
                  {coffee.isSample && <span className="text-[10px] text-accent">SAMPLE</span>}
                </td>
                <td className="px-3 py-2.5 text-navy/70">{CHARACTER_INFO[coffee.character].label}</td>
                <td className="px-3 py-2.5 text-navy/70">{coffee.country}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={coffee.publishStatus}
                    onChange={(e) => setPublishStatus(coffee, e.target.value as PublishStatus)}
                    className="border border-navy/20 bg-white px-1.5 py-1 text-[11px] text-navy outline-none"
                  >
                    {(Object.keys(STATUS_LABEL) as PublishStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(coffee)}
                    className={`border px-2 py-1 text-[10px] font-semibold ${
                      coffee.featured ? 'border-accent bg-accent/20 text-navy' : 'border-navy/20 text-navy/40'
                    }`}
                  >
                    {coffee.featured ? '★ Featured' : '☆'}
                  </button>
                </td>
                <td className="px-3 py-2.5" title={checkCompleteness(coffee).missing.slice(0, 3).join(', ')}>
                  <span className="text-navy/60">{checkCompleteness(coffee).percent}%</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    {coffee.publishStatus === 'published' && (
                      <a
                        href={`#/coffees/${coffee.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60 hover:border-navy hover:text-navy"
                      >
                        보기
                      </a>
                    )}
                    <Link
                      to={`/admin/coffees/${coffee.id}`}
                      className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60 hover:border-navy hover:text-navy"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() => duplicate(coffee)}
                      className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60 hover:border-navy hover:text-navy"
                    >
                      복제
                    </button>
                    {confirmingId === coffee.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(coffee.id)}
                          className="border border-red-400 bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                        >
                          정말 삭제
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(coffee.id)}
                        className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60 hover:border-red-400 hover:text-red-500"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-navy/40">
                  조건에 맞는 원두가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
