import { SENSORY_KEYS } from '../types'

export interface RadarPoint {
  x: number
  y: number
}

/** Angle (radians) of axis `index` of `count`, starting at the top and going clockwise. */
export function radarAxisAngle(index: number, count = SENSORY_KEYS.length): number {
  return (Math.PI * 2 * index) / count - Math.PI / 2
}

/** A point on axis `index`, `value` out of `max`, on a radar centered at (cx, cy) with `radius`. */
export function radarPoint(
  index: number,
  value: number,
  max: number,
  radius: number,
  cx: number,
  cy: number,
  count = SENSORY_KEYS.length,
): RadarPoint {
  const angle = radarAxisAngle(index, count)
  const r = (Math.max(0, value) / max) * radius
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

export function pointsToPath(points: RadarPoint[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}
