import type { CoffeeProfile, CupCharacter } from '../types'

export type PublishStatus = 'draft' | 'published' | 'archived'
export type Availability = 'available' | 'limited' | 'archive'
export type RoastType = 'Filter' | 'Espresso' | 'Omni'

/**
 * Coffee extends the original CoffeeProfile shape (unchanged field names) with
 * everything the public platform needs. Keeping the base fields identical lets
 * CoffeeForm/CoffeePreview/RadarChart/CoffeeList/ExportControls keep working
 * unmodified or with only additive changes.
 */
export interface AdvancedRoastData {
  batch?: string
  chargeTemp?: string
  turningPoint?: string
  yellow?: string
  firstCrack?: string
  drop?: string
  totalTime?: string
  developmentTime?: string
  developmentRatio?: string
  dropTemp?: string
  machine?: string
}

export interface Coffee extends CoffeeProfile {
  slug: string
  publishStatus: PublishStatus
  featured: boolean
  sortOrder: number
  availability: Availability

  koreanName?: string

  subregion?: string
  farmOrStation?: string
  harvest?: string
  lot?: string
  grade?: string

  characterReason?: string

  processDescription?: string
  fermentation?: string
  drying?: string
  processTemperature?: string
  processDuration?: string

  roastType?: RoastType
  roastDirection?: string
  recommendedRest?: string
  roaster?: string
  roastData?: AdvancedRoastData

  roasterComment?: string
  baristaComment?: string

  brewGuideIds: string[]

  recommendedFor?: string
  storyId?: string

  purchaseUrl?: string
  heroImage?: string

  chartVisible?: boolean

  seoTitle?: string
  seoDescription?: string

  profileVersion: number
}

export type CoffeeDraft = Omit<Coffee, 'id' | 'createdAt' | 'updatedAt'>

export interface Character {
  key: CupCharacter
  label: string
  flavors: string
  description: string
  heroCopy: string
  image?: string
  order: number
}

export interface FlavorFamily {
  id: string
  name: string
  nameKo?: string
  order: number
}

export interface FlavorDescriptor {
  id: string
  name: string
  nameKo?: string
  familyId: string
  description?: string
  example?: string
  aliases: string[]
}

export type BrewEquipment =
  | 'V60'
  | 'Origami'
  | 'Kalita'
  | 'Aeropress'
  | 'Espresso'
  | 'French Press'
  | 'Cold Brew'
  | string

export interface BrewPourStep {
  label: string
  water: string
  time: string
}

export interface BrewGuide {
  id: string
  slug: string
  publishStatus: PublishStatus
  equipment: BrewEquipment
  title: string
  coffeeDose: string
  water: string
  ratio: string
  temperature: string
  grind: string
  totalTime: string
  pourSteps: BrewPourStep[]
  tips?: string
  commonProblems?: string
  heroImage?: string
  createdAt: string
  updatedAt: string
}

export type StoryCategory = 'ORIGIN' | 'COFFEE' | 'ROASTING' | 'BREWING' | 'SENSORY' | 'KOI' | 'EDUCATION'

export interface Story {
  id: string
  slug: string
  publishStatus: PublishStatus
  title: string
  excerpt: string
  body: string
  category: StoryCategory
  tags: string[]
  coverImage?: string
  publishedDate: string
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

export interface StorySection {
  heading: string
  body: string
  image?: string
}

export interface BusinessSection {
  key: string
  title: string
  body: string
}

export type HomeSectionKey =
  | 'featuredCoffee'
  | 'tasteFinder'
  | 'cupCharacter'
  | 'sensoryMap'
  | 'coffeeChart'
  | 'brewGuide'
  | 'stories'
  | 'about'
  | 'business'

export interface SiteSettings {
  brandName: string
  logoText: string
  heroTitle: string
  heroSubtitle: string
  heroImage?: string
  heroCtaPrimaryLabel: string
  heroCtaPrimaryUrl: string
  heroCtaSecondaryLabel: string
  heroCtaSecondaryUrl: string
  phone?: string
  address?: string
  businessHours?: string
  businessRegistrationInfo?: string
  instagramUrl?: string
  naverUrl?: string
  purchaseUrl?: string
  businessUrl?: string
  footerNote?: string
  seoDefaultTitle: string
  seoDefaultDescription: string
  ogImage?: string
  homepageFeaturedCoffeeIds: string[]
  homepageStoryIds: string[]
  homeSectionVisibility: Partial<Record<HomeSectionKey, boolean>>

  aboutIntro: string
  aboutSections: StorySection[]

  businessIntro: string
  businessSections: BusinessSection[]

  updatedAt: string
}

export type InquiryStatus = 'new' | 'read' | 'archived'

export interface Inquiry {
  id: string
  companyName: string
  contactName: string
  phone: string
  email: string
  businessType: string
  region: string
  interestArea?: string
  expectedVolume?: string
  message: string
  consent: boolean
  status: InquiryStatus
  createdAt: string
}

export type DictionaryCategory = 'FLAVOR' | 'SENSORY' | 'PROCESS' | 'VARIETY' | 'GENERAL'

export interface DictionaryTerm {
  id: string
  term: string
  termKo?: string
  category: DictionaryCategory
  shortDefinition: string
  detailedDefinition?: string
  example?: string
  createdAt: string
  updatedAt: string
}
