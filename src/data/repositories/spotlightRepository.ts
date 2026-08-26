import { createLocalCollection } from '../localCollection'
import type { SpotlightSlide } from '../schema'

const collection = createLocalCollection<SpotlightSlide>('koi-sensory-map-spotlight')

/** No fabricated demo slides — an empty spotlight is a valid, honest starting state. */
export function getAllSpotlightSlides(): SpotlightSlide[] {
  return collection.seedIfEmpty([]).sort((a, b) => a.order - b.order)
}

function isWithinSchedule(slide: SpotlightSlide, today: string): boolean {
  if (slide.startDate && today < slide.startDate) return false
  if (slide.endDate && today > slide.endDate) return false
  return true
}

export function getPublishedSpotlightSlides(): SpotlightSlide[] {
  const today = new Date().toISOString().slice(0, 10)
  return getAllSpotlightSlides().filter((s) => s.published && isWithinSchedule(s, today))
}

export function getSpotlightSlideById(id: string): SpotlightSlide | undefined {
  return getAllSpotlightSlides().find((s) => s.id === id)
}

export function upsertSpotlightSlide(slide: SpotlightSlide): SpotlightSlide[] {
  return collection.upsert(slide)
}

export function deleteSpotlightSlide(id: string): SpotlightSlide[] {
  return collection.remove(id)
}

/** Swaps the `order` of two slides (used by the admin's move-up/move-down controls). */
export function reorderSpotlightSlide(id: string, direction: 'up' | 'down'): SpotlightSlide[] {
  const slides = getAllSpotlightSlides()
  const index = slides.findIndex((s) => s.id === id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || targetIndex < 0 || targetIndex >= slides.length) return slides

  const a = slides[index]
  const b = slides[targetIndex]
  const aOrder = a.order
  collection.upsert({ ...a, order: b.order })
  collection.upsert({ ...b, order: aOrder })
  return getAllSpotlightSlides()
}
