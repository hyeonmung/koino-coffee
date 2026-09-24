import type { BrewPourStep } from '../../data/schema'
import { archive } from '../../pages/public/brewGuide/tokens'

interface BrewingTimelineProps {
  steps: BrewPourStep[]
  totalTime?: string
}

/**
 * Vertical brewing timeline — each node is a real, sourced pour step (time + cumulative water).
 * The final node reads as a small filled star rather than a plain dot: one deliberate "signature"
 * moment per timeline, not a dot-to-star pattern repeated at every step.
 */
export default function BrewingTimeline({ steps, totalTime }: BrewingTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div>
      <ol className={`border-l ${archive.border}`}>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <li key={i} className="relative flex items-baseline gap-5 py-3.5 pl-7">
              <span className="absolute left-0 top-[0.95em] -translate-x-1/2" aria-hidden>
                {isLast ? (
                  <StarNode />
                ) : (
                  <span className={`block h-1.5 w-1.5 rounded-full`} style={{ backgroundColor: archive.accent }} />
                )}
              </span>
              <span className={`w-16 shrink-0 text-[11px] font-medium tabular-nums ${archive.textMuted}`}>{step.time}</span>
              <span className={`flex-1 text-[14px] font-medium ${archive.textPrimary}`}>{step.label}</span>
              <span className={`text-[13px] tabular-nums ${archive.textSecondary}`}>{step.water}</span>
            </li>
          )
        })}
      </ol>
      <p className={`mt-3 text-[11px] ${archive.textMuted}`}>
        표시된 물의 양은 저울 기준 누적 중량입니다{totalTime ? ` · 총 추출 시간 ${totalTime}` : ''}.
      </p>
    </div>
  )
}

function StarNode() {
  return (
    <svg width="11" height="11" viewBox="-6 -6 12 12" aria-hidden>
      <path
        d="M0,-6 L1.1,-1.1 L6,0 L1.1,1.1 L0,6 L-1.1,1.1 L-6,0 L-1.1,-1.1 Z"
        fill={archive.accent}
      />
    </svg>
  )
}
