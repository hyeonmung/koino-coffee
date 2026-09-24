import { toRow } from '../caseMap'
import { generateUniqueSlug } from '../migrate'
import type { Coffee } from '../schema'
import { SEED_COFFEES } from '../seed/coffees'
import { supabase } from '../supabaseClient'
import { coffeeToRow, store } from '../store'

export function getAllCoffees(): Coffee[] {
  return store.coffees
}

export function getPublishedCoffees(): Coffee[] {
  return getAllCoffees().filter((c) => c.publishStatus === 'published')
}

export function getCoffeeBySlug(slug: string): Coffee | undefined {
  return getAllCoffees().find((c) => c.slug === slug)
}

export function getCoffeeById(id: string): Coffee | undefined {
  return getAllCoffees().find((c) => c.id === id)
}

/** Slugs the given (logged-in) user has favorited, for seeding the "찜" star state on load. */
export async function getFavoritedSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('coffee_favorites').select('coffee_slug').eq('user_id', userId)
  if (error) return []
  return (data ?? []).map((row) => row.coffee_slug as string)
}

/** Toggles the current logged-in user's "찜" for a coffee (one vote per account, enforced server-side) and patches the local store's tally. */
export async function toggleCoffeeFavorite(slug: string): Promise<{ favorited: boolean; favoriteCount: number } | undefined> {
  const { data, error } = await supabase.rpc('toggle_coffee_favorite', { p_slug: slug })
  if (error || !data?.[0]) return undefined
  const result = data[0] as { favorited: boolean; favorite_count: number }
  store.coffees = store.coffees.map((c) => (c.slug === slug ? { ...c, favoriteCount: result.favorite_count } : c))
  return { favorited: result.favorited, favoriteCount: result.favorite_count }
}

export async function upsertCoffee(coffee: Coffee): Promise<Coffee[]> {
  const { error } = await supabase.from('coffees').upsert(toRow(coffeeToRow(coffee)))
  if (error) throw error

  const index = store.coffees.findIndex((c) => c.id === coffee.id)
  if (index === -1) store.coffees = [...store.coffees, coffee]
  else store.coffees = store.coffees.map((c, i) => (i === index ? coffee : c))
  return store.coffees
}

export async function deleteCoffee(id: string): Promise<Coffee[]> {
  const { error } = await supabase.from('coffees').delete().eq('id', id)
  if (error) throw error

  store.coffees = store.coffees.filter((c) => c.id !== id)
  return store.coffees
}

export function slugExists(slug: string, excludeId?: string): boolean {
  return getAllCoffees().some((c) => c.slug === slug && c.id !== excludeId)
}

/** Admin-triggered convenience action: pulls in the full 8-coffee demo set without touching real entries. */
export async function addDemoCoffees(): Promise<Coffee[]> {
  const all = getAllCoffees()
  const existingIds = new Set(all.map((c) => c.id))
  const existingSlugs = new Set(all.map((c) => c.slug))

  const toAdd: Coffee[] = []
  for (const seedCoffee of SEED_COFFEES) {
    if (existingIds.has(seedCoffee.id)) continue
    const slug = existingSlugs.has(seedCoffee.slug)
      ? generateUniqueSlug(seedCoffee.coffeeName, existingSlugs)
      : seedCoffee.slug
    existingSlugs.add(slug)
    toAdd.push({ ...seedCoffee, slug })
  }

  if (toAdd.length === 0) return all

  const { error } = await supabase.from('coffees').insert(toAdd.map((c) => toRow(coffeeToRow(c))))
  if (error) throw error

  store.coffees = [...all, ...toAdd]
  return store.coffees
}
