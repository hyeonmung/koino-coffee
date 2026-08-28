import type {
  AboutBlock,
  BrewCategory,
  BrewGuide,
  BusinessPost,
  Character,
  Coffee,
  DictionaryTerm,
  FlavorDescriptor,
  FlavorFamily,
  Inquiry,
  SpotlightSlide,
  Story,
} from './schema'
import { SEED_CHARACTERS } from './seed/characters'
import { upsertCoffee } from './repositories/coffeeRepository'
import { updateCharacter } from './repositories/characterRepository'
import { upsertFlavorFamily, upsertFlavorDescriptor } from './repositories/flavorRepository'
import { upsertBrewCategory } from './repositories/brewCategoryRepository'
import { upsertBrewGuide } from './repositories/brewGuideRepository'
import { upsertStory } from './repositories/storyRepository'
import { upsertBusinessPost } from './repositories/businessPostRepository'
import { upsertAboutBlock, updateAboutPageSettings } from './repositories/aboutRepository'
import { upsertSpotlightSlide } from './repositories/spotlightRepository'
import { upsertDictionaryTerm } from './repositories/dictionaryRepository'
import { addInquiry } from './repositories/inquiryRepository'
import { updateSiteSettings } from './repositories/siteSettingsRepository'

function readArray<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readObject<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export interface MigrationReport {
  counts: Record<string, number>
  errors: string[]
}

/**
 * One-time push of this browser's localStorage content (the pre-Supabase source of truth)
 * up to Supabase. Safe to run more than once — every write is an upsert keyed by id, so
 * re-running just re-syncs the same rows rather than duplicating them.
 */
export async function migrateLocalDataToSupabase(): Promise<MigrationReport> {
  const counts: Record<string, number> = {}
  const errors: string[] = []

  async function runAll<T>(label: string, items: T[], fn: (item: T) => Promise<unknown>) {
    counts[label] = 0
    for (const item of items) {
      try {
        await fn(item)
        counts[label]++
      } catch (err) {
        errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  // Order matters: coffees reference characters + stories, brew guides reference brew
  // categories, flavor descriptors reference flavor families — the referenced row must
  // exist before the referencing one is inserted, or the foreign key check fails.
  const characterOverrides = readObject<Partial<Record<string, Partial<Character>>>>('koi-sensory-map-character-overrides') ?? {}
  await runAll('캐릭터', SEED_CHARACTERS, async (seed) => {
    const patch = characterOverrides[seed.key] ?? {}
    await updateCharacter(seed.key, { ...seed, ...patch })
  })

  await runAll('향미 카테고리', readArray<FlavorFamily>('koi-sensory-map-flavor-families'), upsertFlavorFamily)
  await runAll('향미 노트', readArray<FlavorDescriptor>('koi-sensory-map-flavor-descriptors'), upsertFlavorDescriptor)
  await runAll('브루 가이드 카테고리', readArray<BrewCategory>('koi-sensory-map-brew-categories'), upsertBrewCategory)
  await runAll('브루 가이드', readArray<BrewGuide>('koi-sensory-map-brew-guides'), upsertBrewGuide)
  await runAll('이야기', readArray<Story>('koi-sensory-map-stories'), upsertStory)
  await runAll('원두', readArray<Coffee>('koi-sensory-map-coffees'), upsertCoffee)
  await runAll('납품·교육 게시물', readArray<BusinessPost>('koi-sensory-map-business-posts'), upsertBusinessPost)
  await runAll('About 블록', readArray<AboutBlock>('koi-sensory-map-about-blocks'), upsertAboutBlock)
  await runAll('스포트라이트', readArray<SpotlightSlide>('koi-sensory-map-spotlight'), upsertSpotlightSlide)
  await runAll('커피 사전', readArray<DictionaryTerm>('koi-sensory-map-dictionary-terms'), upsertDictionaryTerm)
  await runAll('문의', readArray<Inquiry>('koi-sensory-map-inquiries'), addInquiry)

  const siteSettings = readObject('koi-sensory-map-site-settings')
  if (siteSettings) {
    try {
      await updateSiteSettings(siteSettings)
      counts['사이트 설정'] = 1
    } catch (err) {
      errors.push(`사이트 설정: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const aboutPageSettings = readObject('koi-sensory-map-about-settings')
  if (aboutPageSettings) {
    try {
      await updateAboutPageSettings(aboutPageSettings)
      counts['About 페이지 설정'] = 1
    } catch (err) {
      errors.push(`About 페이지 설정: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { counts, errors }
}
