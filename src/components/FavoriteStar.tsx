import { useState } from 'react'
import useFavorites from '../hooks/useFavorites'
import { useSupabaseSession } from '../hooks/useSupabaseSession'

interface FavoriteStarProps {
  slug: string
  /** Server-side tally of how many accounts have favorited this coffee (undefined/omitted just hides the number). */
  count?: number
  className?: string
  size?: number
}

/** Star toggle for a coffee's "찜" (one vote per logged-in account), plus the aggregate count. Safe to place inside a <Link> — stops the click from navigating. */
export default function FavoriteStar({ slug, count, className = '', size = 18 }: FavoriteStarProps) {
  const session = useSupabaseSession()
  const { isFavorite, toggleFavorite } = useFavorites(session)
  const active = isFavorite(slug)
  const [displayCount, setDisplayCount] = useState(count ?? 0)

  return (
    <button
      type="button"
      aria-label={active ? '찜 해제' : '찜하기'}
      aria-pressed={active}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!session) {
          alert('로그인 후 찜할 수 있어요.')
          return
        }
        const newCount = await toggleFavorite(slug)
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
      >
        <path d="M12 3.5l2.65 5.61 6.1.75-4.5 4.24 1.2 6.07L12 17.1l-5.45 3.07 1.2-6.07-4.5-4.24 6.1-.75L12 3.5z" />
      </svg>
      {displayCount > 0 && <span className="text-[10px] font-semibold tabular-nums">{displayCount.toLocaleString()}</span>}
    </button>
  )
}
