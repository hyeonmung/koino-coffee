import { archive } from '../../pages/public/brewGuide/tokens'

// Windowed page list: all numbers when few pages, otherwise 1 … current±1 … last.
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(p)
  })
  return result
}

interface ArchivePaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Same windowed page-number logic as the site-wide Pagination component, restyled for the
 * brewing archive's fixed-dark palette instead of the theme-toggle tokens. */
export default function ArchivePagination({ page, totalPages, onChange }: ArchivePaginationProps) {
  if (totalPages <= 1) return null

  const go = (p: number) => {
    onChange(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className={`flex h-8 w-8 items-center justify-center rounded-full border ${archive.border} text-[12px] ${archive.textSecondary} ${archive.hoverTextPrimary} disabled:opacity-30`}
      >
        ←
      </button>
      {getPageNumbers(page, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className={`px-1 text-[12px] ${archive.textMuted}`}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-1.5 text-[12px] font-semibold ${
              p === page ? 'border-transparent' : `${archive.border} ${archive.textSecondary} ${archive.hoverTextPrimary}`
            }`}
            style={p === page ? { color: archive.accent, backgroundColor: 'rgba(242,197,92,0.12)' } : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
        className={`flex h-8 w-8 items-center justify-center rounded-full border ${archive.border} text-[12px] ${archive.textSecondary} ${archive.hoverTextPrimary} disabled:opacity-30`}
      >
        →
      </button>
    </div>
  )
}
