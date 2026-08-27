import { CHARACTER_STYLE } from '../constants/characterStyle'
import { SENSORY_FIELDS } from '../constants/sensory'
import type { CupCharacter, SensoryProfile } from '../types'
import { pointsToPath, radarPoint } from '../utils/radarGeometry'

interface MiniSensoryRadarProps {
  sensory: SensoryProfile
  character: CupCharacter
  size?: number
  showLabels?: boolean
  className?: string
}

const NAVY = '#14213d'
const MAX = 5

// Mini Radar space is tight, so long labels ("플레이버", "접근성") are abbreviated here only.
// Full labels stay on the full-size Radar (SENSORY_FIELDS.labelKo) and in the aria-label text.
const MINI_LABEL: Record<string, string> = {
  acidity: '산미',
  sweetness: '단맛',
  body: '바디',
  finish: '여운',
  flavor: '향미',
  accessibility: '접근',
}

/**
 * Lightweight, dependency-free SVG radar for compact contexts (Home Coffee Card). Shares its
 * point geometry with the full Chart.js Radar via utils/radarGeometry so both always agree.
 */
export default function MiniSensoryRadar({ sensory, character, size = 104, showLabels = true, className = '' }: MiniSensoryRadarProps) {
  const { accent, accentSoft } = CHARACTER_STYLE[character]
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - (showLabels ? size * 0.16 : size * 0.06)

  const gridRings = [0.25, 0.5, 0.75, 1].map((f) => pointsToPath(SENSORY_FIELDS.map((_, i) => radarPoint(i, f * MAX, MAX, radius, cx, cy))))
  const axisEnds = SENSORY_FIELDS.map((_, i) => radarPoint(i, MAX, MAX, radius, cx, cy))
  const dataPoints = SENSORY_FIELDS.map((f, i) => radarPoint(i, sensory[f.key], MAX, radius, cx, cy))

  const srText = SENSORY_FIELDS.map((f) => `${f.labelKo} ${sensory[f.key]}점`).join(', ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={srText} className={className}>
      {gridRings.map((ring, i) => (
        <polygon key={i} points={ring} fill="none" stroke={NAVY} strokeOpacity={0.12} strokeWidth={1} />
      ))}
      {axisEnds.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={NAVY} strokeOpacity={0.14} strokeWidth={1} />
      ))}
      <polygon
        points={pointsToPath(dataPoints)}
        fill={accentSoft}
        stroke={accent}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.8} fill={accent} />
      ))}
      {showLabels &&
        SENSORY_FIELDS.map((f, i) => {
          const p = radarPoint(i, MAX, MAX, radius + size * 0.1, cx, cy)
          return (
            <text
              key={f.key}
              x={p.x}
              y={p.y}
              fontSize={size * 0.075}
              fill={NAVY}
              fillOpacity={0.5}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {MINI_LABEL[f.key]}
            </text>
          )
        })}
    </svg>
  )
}
