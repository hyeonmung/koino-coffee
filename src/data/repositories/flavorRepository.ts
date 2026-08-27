import { createLocalCollection } from '../localCollection'
import type { FlavorDescriptor, FlavorFamily } from '../schema'
import { SEED_FLAVOR_DESCRIPTORS, SEED_FLAVOR_FAMILIES } from '../seed/flavors'

const familyCollection = createLocalCollection<FlavorFamily>('koi-sensory-map-flavor-families')
const descriptorCollection = createLocalCollection<FlavorDescriptor>('koi-sensory-map-flavor-descriptors')

export function getFlavorFamilies(): FlavorFamily[] {
  return familyCollection.seedIfEmpty(SEED_FLAVOR_FAMILIES).slice().sort((a, b) => a.order - b.order)
}

export function upsertFlavorFamily(family: FlavorFamily): FlavorFamily[] {
  return familyCollection.upsert(family)
}

/**
 * Reads the flavor descriptor catalog, backfilling any browser data seeded before the Flavor
 * Color System existed: existing descriptors missing a `color` get the seed's color (admin-edited
 * name/description/etc. are left untouched), and any new descriptor added to the seed list that
 * isn't in local storage yet is appended. Never overwrites an admin-assigned color.
 */
export function getFlavorDescriptors(): FlavorDescriptor[] {
  const current = descriptorCollection.seedIfEmpty(SEED_FLAVOR_DESCRIPTORS)
  const byId = new Map(current.map((d) => [d.id, d]))
  let changed = false

  for (const seed of SEED_FLAVOR_DESCRIPTORS) {
    const existing = byId.get(seed.id)
    if (!existing) {
      byId.set(seed.id, seed)
      changed = true
    } else if (!existing.color && seed.color) {
      byId.set(seed.id, { ...existing, color: seed.color })
      changed = true
    }
  }

  if (!changed) return current
  const next = Array.from(byId.values())
  descriptorCollection.saveAll(next)
  return next
}

export function upsertFlavorDescriptor(descriptor: FlavorDescriptor): FlavorDescriptor[] {
  return descriptorCollection.upsert(descriptor)
}

export function deleteFlavorDescriptor(id: string): FlavorDescriptor[] {
  return descriptorCollection.remove(id)
}
