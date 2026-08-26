import { createLocalCollection } from '../localCollection'
import type { Story } from '../schema'
import { SEED_STORIES } from '../seed/stories'

const collection = createLocalCollection<Story>('koi-sensory-map-stories')

export function getAllStories(): Story[] {
  return collection.seedIfEmpty(SEED_STORIES)
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

export function upsertStory(story: Story): Story[] {
  return collection.upsert(story)
}

export function deleteStory(id: string): Story[] {
  return collection.remove(id)
}

export function storySlugExists(slug: string, excludeId?: string): boolean {
  return getAllStories().some((s) => s.slug === slug && s.id !== excludeId)
}
