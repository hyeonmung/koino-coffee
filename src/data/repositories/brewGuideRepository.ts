import { toRow } from '../caseMap'
import type { BrewGuide } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllBrewGuides(): BrewGuide[] {
  return store.brewGuides
}

export function getPublishedBrewGuides(): BrewGuide[] {
  return getAllBrewGuides().filter((g) => g.publishStatus === 'published')
}

export function getBrewGuideBySlug(slug: string): BrewGuide | undefined {
  return getAllBrewGuides().find((g) => g.slug === slug)
}

export function getBrewGuideById(id: string): BrewGuide | undefined {
  return getAllBrewGuides().find((g) => g.id === id)
}

export async function upsertBrewGuide(guide: BrewGuide): Promise<BrewGuide[]> {
  const { error } = await supabase.from('brew_guides').upsert(toRow(guide))
  if (error) throw error

  const index = store.brewGuides.findIndex((g) => g.id === guide.id)
  if (index === -1) store.brewGuides = [...store.brewGuides, guide]
  else store.brewGuides = store.brewGuides.map((g, i) => (i === index ? guide : g))
  return store.brewGuides
}

export async function deleteBrewGuide(id: string): Promise<BrewGuide[]> {
  const { error } = await supabase.from('brew_guides').delete().eq('id', id)
  if (error) throw error

  store.brewGuides = store.brewGuides.filter((g) => g.id !== id)
  return store.brewGuides
}

export function brewGuideSlugExists(slug: string, excludeId?: string): boolean {
  return getAllBrewGuides().some((g) => g.slug === slug && g.id !== excludeId)
}
