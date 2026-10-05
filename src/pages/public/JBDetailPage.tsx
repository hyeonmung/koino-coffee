import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import CopyLinkButton from '../../components/CopyLinkButton'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import ShareButton from '../../components/ShareButton'
import StoryBody from '../../components/StoryBody'
import { getPlaylistBySlug } from '../../data/repositories/playlistRepository'

export default function JBDetailPage() {
  const { slug = '' } = useParams()
  const playlist = useMemo(() => getPlaylistBySlug(slug), [slug])

  if (!playlist) return <Navigate to="/jb" replace />

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title={playlist.title} description={playlist.caption.slice(0, 120)} image={playlist.coverImage} />
      <PublicHeader />

      {playlist.coverImage && (
        <div className="w-full bg-canvas py-6">
          <div
            className="mx-auto aspect-[3/4] w-full max-w-[420px] bg-navy/5 bg-cover bg-center"
            style={{ backgroundImage: `url(${playlist.coverImage})` }}
            role="img"
            aria-label={playlist.title}
          />
        </div>
      )}

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">J&B</p>
        <h1 className="mt-1 text-[24px] font-bold leading-tight whitespace-pre-line text-ink">{playlist.title}</h1>
        <div className="mt-3 flex justify-end gap-2">
          <ShareButton
            url={`${window.location.origin}/jb/${playlist.slug}`}
            title={playlist.title}
            className="border border-line/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink hover:border-line"
          />
          <CopyLinkButton
            url={`${window.location.origin}/jb/${playlist.slug}`}
            className="border border-line/25 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink hover:border-line"
          />
        </div>

        <div className="mt-8 border-t border-line/15 pt-8">
          <StoryBody body={playlist.caption} />
        </div>

        <div className="mt-10 border-t border-line/10 pt-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-accent font-kicker">TRACKLIST</p>
          <ol className="mt-3 space-y-2">
            {playlist.tracks.map((track, i) => {
              const [titlePart, artistPart] = track.split(/\s-\s(.+)/)
              return (
                <li key={i} className="flex gap-3 text-[13px] leading-snug">
                  <span className="w-5 shrink-0 text-right font-semibold tabular-nums text-ink/35">{i + 1}</span>
                  <span className="text-ink/80">
                    {titlePart}
                    {artistPart && <span className="text-ink/45"> — {artistPart}</span>}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
