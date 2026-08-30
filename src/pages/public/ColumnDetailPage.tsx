import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import StoryBody from '../../components/StoryBody'
import { getColumnBySlug } from '../../data/repositories/columnRepository'
import { formatScheduledAt } from '../../utils/scheduledTime'

export default function ColumnDetailPage() {
  const { slug = '' } = useParams()
  const column = useMemo(() => getColumnBySlug(slug), [slug])

  if (!column) return <Navigate to="/column" replace />

  const sourceLines = (column.sources ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={column.seoTitle || column.title} description={column.seoDescription || column.excerpt} image={column.coverImage} />
      <PublicHeader />

      {column.coverImage && (
        <div
          className="aspect-[21/9] w-full bg-navy/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${column.coverImage})` }}
          role="img"
          aria-label={column.title}
        />
      )}

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">COLUMN</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight whitespace-pre-line text-navy">{column.title}</h1>
        <p className="mt-2 text-[11px] text-navy/40">{formatScheduledAt(column.scheduledAt)}</p>

        <div className="mt-8 border-t border-navy/15 pt-8">
          <StoryBody body={column.trendSummary} />
        </div>

        <div className="mt-8 border-l-[3px] border-accent bg-white px-5 py-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-accent">코이노니아의 시각</p>
          <div className="mt-2">
            <StoryBody body={column.perspective} />
          </div>
        </div>

        {column.storeNote && (
          <div className="mt-6 bg-navy/[0.03] px-5 py-5">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-navy/45">우리 매장 이야기</p>
            <div className="mt-2">
              <StoryBody body={column.storeNote} />
            </div>
          </div>
        )}

        {column.closing && <p className="mt-8 text-[14px] italic leading-relaxed text-navy/70">{column.closing}</p>}

        {column.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-1.5">
            {column.tags.map((tag) => (
              <span key={tag} className="border border-navy/15 px-2 py-1 text-[10px] text-navy/50">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {sourceLines.length > 0 && (
          <div className="mt-10 border-t border-navy/10 pt-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">참고</p>
            <ul className="mt-2 space-y-1">
              {sourceLines.map((line, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-navy/45">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
