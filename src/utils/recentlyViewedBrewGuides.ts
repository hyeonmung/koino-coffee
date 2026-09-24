const STORAGE_KEY = 'koi_recently_viewed_brew_guides'
const MAX_ENTRIES = 5

export function getRecentlyViewedBrewGuides(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function addRecentlyViewedBrewGuide(slug: string): void {
  try {
    const next = [slug, ...getRecentlyViewedBrewGuides().filter((s) => s !== slug)].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable (private mode, storage full, etc.) — recently-viewed is a convenience, not critical
  }
}
