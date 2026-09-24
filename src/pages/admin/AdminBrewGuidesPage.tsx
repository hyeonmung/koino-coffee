import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllBrewCategories } from '../../data/repositories/brewCategoryRepository'
import { deleteBrewGuide, getAllBrewGuides } from '../../data/repositories/brewGuideRepository'
import type { BrewGuide } from '../../data/schema'

export default function AdminBrewGuidesPage() {
  const [guides, setGuides] = useState<BrewGuide[]>(() => getAllBrewGuides())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const categories = getAllBrewCategories()
  const categoryLabel = (id?: string) => categories.find((c) => c.id === id)?.label

  const remove = async (id: string) => {
    await deleteBrewGuide(id)
    setConfirmingId(null)
    setGuides(getAllBrewGuides())
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">BREW GUIDE</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-ink">브루잉 레시피 관리</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/brew-guides/categories"
            className="border border-line/25 px-4 py-2.5 text-[12px] font-semibold text-ink/70 hover:border-line hover:text-ink"
          >
            카테고리 관리
          </Link>
          <Link
            to="/admin/brew-tools"
            className="border border-line/25 px-4 py-2.5 text-[12px] font-semibold text-ink/70 hover:border-line hover:text-ink"
          >
            브루잉 도구 관리
          </Link>
          <Link
            to="/admin/brew-guides/new"
            className="border border-line bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
          >
            + 새 브루잉 레시피
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {guides.map((guide) => (
          <div key={guide.id} className="flex items-center justify-between border border-line/15 bg-surface px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">
                {guide.equipment} · {guide.title}
                <span
                  className={`ml-2 border px-1.5 py-0.5 text-[9px] font-semibold tracking-wide ${
                    guide.source === 'OPEN' ? 'border-accent/50 text-accent' : 'border-line/25 text-ink/50'
                  }`}
                >
                  {guide.source === 'OPEN' ? '오픈 레시피' : '코이 레시피'}
                </span>
                {guide.source === 'OPEN' && guide.verificationStatus && guide.verificationStatus !== 'VERIFIED' && (
                  <span className="ml-1.5 border border-red-300 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-red-500">
                    {guide.verificationStatus}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-ink/45">
                {guide.publishStatus === 'published' ? '공개' : '비공개'}
                {categoryLabel(guide.categoryId) && ` · ${categoryLabel(guide.categoryId)}`}
                {guide.source === 'OPEN' && guide.attribution?.creator && ` · 출처: ${guide.attribution.creator}`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Link to={`/admin/brew-guides/${guide.id}`} className="border border-line/20 px-2.5 py-1.5 text-[11px] text-ink/60 hover:border-line hover:text-ink">
                수정
              </Link>
              {confirmingId === guide.id ? (
                <button
                  type="button"
                  onClick={() => remove(guide.id)}
                  className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
                >
                  정말 삭제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(guide.id)}
                  className="border border-line/20 px-2.5 py-1.5 text-[11px] text-ink/60 hover:border-red-400 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {guides.length === 0 && <p className="border border-line/15 bg-surface px-4 py-10 text-center text-[13px] text-ink/40">등록된 가이드가 없습니다.</p>}
      </div>
    </AdminLayout>
  )
}
