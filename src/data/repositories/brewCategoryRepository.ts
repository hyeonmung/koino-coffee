import { toRow } from '../caseMap'
import type { BrewCategory } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllBrewCategories(): BrewCategory[] {
  return store.brewCategories.slice().sort((a, b) => a.order - b.order)
}

export function getVisibleBrewCategories(): BrewCategory[] {
  return getAllBrewCategories().filter((c) => c.visible)
}

export function getBrewCategoryById(id: string): BrewCategory | undefined {
  return getAllBrewCategories().find((c) => c.id === id)
}

export async function upsertBrewCategory(category: BrewCategory): Promise<BrewCategory[]> {
  const { error } = await supabase.from('brew_categories').upsert(toRow(category))
  if (error) throw error

  const index = store.brewCategories.findIndex((c) => c.id === category.id)
  if (index === -1) store.brewCategories = [...store.brewCategories, category]
  else store.brewCategories = store.brewCategories.map((c, i) => (i === index ? category : c))
  return store.brewCategories
}

export async function deleteBrewCategory(id: string): Promise<BrewCategory[]> {
  const { error } = await supabase.from('brew_categories').delete().eq('id', id)
  if (error) throw error

  store.brewCategories = store.brewCategories.filter((c) => c.id !== id)
  return store.brewCategories
}

export function brewCategorySlugExists(slug: string, excludeId?: string): boolean {
  return getAllBrewCategories().some((c) => c.slug === slug && c.id !== excludeId)
}
