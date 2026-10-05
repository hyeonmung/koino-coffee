import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { deletePlaylist, getAllPlaylists } from '../../data/repositories/playlistRepository'
import type { Playlist } from '../../data/schema'
import { formatScheduledAt, isPublished } from '../../utils/scheduledTime'

function statusBadge(playlist: Playlist) {
  if (playlist.publishStatus !== 'published') return { label: '비공개', cls: 'text-ink/40' }
  if (isPublished(playlist.scheduledAt)) return { label: `게시됨 · ${formatScheduledAt(playlist.scheduledAt)}`, cls: 'text-green-700' }
  return { label: `예약됨 · ${formatScheduledAt(playlist.scheduledAt)}`, cls: 'font-semibold text-accent' }
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getAllPlaylists())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const remove = async (id: string) => {
    await deletePlaylist(id)
    setConfirmingId(null)
    setPlaylists(getAllPlaylists())
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">J&B</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-ink">J&B 플레이리스트 관리</h1>
        </div>
        <Link to="/admin/playlists/new" className="border border-line bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light">
          + 이번 달 추가
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {playlists.length === 0 && <p className="text-[13px] text-ink/45">등록된 플레이리스트가 없습니다.</p>}
        {playlists.map((playlist) => {
          const badge = statusBadge(playlist)
          return (
            <div key={playlist.id} className="flex items-center justify-between border border-line/15 bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{playlist.title}</p>
                <p className={`text-[11px] ${badge.cls}`}>{badge.label}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Link
                  to={`/admin/playlists/${playlist.id}`}
                  className="border border-line/20 px-2.5 py-1.5 text-[11px] text-ink/60 hover:border-line hover:text-ink"
                >
                  수정
                </Link>
                {confirmingId === playlist.id ? (
                  <button
                    type="button"
                    onClick={() => remove(playlist.id)}
                    className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
                  >
                    정말 삭제
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(playlist.id)}
                    className="border border-line/20 px-2.5 py-1.5 text-[11px] text-ink/60 hover:border-red-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
