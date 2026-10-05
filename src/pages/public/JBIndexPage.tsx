import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedPlaylists } from '../../data/repositories/playlistRepository'

export default function JBIndexPage() {
  const playlists = useMemo(() => getPublishedPlaylists(), [])

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SEO title="J&B" description="코이노니아 로스터스 매장에서 매달 공유하는 Jazzy & Bluesy 플레이리스트." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">J&B</p>
        <h1 className="mt-1 text-[28px] font-bold text-ink">Jazzy & Bluesy</h1>
        <p className="mt-2 text-[13px] text-ink/55">매달 1일, 매장에서 흘러나오는 재즈 & 블루스 플레이리스트 20곡을 공유합니다.</p>

        {playlists.length === 0 ? (
          <p className="mt-10 border border-line/15 bg-surface px-6 py-16 text-center text-[13px] text-ink/45">
            아직 등록된 플레이리스트가 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10">
            {playlists.map((playlist) => (
              <Link key={playlist.id} to={`/jb/${playlist.slug}`} className="group block">
                <div className="aspect-[3/4] w-full overflow-hidden bg-navy/5">
                  {playlist.coverImage ? (
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${playlist.coverImage})` }}
                      role="img"
                      aria-label={playlist.title}
                    />
                  ) : (
                    <div className="koi-night-sky flex h-full w-full items-end p-3">
                      <p className="text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">J&B</p>
                    </div>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-[14px] font-semibold leading-snug text-ink">{playlist.title}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
