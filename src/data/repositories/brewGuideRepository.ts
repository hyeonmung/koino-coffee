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

export function getKoiBrewGuides(): BrewGuide[] {
  return getPublishedBrewGuides().filter((g) => g.source === 'KOI')
}

export function getOpenBrewGuides(): BrewGuide[] {
  return getPublishedBrewGuides().filter((g) => g.source === 'OPEN')
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

/** Slugs the given (logged-in) user has favorited, for seeding the "찜" star state on load. */
export async function getFavoritedBrewGuideSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('brew_guide_favorites').select('brew_guide_slug').eq('user_id', userId)
  if (error) return []
  return (data ?? []).map((row) => row.brew_guide_slug as string)
}

/** Toggles the current logged-in user's "찜" for a brew guide (one vote per account, enforced server-side) and patches the local store's tally. */
export async function toggleBrewGuideFavorite(slug: string): Promise<{ favorited: boolean; favoriteCount: number } | undefined> {
  const { data, error } = await supabase.rpc('toggle_brew_guide_favorite', { p_slug: slug })
  if (error || !data?.[0]) return undefined
  const result = data[0] as { favorited: boolean; favorite_count: number }
  store.brewGuides = store.brewGuides.map((g) => (g.slug === slug ? { ...g, favoriteCount: result.favorite_count } : g))
  return { favorited: result.favorited, favoriteCount: result.favorite_count }
}
