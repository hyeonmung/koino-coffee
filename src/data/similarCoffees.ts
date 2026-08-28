import { SENSORY_KEYS } from '../types'
import { findDescriptorByNote } from './flavorMatch'
import type { Coffee, FlavorDescriptor } from './schema'

// Max possible distance across all 6 sensory axes (each scored 1-5, so max per-axis diff is 4).
const MAX_SENSORY_DISTANCE = Math.sqrt(SENSORY_KEYS.length * 4 * 4)

function sensorySimilarity(a: Coffee['sensory'], b: Coffee['sensory']): number {
  let sumSq = 0
  for (const key of SENSORY_KEYS) {
    const diff = a[key] - b[key]
    sumSq += diff * diff
  }
  return 1 - Math.sqrt(sumSq) / MAX_SENSORY_DISTANCE
}

// Exact note matches count fully; matches that only share a flavor family (e.g. two different
// stone-fruit notes) count as a softer half-point — real correlation, not a coincidence.
function noteSimilarity(a: Coffee, b: Coffee, descriptors: FlavorDescriptor[]): number {
  if (a.notes.length === 0 || b.notes.length === 0) return 0
  const aNotesLower = new Set(a.notes.map((n) => n.toLowerCase()))
  const aFamilies = new Set(
    a.notes.map((n) => findDescriptorByNote(n, descriptors)?.familyId).filter((f): f is string => Boolean(f)),
  )
  let points = 0
  for (const note of b.notes) {
    const lower = note.toLowerCase()
    if (aNotesLower.has(lower)) {
      points += 1
      continue
    }
    const family = findDescriptorByNote(note, descriptors)?.familyId
    if (family && aFamilies.has(family)) points += 0.5
  }
  return points / Math.max(a.notes.length, b.notes.length)
}

/**
 * "비슷한 커피" — driven by actual cup notes overlap and sensory (radar chart) closeness, not
 * character/country coincidence. A coffee only qualifies if it shares at least one real flavor
 * note (exact or same family); sensory closeness then refines the ranking among those. Coffees
 * with no genuine flavor correlation are excluded outright rather than padded in.
 */
export function getSimilarCoffees(coffee: Coffee, all: Coffee[], descriptors: FlavorDescriptor[], limit = 3): Coffee[] {
  return all
    .filter((c) => c.id !== coffee.id && c.publishStatus === 'published')
    .map((c) => {
      const noteSim = noteSimilarity(coffee, c, descriptors)
      const sensorySim = sensorySimilarity(coffee.sensory, c.sensory)
      return { coffee: c, noteSim, score: noteSim * 0.6 + sensorySim * 0.4 }
    })
    .filter((s) => s.noteSim > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.coffee)
}
