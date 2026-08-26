import type { CoffeeProfile } from '../types'
import { slugifyFilename } from '../utils/download'
import { loadCoffees as loadLegacyCoffees } from '../utils/storage'
import type { Coffee } from './schema'

export function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
  const base = slugifyFilename(name)
  let slug = base
  let n = 2
  while (existingSlugs.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  existingSlugs.add(slug)
  return slug
}

function legacyToCoffee(legacy: CoffeeProfile, index: number, existingSlugs: Set<string>): Coffee {
  return {
    ...legacy,
    slug: generateUniqueSlug(legacy.coffeeName, existingSlugs),
    publishStatus: 'published',
    featured: false,
    sortOrder: index,
    availability: 'available',
    brewGuideIds: [],
    profileVersion: 1,
  }
}

/**
 * One-time migration from the legacy flat `koi-coffee-profiles` localStorage key
 * (used by the pre-platform admin editor) into the richer Coffee schema. Non-destructive:
 * the legacy key is left untouched so no user data is ever lost, even if this runs twice.
 */
export function migrateLegacyCoffees(existingSlugs: Set<string>): Coffee[] {
  const legacy = loadLegacyCoffees()
  return legacy.map((c, i) => legacyToCoffee(c, i, existingSlugs))
}
