import { createLocalCollection } from '../localCollection'
import type { BrewCategory } from '../schema'
import { SEED_BREW_CATEGORIES } from '../seed/brewCategories'

const collection = createLocalCollection<BrewCategory>('koi-sensory-map-brew-categories')

export function getAllBrewCategories(): BrewCategory[] {
  return collection.seedIfEmpty(SEED_BREW_CATEGORIES).slice().sort((a, b) => a.order - b.order)
}

export function getVisibleBrewCategories(): BrewCategory[] {
  return getAllBrewCategories().filter((c) => c.visible)
}

export function getBrewCategoryById(id: string): BrewCategory | undefined {
  return getAllBrewCategories().find((c) => c.id === id)
}

export function upsertBrewCategory(category: BrewCategory): BrewCategory[] {
  return collection.upsert(category)
}

export function deleteBrewCategory(id: string): BrewCategory[] {
  return collection.remove(id)
}

export function brewCategorySlugExists(slug: string, excludeId?: string): boolean {
  return getAllBrewCategories().some((c) => c.slug === slug && c.id !== excludeId)
}
