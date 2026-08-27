import type { CupCharacter } from '../types'

export interface CharacterInfo {
  key: CupCharacter
  label: string
  /** Display string form, e.g. "Citrus · Green Apple · Tea" — kept for existing callers. */
  flavors: string
  /** Same list as `flavors`, as an array — for recommendation-reason text and admin UI. */
  typicalFamilies: string[]
  description: string
}

/**
 * Single source of truth for the 5 Cup Characters — label, description, and the flavor
 * families each one is built from. Every page (Card, Detail, Chart, Filter, Taste Finder,
 * Admin) reads from this instead of redefining Character copy locally. Visual tokens
 * (accent colors) live separately in ./characterStyle.ts.
 */
export const CHARACTER_INFO: Record<CupCharacter, CharacterInfo> = {
  CLEAR: {
    key: 'CLEAR',
    label: 'CLEAR',
    flavors: 'Citrus · Green Apple · Tea',
    typicalFamilies: ['Citrus', 'Green Apple', 'Tea'],
    description: '맑고 선명하며 깔끔한 커피',
  },
  VIVID: {
    key: 'VIVID',
    label: 'VIVID',
    flavors: 'Berry · Grape · Herbal · Fermented',
    typicalFamilies: ['Berry', 'Grape', 'Herbal', 'Fermented'],
    description: '개성과 대비가 강하고 인상적인 커피',
  },
  JUICY: {
    key: 'JUICY',
    label: 'JUICY',
    flavors: 'Tropical · Stone Fruit · Melon · Ripe Berry',
    typicalFamilies: ['Tropical', 'Stone Fruit', 'Melon', 'Ripe Berry'],
    description: '잘 익은 과일처럼 풍부하고 과즙감 있는 커피',
  },
  CALM: {
    key: 'CALM',
    label: 'CALM',
    flavors: 'Chocolate · Nut · Caramel · Brown Sugar',
    typicalFamilies: ['Chocolate', 'Nut', 'Caramel', 'Brown Sugar'],
    description: '고소하고 달콤하며 편안한 커피',
  },
  ELEGANT: {
    key: 'ELEGANT',
    label: 'ELEGANT',
    flavors: 'Floral · Bergamot · Jasmine · Delicate Fruit',
    typicalFamilies: ['Floral', 'Bergamot', 'Jasmine', 'Delicate Fruit'],
    description: '향이 섬세하고 우아하게 펼쳐지는 커피',
  },
}
