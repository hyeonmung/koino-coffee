import { toRow } from '../caseMap'
import type { FlavorDescriptor, FlavorFamily } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getFlavorFamilies(): FlavorFamily[] {
  return store.flavorFamilies.slice().sort((a, b) => a.order - b.order)
}

export async function upsertFlavorFamily(family: FlavorFamily): Promise<FlavorFamily[]> {
  const { error } = await supabase.from('flavor_families').upsert(toRow(family))
  if (error) throw error

  const index = store.flavorFamilies.findIndex((f) => f.id === family.id)
  if (index === -1) store.flavorFamilies = [...store.flavorFamilies, family]
  else store.flavorFamilies = store.flavorFamilies.map((f, i) => (i === index ? family : f))
  return store.flavorFamilies
}

export function getFlavorDescriptors(): FlavorDescriptor[] {
  return store.flavorDescriptors
}

export async function upsertFlavorDescriptor(descriptor: FlavorDescriptor): Promise<FlavorDescriptor[]> {
  const { error } = await supabase.from('flavor_descriptors').upsert(toRow(descriptor))
  if (error) throw error

  const index = store.flavorDescriptors.findIndex((d) => d.id === descriptor.id)
  if (index === -1) store.flavorDescriptors = [...store.flavorDescriptors, descriptor]
  else store.flavorDescriptors = store.flavorDescriptors.map((d, i) => (i === index ? descriptor : d))
  return store.flavorDescriptors
}

export async function deleteFlavorDescriptor(id: string): Promise<FlavorDescriptor[]> {
  const { error } = await supabase.from('flavor_descriptors').delete().eq('id', id)
  if (error) throw error

  store.flavorDescriptors = store.flavorDescriptors.filter((d) => d.id !== id)
  return store.flavorDescriptors
}
