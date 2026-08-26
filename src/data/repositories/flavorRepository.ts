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

export function getFlavorDescriptors(): FlavorDescriptor[] {
  return descriptorCollection.seedIfEmpty(SEED_FLAVOR_DESCRIPTORS)
}

export function upsertFlavorDescriptor(descriptor: FlavorDescriptor): FlavorDescriptor[] {
  return descriptorCollection.upsert(descriptor)
}

export function deleteFlavorDescriptor(id: string): FlavorDescriptor[] {
  return descriptorCollection.remove(id)
}
