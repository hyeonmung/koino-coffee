import type { SensoryFieldInfo } from '../constants/sensory'
import type { SensoryScore } from '../types'
import InfoTooltip from './InfoTooltip'

interface SensorySliderProps {
  field: SensoryFieldInfo
  value: SensoryScore
  onChange: (value: SensoryScore) => void
}

const SCORES: SensoryScore[] = [1, 2, 3, 4, 5]

export default function SensorySlider({ field, value, onChange }: SensorySliderProps) {
  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wide text-navy">{field.labelKo}</span>
          <span className="text-[10px] text-navy/45">{field.label}</span>
          <InfoTooltip title={field.labelKo} criteria={field.criteria} />
        </div>
        <span className="min-w-[1.5rem] text-right text-[15px] font-semibold text-navy">
          {value}
        </span>
      </div>
      <div className="flex gap-1">
        {SCORES.map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-label={`${field.labelKo} ${score}점`}
            aria-pressed={value === score}
            className={`h-6 flex-1 border text-[10px] transition-colors ${
              score <= value
                ? 'border-navy bg-navy text-warm-white'
                : 'border-navy/20 bg-transparent text-navy/30 hover:border-navy/50'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )
}
