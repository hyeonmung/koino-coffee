import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { getLikedColumnSlugs, toggleColumnLike } from '../data/repositories/columnRepository'

/**
 * Account-based "좋아요" for 더코이맥 칼럼 — one vote per logged-in user, enforced server-side
 * by toggle_column_like (see migrations/2026-09-22-column-likes-per-account.sql). Same
 * module-level Set + external store pattern as useFavorites, so every card/detail instance
 * stays in sync within the same tab.
 */
let liked = new Set<string>()
let loadedForUserId: string | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return liked
}

function notify() {
  listeners.forEach((l) => l())
}

async function loadLiked(userId: string) {
  const slugs = await getLikedColumnSlugs(userId)
  liked = new Set(slugs)
  loadedForUserId = userId
  notify()
}

export default function useColumnLikes(session: Session | null | undefined) {
  const userId = session?.user.id
  const current = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    if (!userId) {
      liked = new Set()
      loadedForUserId = null
      notify()
      return
    }
    if (loadedForUserId !== userId) loadLiked(userId)
  }, [userId])

  const isLiked = useCallback((slug: string) => current.has(slug), [current])

  const toggleLike = useCallback(
    async (slug: string): Promise<number | undefined> => {
      if (!userId) return undefined
      const result = await toggleColumnLike(slug)
      if (!result) return undefined
      const next = new Set(liked)
      if (result.liked) next.add(slug)
      else next.delete(slug)
      liked = next
      notify()
      return result.likeCount
    },
    [userId],
  )

  return { liked: current, isLiked, toggleLike }
}
