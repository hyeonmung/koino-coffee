import { FLAVOR_NEUTRAL_COLOR } from '../constants/flavorColor'
import type { FlavorColor, FlavorDescriptor } from './schema'

export function findDescriptorByNote(note: string, descriptors: FlavorDescriptor[]): FlavorDescriptor | undefined {
  const q = note.trim().toLowerCase()
  return descriptors.find((d) => d.name.toLowerCase() === q || d.aliases.some((a) => a.toLowerCase() === q))
}

/**
 * A Flavor Note's own color — independent of the coffee's Character. Unregistered notes fall
 * back to a neutral tone rather than borrowing any Character accent.
 */
export function getFlavorColor(note: string, descriptors: FlavorDescriptor[]): FlavorColor {
  return findDescriptorByNote(note, descriptors)?.color ?? FLAVOR_NEUTRAL_COLOR
}
