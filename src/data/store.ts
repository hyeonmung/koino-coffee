import { supabase } from './supabaseClient'
import { rowToCamel } from './caseMap'
import type {
  AboutBlock,
  AboutPageSettings,
  BrewCategory,
  BrewGuide,
  BusinessPost,
  Character,
  Coffee,
  Column,
  DictionaryTerm,
  FlavorDescriptor,
  FlavorFamily,
  Inquiry,
  SiteSettings,
  SpotlightSlide,
  Story,
  WholesaleRequest,
} from './schema'
import { DEFAULT_ABOUT_PAGE_SETTINGS } from './seed/aboutBlocks'
import { DEFAULT_SITE_SETTINGS } from './seed/siteSettings'
import { SEED_CHARACTERS } from './seed/characters'

/**
 * Everything the app reads is loaded into this in-memory cache once, at boot (see
 * `initStore`). Every repository's *read* functions stay synchronous by reading straight
 * from these arrays — exactly like the old localStorage version — so no page/component
 * had to change to become async-aware. Only *writes* (admin actions) are actually async:
 * they hit Supabase, then patch the relevant array here so the UI reflects it immediately.
 */
export const store = {
  ready: false,
  characters: [] as Character[],
  flavorFamilies: [] as FlavorFamily[],
  flavorDescriptors: [] as FlavorDescriptor[],
  brewCategories: [] as BrewCategory[],
  brewGuides: [] as BrewGuide[],
  stories: [] as Story[],
  columns: [] as Column[],
  coffees: [] as Coffee[],
  businessPosts: [] as BusinessPost[],
  aboutBlocks: [] as AboutBlock[],
  spotlightSlides: [] as SpotlightSlide[],
  dictionaryTerms: [] as DictionaryTerm[],
  inquiries: [] as Inquiry[],
  wholesaleRequests: [] as WholesaleRequest[],
  siteSettings: DEFAULT_SITE_SETTINGS as SiteSettings,
  aboutPageSettings: DEFAULT_ABOUT_PAGE_SETTINGS as AboutPageSettings,
}

function coffeeRowToCoffee(row: Record<string, unknown>): Coffee {
  const camel = rowToCamel<Record<string, unknown>>(row)
  const { acidity, sweetness, body, finish, flavor, accessibility, ...rest } = camel
  return {
    ...rest,
    sensory: { acidity, sweetness, body, finish, flavor, accessibility },
  } as unknown as Coffee
}

export function coffeeToRow(coffee: Coffee): Record<string, unknown> {
  const { sensory, ...rest } = coffee
  return { ...rest, ...sensory }
}

let initPromise: Promise<void> | null = null

/** Fetches every table once in parallel. Call this before rendering the app; await it. */
export function initStore(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const [
      characters,
      flavorFamilies,
      flavorDescriptors,
      brewCategories,
      brewGuides,
      stories,
      columns,
      coffees,
      businessPosts,
      aboutBlocks,
      spotlightSlides,
      dictionaryTerms,
      inquiries,
      wholesaleRequests,
      siteSettingsRow,
      aboutPageSettingsRow,
    ] = await Promise.all([
      supabase.from('characters').select('*'),
      supabase.from('flavor_families').select('*'),
      supabase.from('flavor_descriptors').select('*'),
      supabase.from('brew_categories').select('*'),
      supabase.from('brew_guides').select('*'),
      supabase.from('stories').select('*'),
      supabase.from('columns').select('*'),
      supabase.from('coffees').select('*'),
      supabase.from('business_posts').select('*'),
      supabase.from('about_blocks').select('*'),
      supabase.from('spotlight_slides').select('*'),
      supabase.from('dictionary_terms').select('*'),
      supabase.from('inquiries').select('*'),
      supabase.from('wholesale_requests').select('*'),
      supabase.from('site_settings').select('*').maybeSingle(),
      supabase.from('about_page_settings').select('*').maybeSingle(),
    ])

    store.characters = characters.data?.length
      ? (characters.data.map((r) => rowToCamel<Character>(r)) as Character[])
      : SEED_CHARACTERS
    store.flavorFamilies = (flavorFamilies.data ?? []).map((r) => rowToCamel<FlavorFamily>(r))
    store.flavorDescriptors = (flavorDescriptors.data ?? []).map((r) => rowToCamel<FlavorDescriptor>(r))
    store.brewCategories = (brewCategories.data ?? []).map((r) => rowToCamel<BrewCategory>(r))
    store.brewGuides = (brewGuides.data ?? []).map((r) => rowToCamel<BrewGuide>(r))
    store.stories = (stories.data ?? []).map((r) => rowToCamel<Story>(r))
    store.columns = (columns.data ?? []).map((r) => rowToCamel<Column>(r))
    store.coffees = (coffees.data ?? []).map(coffeeRowToCoffee)
    store.businessPosts = (businessPosts.data ?? []).map((r) => rowToCamel<BusinessPost>(r))
    store.aboutBlocks = (aboutBlocks.data ?? []).map((r) => rowToCamel<AboutBlock>(r))
    store.spotlightSlides = (spotlightSlides.data ?? []).map((r) => rowToCamel<SpotlightSlide>(r))
    store.dictionaryTerms = (dictionaryTerms.data ?? []).map((r) => rowToCamel<DictionaryTerm>(r))
    store.inquiries = (inquiries.data ?? []).map((r) => rowToCamel<Inquiry>(r))
    store.wholesaleRequests = (wholesaleRequests.data ?? []).map((r) => rowToCamel<WholesaleRequest>(r))
    store.siteSettings = siteSettingsRow.data
      ? { ...DEFAULT_SITE_SETTINGS, ...rowToCamel<SiteSettings>(siteSettingsRow.data) }
      : DEFAULT_SITE_SETTINGS
    store.aboutPageSettings = aboutPageSettingsRow.data
      ? mapAboutPageSettingsRow(aboutPageSettingsRow.data)
      : DEFAULT_ABOUT_PAGE_SETTINGS

    store.ready = true
  })()

  return initPromise
}

/** about_page_settings' hero.* columns are flat in the DB but nested under `hero` in TS. */
function mapAboutPageSettingsRow(row: Record<string, unknown>): AboutPageSettings {
  const camel = rowToCamel<Record<string, unknown>>(row)
  const { heroTitle, heroSubtitle, heroImageDesktop, heroImageMobile, heroOverlay, heroTextPositionDesktop, heroTextPositionMobile, ...rest } =
    camel
  return {
    ...rest,
    hero: {
      title: heroTitle,
      subtitle: heroSubtitle,
      imageDesktop: heroImageDesktop,
      imageMobile: heroImageMobile,
      overlay: heroOverlay,
      textPositionDesktop: heroTextPositionDesktop,
      textPositionMobile: heroTextPositionMobile,
    },
  } as unknown as AboutPageSettings
}

export function aboutPageSettingsToRow(settings: AboutPageSettings): Record<string, unknown> {
  const { hero, ...rest } = settings
  return {
    ...rest,
    heroTitle: hero.title,
    heroSubtitle: hero.subtitle,
    heroImageDesktop: hero.imageDesktop,
    heroImageMobile: hero.imageMobile,
    heroOverlay: hero.overlay,
    heroTextPositionDesktop: hero.textPositionDesktop,
    heroTextPositionMobile: hero.textPositionMobile,
  }
}
