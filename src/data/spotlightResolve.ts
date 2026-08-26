import { CHARACTER_INFO } from '../constants/characters'
import { getBrewGuideById } from './repositories/brewGuideRepository'
import { getCoffeeById } from './repositories/coffeeRepository'
import { getStoryById } from './repositories/storyRepository'
import type { SpotlightContentType, SpotlightSlide } from './schema'

export const SPOTLIGHT_TYPE_LABEL: Record<SpotlightContentType, string> = {
  FEATURED_COFFEE: 'NOW SERVING',
  NOTICE: '공지',
  EVENT: 'EVENT',
  STORY: 'KOI STORY',
  VIDEO: '영상',
  BREW: '브루 가이드',
  EDUCATION: '교육',
  BUSINESS: '납품 · 교육',
  CUSTOM: 'KOI COFFEE',
}

export interface ResolvedSpotlight {
  label: string
  title: string
  description?: string
  ctaText: string
  ctaUrl: string
  desktopImage?: string
  mobileImage?: string
  isVideo: boolean
  videoUrl?: string
  videoPoster?: string
  altText: string
}

/**
 * Turns a raw SpotlightSlide into what the carousel actually renders. For the three
 * linked content types, the image and destination URL always come live from the
 * linked Coffee/Story/BrewGuide (so a photo update there shows up without re-editing
 * the slide) — title/description are whatever the admin saved on the slide itself
 * (auto-filled once at creation time by the editor, then free to diverge).
 */
export function resolveSpotlightSlide(slide: SpotlightSlide): ResolvedSpotlight | null {
  const label = slide.label?.trim() || SPOTLIGHT_TYPE_LABEL[slide.contentType]
  const altText = slide.altText?.trim() || slide.title

  if (slide.contentType === 'FEATURED_COFFEE') {
    const coffee = slide.linkedId ? getCoffeeById(slide.linkedId) : undefined
    if (!coffee) return null
    const character = CHARACTER_INFO[coffee.character]
    return {
      label,
      title: slide.title || coffee.coffeeName,
      description:
        slide.description || `${character.label}${coffee.notes.length > 0 ? ` · ${coffee.notes.slice(0, 3).join(' · ')}` : ''}`,
      ctaText: slide.ctaText || '원두 보기',
      ctaUrl: slide.ctaUrl || `/coffees/${coffee.slug}`,
      desktopImage: slide.desktopImage || coffee.heroImage,
      mobileImage: slide.mobileImage || slide.desktopImage || coffee.heroImage,
      isVideo: false,
      altText,
    }
  }

  if (slide.contentType === 'STORY') {
    const story = slide.linkedId ? getStoryById(slide.linkedId) : undefined
    if (!story) return null
    return {
      label,
      title: slide.title || story.title,
      description: slide.description || story.excerpt,
      ctaText: slide.ctaText || '이야기 읽기',
      ctaUrl: slide.ctaUrl || `/stories/${story.slug}`,
      desktopImage: slide.desktopImage || story.coverImage,
      mobileImage: slide.mobileImage || slide.desktopImage || story.coverImage,
      isVideo: false,
      altText,
    }
  }

  if (slide.contentType === 'BREW') {
    const guide = slide.linkedId ? getBrewGuideById(slide.linkedId) : undefined
    if (!guide) return null
    return {
      label,
      title: slide.title || guide.title,
      description: slide.description || `${guide.coffeeDose} · ${guide.ratio} · ${guide.totalTime}`,
      ctaText: slide.ctaText || '레시피 보기',
      ctaUrl: slide.ctaUrl || `/brew-guide/${guide.slug}`,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage || slide.desktopImage,
      isVideo: false,
      altText,
    }
  }

  // NOTICE / EVENT / VIDEO / EDUCATION / BUSINESS / CUSTOM — authored directly on the slide.
  if (!slide.title.trim()) return null
  return {
    label,
    title: slide.title,
    description: slide.description,
    ctaText: slide.ctaText || '자세히 보기',
    ctaUrl: slide.ctaUrl || '/',
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage || slide.desktopImage,
    isVideo: slide.contentType === 'VIDEO' && Boolean(slide.videoUrl),
    videoUrl: slide.videoUrl,
    videoPoster: slide.videoPoster || slide.desktopImage,
    altText,
  }
}
