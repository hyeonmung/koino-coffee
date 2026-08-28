import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import {
  brewCategorySlugExists,
  deleteBrewCategory,
  getAllBrewCategories,
  upsertBrewCategory,
} from '../../data/repositories/brewCategoryRepository'
import type { BrewCategory } from '../../data/schema'
import { slugifyFilename } from '../../utils/download'

const inputClass = 'border border-navy/25 bg-white px-2 py-1.5 text-[12px] text-navy outline-none focus:border-navy'

export default function AdminBrewCategoriesPage() {
  const [categories, setCategories] = useState<BrewCategory[]>(() => getAllBrewCategories())
  const [label, setLabel] = useState('')
  const [labelEn, setLabelEn] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const refresh = () => setCategories(getAllBrewCategories())

  const handleAdd = async () => {
    if (!label.trim()) return
    const slug = slugifyFilename(labelEn.trim() || label.trim())
    if (brewCategorySlugExists(slug)) {
      setError(`"${slug}" slug은 이미 사용 중입니다. 영문 이름을 다르게 입력해주세요.`)
      return
    }
    setError(null)
    await upsertBrewCategory({
      id: crypto.randomUUID(),
      slug,
      label: label.trim(),
      labelEn: labelEn.trim() || label.trim().toUpperCase(),
      order: categories.length,
      visible: true,
    })
    setLabel('')
    setLabelEn('')
    refresh()
  }

  const move = async (category: BrewCategory, direction: -1 | 1) => {
    const idx = categories.findIndex((c) => c.id === category.id)
    const target = categories[idx + direction]
    if (!target) return
    await upsertBrewCategory({ ...category, order: target.order })
    await upsertBrewCategory({ ...target, order: category.order })
    refresh()
  }

  const toggleVisible = async (category: BrewCategory) => {
    await upsertBrewCategory({ ...category, visible: !category.visible })
    refresh()
  }

  const rename = async (category: BrewCategory, patch: Partial<BrewCategory>) => {
    await upsertBrewCategory({ ...category, ...patch })
    refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteBrewCategory(id)
    setConfirmingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <Link to="/admin/brew-guides" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
        ← 브루 가이드 목록
      </Link>
      <p className="mt-2 text-[10px] font-semibold tracking-[0.25em] text-accent">BREW CATEGORY</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">브루 가이드 카테고리 관리</h1>
      <p className="mt-2 max-w-[560px] text-[12px] text-navy/50">
        핸드드립·에스프레소 같은 전문 카테고리입니다. V60·Espresso 같은 장비(Equipment)와는 별도로 관리되며, 브루
        가이드 작성 화면에서 카테고리를 선택합니다.
      </p>

      {error && <p className="mt-3 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap items-end gap-2 border border-navy/15 bg-white p-4">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-navy/60">카테고리명 (한글)</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="예: 레시피 설계" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-navy/60">영문 표기 (선택)</span>
          <input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} className={inputClass} placeholder="예: RECIPE DESIGN" />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="border border-navy bg-navy px-4 py-1.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          + 카테고리 추가
        </button>
      </div>

      <div className="mt-6 divide-y divide-navy/10 border border-navy/15 bg-white">
        {categories.map((category, idx) => (
          <div key={category.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(category, -1)}
                disabled={idx === 0}
                className="text-[10px] text-navy/40 hover:text-navy disabled:opacity-20"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(category, 1)}
                disabled={idx === categories.length - 1}
                className="text-[10px] text-navy/40 hover:text-navy disabled:opacity-20"
              >
                ▼
              </button>
            </div>

            <input
              value={category.label}
              onChange={(e) => rename(category, { label: e.target.value })}
              className={`${inputClass} w-40`}
            />
            <input
              value={category.labelEn}
              onChange={(e) => rename(category, { labelEn: e.target.value })}
              className={`${inputClass} w-40`}
            />
            <span className="text-[10px] text-navy/30">/{category.slug}</span>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleVisible(category)}
                className={`border px-2.5 py-1 text-[10px] font-semibold ${
                  category.visible ? 'border-navy/20 text-navy/60' : 'border-navy/20 bg-navy/5 text-navy/35'
                }`}
              >
                {category.visible ? '공개' : '숨김'}
              </button>
              {confirmingId === category.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
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
                  onClick={() => setConfirmingId(category.id)}
                  className="border border-navy/20 px-2 py-1 text-[10px] text-navy/60 hover:border-red-400 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
