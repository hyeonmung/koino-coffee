interface StarSpec {
  x: number // percent, 0-100
  y: number // percent, 0-100
  size: number // radius in rendered px
  opacity: number
  sparkle?: boolean
  delay: number // seconds
}

/**
 * Hand-placed, not randomized — a "designed" sparse composition that stays
 * off dead-center (where titles/CTAs usually sit) and never clusters.
 * Keep this list short: the whole point is that stars should read as
 * atmosphere, not as content.
 */
const STARS: StarSpec[] = [
  { x: 6, y: 20, size: 1.1, opacity: 0.5, delay: 0 },
  { x: 13, y: 62, size: 0.8, opacity: 0.38, delay: 2.2 },
  { x: 21, y: 12, size: 0.9, opacity: 0.42, delay: 4.1 },
  { x: 27, y: 78, size: 1.2, opacity: 0.5, sparkle: true, delay: 1.1 },
  { x: 9, y: 88, size: 0.8, opacity: 0.35, delay: 3.4 },
  { x: 46, y: 15, size: 0.8, opacity: 0.36, delay: 0.7 },
  { x: 53, y: 85, size: 0.9, opacity: 0.4, delay: 2.9 },
  { x: 68, y: 10, size: 1, opacity: 0.44, delay: 1.8 },
  { x: 74, y: 60, size: 1.2, opacity: 0.5, sparkle: true, delay: 3.8 },
  { x: 80, y: 30, size: 0.8, opacity: 0.38, delay: 0.4 },
  { x: 88, y: 78, size: 0.9, opacity: 0.4, delay: 2.5 },
  { x: 93, y: 18, size: 1, opacity: 0.45, sparkle: true, delay: 1.4 },
  { x: 96, y: 55, size: 0.8, opacity: 0.36, delay: 3.1 },
  { x: 60, y: 45, size: 0.7, opacity: 0.3, delay: 4.4 },
]

function StarShape({ star }: { star: StarSpec }) {
  const style = {
    ['--koi-star-opacity' as string]: star.opacity,
    opacity: star.opacity,
    animationDelay: `${star.delay}s`,
  }

  if (star.sparkle) {
    const s = star.size
    // Compact 4-point sparkle glyph — never a filled star icon.
    const d = `M0,${-s * 3} L${s * 0.55},${-s * 0.55} L${s * 3},0 L${s * 0.55},${s * 0.55} L0,${s * 3} L${-s * 0.55},${s * 0.55} L${-s * 3},0 L${-s * 0.55},${-s * 0.55} Z`
    return (
      <g transform={`translate(${star.x}%, ${star.y}%)`} className="koi-star" style={style}>
        <path d={d} fill="#f2c94c" />
      </g>
    )
  }

  return (
    <circle
      cx={`${star.x}%`}
      cy={`${star.y}%`}
      r={star.size}
      fill="#f2e7c3"
      className="koi-star"
      style={style}
    />
  )
}

interface KOIStarFieldProps {
  className?: string
}

/** Sparse, warm-gold star accent for Navy sections. See .koi-night-sky in index.css for the paired background. */
export default function KOIStarField({ className = '' }: KOIStarFieldProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="none"
    >
      {STARS.map((star, i) => (
        <StarShape key={i} star={star} />
      ))}
    </svg>
  )
}
