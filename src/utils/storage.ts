import { createSampleCoffee } from '../constants/sampleData'
import type { CoffeeProfile } from '../types'

const STORAGE_KEY = 'koi-coffee-profiles'
const SEED_FLAG_KEY = 'koi-coffee-profiles-seeded'

function safeParse(json: string | null): CoffeeProfile[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function loadCoffees(): CoffeeProfile[] {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY))
  const seeded = localStorage.getItem(SEED_FLAG_KEY)

  if (!seeded && existing.length === 0) {
    const sample = createSampleCoffee()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sample]))
    localStorage.setItem(SEED_FLAG_KEY, '1')
    return [sample]
  }

  if (!seeded) {
    localStorage.setItem(SEED_FLAG_KEY, '1')
  }

  return existing
}

export function saveCoffees(coffees: CoffeeProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coffees))
}

export function upsertCoffee(coffees: CoffeeProfile[], coffee: CoffeeProfile): CoffeeProfile[] {
  const index = coffees.findIndex((c) => c.id === coffee.id)
  let next: CoffeeProfile[]
  if (index === -1) {
    next = [...coffees, coffee]
  } else {
    next = [...coffees]
    next[index] = coffee
  }
  saveCoffees(next)
  return next
}

export function deleteCoffee(coffees: CoffeeProfile[], id: string): CoffeeProfile[] {
  const next = coffees.filter((c) => c.id !== id)
  saveCoffees(next)
  return next
}
