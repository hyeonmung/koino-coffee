import { toRow } from '../caseMap'
import type { SpotlightSlide } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllSpotlightSlides(): SpotlightSlide[] {
  return store.spotlightSlides.slice().sort((a, b) => a.order - b.order)
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

export async function upsertSpotlightSlide(slide: SpotlightSlide): Promise<SpotlightSlide[]> {
  const { error } = await supabase.from('spotlight_slides').upsert(toRow(slide))
  if (error) throw error

  const index = store.spotlightSlides.findIndex((s) => s.id === slide.id)
  if (index === -1) store.spotlightSlides = [...store.spotlightSlides, slide]
  else store.spotlightSlides = store.spotlightSlides.map((s, i) => (i === index ? slide : s))
  return getAllSpotlightSlides()
}

export async function deleteSpotlightSlide(id: string): Promise<SpotlightSlide[]> {
  const { error } = await supabase.from('spotlight_slides').delete().eq('id', id)
  if (error) throw error

  store.spotlightSlides = store.spotlightSlides.filter((s) => s.id !== id)
  return getAllSpotlightSlides()
}

/** Swaps the `order` of two slides (used by the admin's move-up/move-down controls). */
export async function reorderSpotlightSlide(id: string, direction: 'up' | 'down'): Promise<SpotlightSlide[]> {
  const slides = getAllSpotlightSlides()
  const index = slides.findIndex((s) => s.id === id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || targetIndex < 0 || targetIndex >= slides.length) return slides

  const a = slides[index]
  const b = slides[targetIndex]
  const aOrder = a.order

  await upsertSpotlightSlide({ ...a, order: b.order })
  await upsertSpotlightSlide({ ...b, order: aOrder })
  return getAllSpotlightSlides()
}
