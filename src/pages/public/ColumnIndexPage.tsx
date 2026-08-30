import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import QuickAddColumnForm from '../../components/QuickAddColumnForm'
import SEO from '../../components/SEO'
import { OWNER_EMAIL } from '../../constants/owner'
import { getPublishedColumns } from '../../data/repositories/columnRepository'
import { useSupabaseSession } from '../../hooks/useSupabaseSession'
import { formatScheduledAt } from '../../utils/scheduledTime'

export default function ColumnIndexPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const columns = useMemo(() => getPublishedColumns(), [refreshKey])
  const session = useSupabaseSession()
  const isOwner = session?.user.email === OWNER_EMAIL
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="칼럼" description="원두 트렌드와 업계 소식에 코이노니아의 시각을 더한 칼럼." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COLUMN</p>
            <h1 className="mt-1 text-[28px] font-bold text-navy">칼럼</h1>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
            >
              + 글쓰기
            </button>
          )}
        </div>
        <p className="mt-2 text-[13px] text-navy/55">커피 업계 소식과 트렌드에 코이노니아의 생각을 더해 씁니다.</p>

        {quickAddOpen && (
          <QuickAddColumnForm
            onClose={() => setQuickAddOpen(false)}
            onCreated={() => {
              setQuickAddOpen(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}

        {columns.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            아직 등록된 칼럼이 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {columns.map((column) => (
              <Link key={column.id} to={`/column/${column.slug}`} className="group block">
                {column.coverImage ? (
                  <div className="aspect-[3/2] w-full overflow-hidden">
                    <div
                      className="h-full w-full bg-navy/5 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${column.coverImage})` }}
                      role="img"
                      aria-label={column.title}
                    />
                  </div>
                ) : (
                  <div className="koi-night-sky relative flex aspect-[3/2] w-full items-end overflow-hidden p-4">
                    <KOIStarField />
                    <p className="relative text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">KOINONIA</p>
                  </div>
                )}
                <p className="mt-3 text-[10px] font-semibold tracking-[0.15em] text-navy/45">COLUMN</p>
                <p className="mt-1 whitespace-pre-line text-[18px] font-bold text-navy">{column.title}</p>
                <p className="mt-2 whitespace-pre-line text-[12px] text-navy/55">{column.excerpt}</p>
                <p className="mt-3 text-[10px] text-navy/35">{formatScheduledAt(column.scheduledAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
