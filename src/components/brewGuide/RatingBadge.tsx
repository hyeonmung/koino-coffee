import { archive } from '../../pages/public/brewGuide/tokens'

/** Displays an admin-entered rating (0–10 scale, never computed) as a small filled star + number. */
export default function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold tabular-nums ${archive.accentText} ${className ?? ''}`}>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3.5l2.65 5.61 6.1.75-4.5 4.24 1.2 6.07L12 17.1l-5.45 3.07 1.2-6.07-4.5-4.24 6.1-.75L12 3.5z" />
      </svg>
      {rating.toFixed(1)}
      <span className={archive.textMuted}>/10</span>
    </span>
  )
}
