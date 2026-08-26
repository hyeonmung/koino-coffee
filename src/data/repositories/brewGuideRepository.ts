import { createLocalCollection } from '../localCollection'
import type { BrewGuide } from '../schema'
import { SEED_BREW_GUIDES } from '../seed/brewGuides'

const collection = createLocalCollection<BrewGuide>('koi-sensory-map-brew-guides')

export function getAllBrewGuides(): BrewGuide[] {
  return collection.seedIfEmpty(SEED_BREW_GUIDES)
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

export function upsertBrewGuide(guide: BrewGuide): BrewGuide[] {
  return collection.upsert(guide)
}

export function deleteBrewGuide(id: string): BrewGuide[] {
  return collection.remove(id)
}

export function brewGuideSlugExists(slug: string, excludeId?: string): boolean {
  return getAllBrewGuides().some((g) => g.slug === slug && g.id !== excludeId)
}
