const ROAST_POSITIONS: Record<string, number> = {
  light: 8,
  'light medium': 25,
  'medium light': 25,
  medium: 50,
  'medium dark': 72,
  'dark medium': 72,
  dark: 92,
}

function resolvePosition(roastLevel: string): number | null {
  const key = roastLevel.trim().toLowerCase()
  if (key in ROAST_POSITIONS) return ROAST_POSITIONS[key]
  return null
}

interface RoastDirectionProps {
  roastLevel: string
}

/** Simple LIGHT—●—DEVELOPED position bar. Only renders when roastLevel matches a known label — never fabricates a position. */
export default function RoastDirection({ roastLevel }: RoastDirectionProps) {
  const position = resolvePosition(roastLevel)
  if (position === null) return null

  return (
    <div>
      <div className="flex items-center justify-between text-[9px] font-semibold tracking-[0.15em] text-navy/40">
        <span>LIGHT</span>
        <span>DEVELOPED</span>
      </div>
      <div className="relative mt-1.5 h-[2px] bg-navy/15">
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy bg-accent"
          style={{ left: `${position}%` }}
        />
      </div>
    </div>
  )
}
