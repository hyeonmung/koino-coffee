import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getVisibleBrewCategories } from '../../data/repositories/brewCategoryRepository'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'

export default function BrewGuideIndexPage() {
  const guides = getPublishedBrewGuides()
  const categories = getVisibleBrewCategories()
  const [categoryId, setCategoryId] = useState<'ALL' | string>('ALL')

  const usedCategoryIds = new Set(guides.map((g) => g.categoryId).filter(Boolean))
  const availableCategories = categories.filter((c) => usedCategoryIds.has(c.id))

  const filtered = categoryId === 'ALL' ? guides : guides.filter((g) => g.categoryId === categoryId)
  const categoryLabel = (id?: string) => categories.find((c) => c.id === id)?.label

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="브루 가이드" description="장비별 KOINO 원두 추출 레시피." />
      <PublicHeader />

      <main className="w-full min-w-0 flex-1 mx-auto max-w-[1000px] px-6 pb-20 pt-10 sm:pb-32 lg:pb-52">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BREW GUIDE</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">집에서 더 맛있게</h1>
        <p className="mt-2 max-w-[560px] text-[13px] text-navy/55">
          추출 방식과 장비, 물과 분쇄, 레시피 설계부터 트러블슈팅까지 — 코이노니아의 추출 노트입니다.
        </p>

        {availableCategories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-navy/15">
            <button
              type="button"
              onClick={() => setCategoryId('ALL')}
              className={`border-b-2 pb-3 text-[13px] font-semibold tracking-wide transition-colors ${
                categoryId === 'ALL' ? 'border-navy text-navy' : 'border-transparent text-navy/50 hover:text-navy'
              }`}
            >
              전체
            </button>
            {availableCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`border-b-2 pb-3 text-[13px] font-semibold tracking-wide transition-colors ${
                  categoryId === c.id ? 'border-navy text-navy' : 'border-transparent text-navy/50 hover:text-navy'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            등록된 브루 가이드가 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((guide) => (
              <Link key={guide.id} to={`/brew-guide/${guide.slug}`} className="border border-navy/15 bg-white p-6 hover:border-navy">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">
                  {categoryLabel(guide.categoryId) ?? guide.equipment}
                  {categoryLabel(guide.categoryId) && ` · ${guide.equipment}`}
                </p>
                <p className="mt-1 font-serif text-[18px] font-bold text-navy">{guide.title}</p>
                {(guide.coffeeDose || guide.ratio || guide.totalTime) && (
                  <p className="mt-2 text-[12px] text-navy/55">
                    {[guide.coffeeDose, guide.ratio, guide.totalTime].filter(Boolean).join(' · ')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
