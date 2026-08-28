import { toRow } from '../caseMap'
import type { Story } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllStories(): Story[] {
  return store.stories
}

export function getPublishedStories(): Story[] {
  return getAllStories()
    .filter((s) => s.publishStatus === 'published')
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
}

export function getStoryBySlug(slug: string): Story | undefined {
  return getAllStories().find((s) => s.slug === slug)
}

export function getStoryById(id: string): Story | undefined {
  return getAllStories().find((s) => s.id === id)
}

export async function upsertStory(story: Story): Promise<Story[]> {
  const { error } = await supabase.from('stories').upsert(toRow(story))
  if (error) throw error

  const index = store.stories.findIndex((s) => s.id === story.id)
  if (index === -1) store.stories = [...store.stories, story]
  else store.stories = store.stories.map((s, i) => (i === index ? story : s))
  return store.stories
}

export async function deleteStory(id: string): Promise<Story[]> {
  const { error } = await supabase.from('stories').delete().eq('id', id)
  if (error) throw error

  store.stories = store.stories.filter((s) => s.id !== id)
  return store.stories
}

export function storySlugExists(slug: string, excludeId?: string): boolean {
  return getAllStories().some((s) => s.slug === slug && s.id !== excludeId)
}
