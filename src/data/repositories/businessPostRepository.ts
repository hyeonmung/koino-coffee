import { createLocalCollection } from '../localCollection'
import type { BusinessPost } from '../schema'
import { SEED_BUSINESS_POSTS } from '../seed/businessPosts'

const collection = createLocalCollection<BusinessPost>('koi-sensory-map-business-posts')

function pinnedFirst(a: BusinessPost, b: BusinessPost): number {
  if (a.isSystemPinned && !b.isSystemPinned) return -1
  if (!a.isSystemPinned && b.isSystemPinned) return 1
  return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
}

export function getAllBusinessPosts(): BusinessPost[] {
  return collection.seedIfEmpty(SEED_BUSINESS_POSTS).slice().sort(pinnedFirst)
}

export function getPublishedBusinessPosts(): BusinessPost[] {
  return getAllBusinessPosts().filter((p) => p.publishStatus === 'published')
}

export function getBusinessPostBySlug(slug: string): BusinessPost | undefined {
  return getAllBusinessPosts().find((p) => p.slug === slug)
}

export function getBusinessPostById(id: string): BusinessPost | undefined {
  return getAllBusinessPosts().find((p) => p.id === id)
}

export function upsertBusinessPost(post: BusinessPost): BusinessPost[] {
  return collection.upsert(post)
}

/** Refuses to delete the system-pinned wholesale-inquiry post — returns false instead. */
export function deleteBusinessPost(id: string): boolean {
  const post = getBusinessPostById(id)
  if (post?.isSystemPinned) return false
  collection.remove(id)
  return true
}

export function businessPostSlugExists(slug: string, excludeId?: string): boolean {
  return getAllBusinessPosts().some((p) => p.slug === slug && p.id !== excludeId)
}
