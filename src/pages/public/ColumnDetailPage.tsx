import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ColumnLikeButton from '../../components/ColumnLikeButton'
import CopyLinkButton from '../../components/CopyLinkButton'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import ShareButton from '../../components/ShareButton'
import StoryBody from '../../components/StoryBody'
import { getColumnBySlug, incrementColumnViews } from '../../data/repositories/columnRepository'
import useIncrementViewOnce from '../../hooks/useIncrementViewOnce'
import { formatScheduledAt } from '../../utils/scheduledTime'

export default function ColumnDetailPage() {
  const { slug = '' } = useParams()
  const column = useMemo(() => getColumnBySlug(slug), [slug])

  const displayViews = useIncrementViewOnce(column?.id, column?.views ?? 0, incrementColumnViews)

  if (!column) return <Navigate to="/thekoimag" replace />

  const sourceLines = (column.sources ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title={column.seoTitle || column.title} description={column.seoDescription || column.excerpt} image={column.coverImage} />
      <PublicHeader />

      {column.coverImage && (
        <div className="w-full bg-canvas py-6">
          <div
            className="mx-auto aspect-coffee-card w-full max-w-[820px] bg-navy/5 bg-cover bg-center"
            style={{ backgroundImage: `url(${column.coverImage})` }}
            role="img"
            aria-label={column.title}
          />
        </div>
      )}

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">COLUMN</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight whitespace-pre-line text-ink">{column.title}</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-ink/40">
              {formatScheduledAt(column.scheduledAt)} · 조회 {displayViews.toLocaleString()}
            </p>
            <ColumnLikeButton slug={column.slug} count={column.likeCount} className="text-ink/40" />
          </div>
          <div className="flex gap-2">
            <ShareButton
              url={`${window.location.origin}/thekoimag/${column.slug}`}
              title={column.title}
              className="border border-line/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink hover:border-line"
            />
            <CopyLinkButton
              url={`${window.location.origin}/thekoimag/${column.slug}`}
              className="border border-line/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink hover:border-line"
            />
          </div>
        </div>

        <div className="mt-8 border-t border-line/15 pt-8">
          <StoryBody body={column.trendSummary} />
        </div>

        <div className="mt-8 border-l-[3px] border-accent bg-surface px-5 py-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-accent font-kicker">코이노니아 로스터스의 시각</p>
          <div className="mt-2">
            <StoryBody body={column.perspective} />
          </div>
        </div>

        {column.storeNote && (
          <div className="mt-6 bg-line/[0.03] px-5 py-5">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-ink/45">우리 매장 이야기</p>
            <div className="mt-2">
              <StoryBody body={column.storeNote} />
            </div>
          </div>
        )}

        {column.closing && <p className="mt-8 text-[14px] italic leading-relaxed text-ink/70">{column.closing}</p>}

        {column.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-1.5">
            {column.tags.map((tag) => (
              <span key={tag} className="border border-line/15 px-2 py-1 text-[10px] text-ink/50">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {sourceLines.length > 0 && (
          <div className="mt-10 border-t border-line/10 pt-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-ink/40">참고</p>
            <ul className="mt-2 space-y-1">
              {sourceLines.map((line, i) => (
                <li key={i} className="text-[11px] leading-relaxed text-ink/45">
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
