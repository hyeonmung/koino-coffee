import type { FlavorDescriptor, FlavorFamily } from './schema'

export interface FlavorFamilyGroup {
  family: FlavorFamily
  notes: string[]
}

const OTHER_FAMILY: FlavorFamily = { id: 'family-other', name: 'Other', nameKo: '기타', order: 999 }

export function findDescriptorByNote(note: string, descriptors: FlavorDescriptor[]): FlavorDescriptor | undefined {
  const q = note.trim().toLowerCase()
  return descriptors.find((d) => d.name.toLowerCase() === q || d.aliases.some((a) => a.toLowerCase() === q))
}

/** Groups a coffee's free-text flavor notes into Flavor Family buckets for display. */
export function groupNotesByFamily(
  notes: string[],
  descriptors: FlavorDescriptor[],
  families: FlavorFamily[],
): FlavorFamilyGroup[] {
  const groups = new Map<string, FlavorFamilyGroup>()

  for (const note of notes) {
    const descriptor = findDescriptorByNote(note, descriptors)
    const family = descriptor ? families.find((f) => f.id === descriptor.familyId) : undefined
    const resolvedFamily = family ?? OTHER_FAMILY
    const existing = groups.get(resolvedFamily.id)
    if (existing) existing.notes.push(note)
    else groups.set(resolvedFamily.id, { family: resolvedFamily, notes: [note] })
  }

  return Array.from(groups.values()).sort((a, b) => a.family.order - b.family.order)
}
