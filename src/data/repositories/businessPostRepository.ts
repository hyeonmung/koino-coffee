import { toRow } from '../caseMap'
import type { BusinessPost } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

function pinnedFirst(a: BusinessPost, b: BusinessPost): number {
  if (a.isSystemPinned && !b.isSystemPinned) return -1
  if (!a.isSystemPinned && b.isSystemPinned) return 1
  return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
}

export function getAllBusinessPosts(): BusinessPost[] {
  return store.businessPosts.slice().sort(pinnedFirst)
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

export async function upsertBusinessPost(post: BusinessPost): Promise<BusinessPost[]> {
  const { error } = await supabase.from('business_posts').upsert(toRow(post))
  if (error) throw error

  const index = store.businessPosts.findIndex((p) => p.id === post.id)
  if (index === -1) store.businessPosts = [...store.businessPosts, post]
  else store.businessPosts = store.businessPosts.map((p, i) => (i === index ? post : p))
  return store.businessPosts
}

/** Refuses to delete the system-pinned wholesale-inquiry post — returns false instead. */
export async function deleteBusinessPost(id: string): Promise<boolean> {
  const post = getBusinessPostById(id)
  if (post?.isSystemPinned) return false

  const { error } = await supabase.from('business_posts').delete().eq('id', id)
  if (error) throw error

  store.businessPosts = store.businessPosts.filter((p) => p.id !== id)
  return true
}

export function businessPostSlugExists(slug: string, excludeId?: string): boolean {
  return getAllBusinessPosts().some((p) => p.slug === slug && p.id !== excludeId)
}
