import { useState } from 'react'

interface InfoTooltipProps {
  title: string
  criteria: readonly string[]
}

export default function InfoTooltip({ title, criteria }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`${title} 평가 기준 보기`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-line/40 text-[10px] leading-none text-ink/70 hover:border-line hover:text-ink"
      >
        i
      </button>
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute left-1/2 top-6 z-30 w-64 -translate-x-1/2 rounded-sm border border-line/15 bg-surface p-3 text-left shadow-lg"
        >
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-ink">{title} 평가 기준</p>
          <ol className="space-y-1">
            {criteria.map((text, i) => (
              <li key={i} className="text-[11px] leading-snug text-ink/80">
                <span className="font-semibold text-ink">{i + 1}</span> — {text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </span>
  )
}
