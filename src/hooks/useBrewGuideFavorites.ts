import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { getFavoritedBrewGuideSlugs, toggleBrewGuideFavorite } from '../data/repositories/brewGuideRepository'

/**
 * Account-based "찜" for brew guides — one vote per logged-in user, enforced server-side by
 * toggle_brew_guide_favorite (see migrations/2026-09-24-brew-guide-rating-and-favorites.sql).
 * Same module-level-store pattern as useFavorites.ts (coffees), kept separate rather than shared
 * since the two favorite each live in their own table.
 */
let favorites = new Set<string>()
let loadedForUserId: string | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return favorites
}

function notify() {
  listeners.forEach((l) => l())
}

async function loadFavorites(userId: string) {
  const slugs = await getFavoritedBrewGuideSlugs(userId)
  favorites = new Set(slugs)
  loadedForUserId = userId
  notify()
}

export default function useBrewGuideFavorites(session: Session | null | undefined) {
  const userId = session?.user.id
  const current = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (!userId) {
      favorites = new Set()
      loadedForUserId = null
      notify()
      return
    }
    if (loadedForUserId !== userId) loadFavorites(userId)
  }, [userId])

  const isFavorite = useCallback((slug: string) => current.has(slug), [current])

  const toggleFavorite = useCallback(
    async (slug: string): Promise<number | undefined> => {
      if (!userId) return undefined
      const result = await toggleBrewGuideFavorite(slug)
      if (!result) return undefined
      const next = new Set(favorites)
      if (result.favorited) next.add(slug)
      else next.delete(slug)
      favorites = next
      notify()
      return result.favoriteCount
    },
    [userId],
  )

  return { favorites: current, isFavorite, toggleFavorite }
}
