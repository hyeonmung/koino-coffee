/**
 * Single source of truth for the Coffee Card image ratio. Every Coffee Card across the
 * site (Home, Explorer, Related/Similar, Character lists, Taste Finder results, Dictionary)
 * renders through CoffeeVisual, which defaults to this — nothing hardcodes 17:11 elsewhere.
 * The Tailwind class is generated from --aspect-coffee-card in src/index.css.
 */
export const COFFEE_CARD_ASPECT_CLASS = 'aspect-coffee-card'
export const COFFEE_CARD_ASPECT_RATIO = 17 / 11
export const COFFEE_CARD_RATIO_LABEL = '17 : 11 (850 × 550)'

export type ImageFocalPoint = 'center' | 'top' | 'bottom' | 'left' | 'right'

export const FOCAL_POINT_LABEL: Record<ImageFocalPoint, string> = {
  center: '중앙',
  top: '위',
  bottom: '아래',
  left: '왼쪽',
  right: '오른쪽',
}

export const FOCAL_POINT_POSITION: Record<ImageFocalPoint, string> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
}
