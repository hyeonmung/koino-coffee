import { createLocalCollection } from '../localCollection'
import { generateUniqueSlug, migrateLegacyCoffees } from '../migrate'
import type { Coffee } from '../schema'
import { SEED_COFFEES } from '../seed/coffees'

const STORAGE_KEY = 'koi-sensory-map-coffees'
const INIT_FLAG_KEY = 'koi-sensory-map-coffees-initialized'

const collection = createLocalCollection<Coffee>(STORAGE_KEY)

function ensureInitialized(): void {
  if (localStorage.getItem(INIT_FLAG_KEY)) return
  localStorage.setItem(INIT_FLAG_KEY, '1')

  const existing = collection.getAll()
  if (existing.length > 0) return

  const existingSlugs = new Set<string>()
  const migrated = migrateLegacyCoffees(existingSlugs)
  if (migrated.length > 0) {
    collection.saveAll(migrated)
    return
  }

  // Brand new install with no legacy data at all — seed the full demo library.
  collection.saveAll(SEED_COFFEES.map((c) => ({ ...c })))
}

export function getAllCoffees(): Coffee[] {
  ensureInitialized()
  return collection.getAll()
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

export function upsertCoffee(coffee: Coffee): Coffee[] {
  return collection.upsert(coffee)
}

export function deleteCoffee(id: string): Coffee[] {
  return collection.remove(id)
}

export function slugExists(slug: string, excludeId?: string): boolean {
  return getAllCoffees().some((c) => c.slug === slug && c.id !== excludeId)
}

/** Admin-triggered convenience action: pulls in the full 8-coffee demo set without touching real entries. */
export function addDemoCoffees(): Coffee[] {
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
  const next = [...all, ...toAdd]
  collection.saveAll(next)
  return next
}
