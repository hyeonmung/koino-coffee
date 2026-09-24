import { useState } from 'react'
import useColumnLikes from '../hooks/useColumnLikes'
import { useSupabaseSession } from '../hooks/useSupabaseSession'

interface ColumnLikeButtonProps {
  slug: string
  /** Server-side tally of how many accounts have liked this column (undefined/omitted just hides the number). */
  count?: number
  className?: string
  size?: number
}

/** Heart toggle for a column's "좋아요" (one vote per logged-in account), plus the aggregate count — same mechanism as FavoriteStar on coffee pages. Safe to place inside a <Link> — stops the click from navigating. */
export default function ColumnLikeButton({ slug, count, className = '', size = 18 }: ColumnLikeButtonProps) {
  const session = useSupabaseSession()
  const { isLiked, toggleLike } = useColumnLikes(session)
  const active = isLiked(slug)
  const [displayCount, setDisplayCount] = useState(count ?? 0)

  return (
    <button
      type="button"
      aria-label={active ? '좋아요 취소' : '좋아요'}
      aria-pressed={active}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!session) {
          alert('로그인 후 좋아요를 누를 수 있어요.')
          return
        }
        const newCount = await toggleLike(slug)
        if (newCount !== undefined) setDisplayCount(newCount)
      }}
      className={`inline-flex items-center gap-1 transition-transform hover:scale-105 ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? '#FF4103' : 'none'}
        stroke={active ? '#FF4103' : 'currentColor'}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M12 20.5s-7-4.35-9.5-8.7C1 8.9 2 5.6 5.2 4.8c2.1-.5 3.9.5 5 2.1l1.8 2.5 1.8-2.5c1.1-1.6 2.9-2.6 5-2.1 3.2.8 4.2 4.1 2.7 7-2.5 4.35-9.5 8.7-9.5 8.7z" />
      </svg>
      {displayCount > 0 && <span className="text-[10px] font-semibold tabular-nums">{displayCount.toLocaleString()}</span>}
    </button>
  )
}
