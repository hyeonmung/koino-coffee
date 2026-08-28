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

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  scrollToTop?: boolean
}

export default function Pagination({ page, totalPages, onChange, scrollToTop = true }: PaginationProps) {
  if (totalPages <= 1) return null

  const go = (p: number) => {
    onChange(p)
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
        className="flex h-8 w-8 items-center justify-center border border-navy/20 text-[12px] text-navy/60 hover:border-navy hover:text-navy disabled:opacity-30 disabled:hover:border-navy/20 disabled:hover:text-navy/60"
      >
        ←
      </button>
      {getPageNumbers(page, totalPages).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-1 text-[12px] text-navy/30">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`flex h-8 min-w-8 items-center justify-center border px-1.5 text-[12px] font-semibold ${
              p === page ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/60 hover:border-navy hover:text-navy'
            }`}
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
        className="flex h-8 w-8 items-center justify-center border border-navy/20 text-[12px] text-navy/60 hover:border-navy hover:text-navy disabled:opacity-30 disabled:hover:border-navy/20 disabled:hover:text-navy/60"
      >
        →
      </button>
    </div>
  )
}
