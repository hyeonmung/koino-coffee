interface WithId {
  id: string
}

/**
 * Generic localStorage-backed collection. Every repository in src/data/repositories
 * is a thin, domain-specific wrapper around one of these. Swapping the persistence
 * layer for Supabase later means implementing the same methods against Postgres —
 * the calling code (pages/components) never touches localStorage directly.
 */
export function createLocalCollection<T extends WithId>(storageKey: string) {
  function safeParse(json: string | null): T[] {
    if (!json) return []
    try {
      const parsed = JSON.parse(json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function getAll(): T[] {
    return safeParse(localStorage.getItem(storageKey))
  }

  function saveAll(items: T[]): void {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }

  function getById(id: string): T | undefined {
    return getAll().find((item) => item.id === id)
  }

  function upsert(item: T): T[] {
    const items = getAll()
    const index = items.findIndex((i) => i.id === item.id)
    let next: T[]
    if (index === -1) {
      next = [...items, item]
    } else {
      next = [...items]
      next[index] = item
    }
    saveAll(next)
    return next
  }

  function remove(id: string): T[] {
    const next = getAll().filter((item) => item.id !== id)
    saveAll(next)
    return next
  }

  function seedIfEmpty(items: T[]): T[] {
    const existing = getAll()
    if (existing.length > 0) return existing
    saveAll(items)
    return items
  }

  return { getAll, saveAll, getById, upsert, remove, seedIfEmpty }
}

export function createLocalSingleton<T>(storageKey: string) {
  function get(fallback: T): T {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return fallback
    try {
      return { ...fallback, ...JSON.parse(raw) } as T
    } catch {
      return fallback
    }
  }

  function set(value: T): void {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }

  return { get, set }
}
