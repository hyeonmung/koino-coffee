import type { CoffeeProfile, CupCharacter } from '../types'
import type { ImageFocalPoint } from '../constants/media'

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

  /** KOI Coffee Archive Number — admin-assigned, unique, never auto-generated. Displayed as e.g. #001. */
  coffeeNumber?: number

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
  imageFocalPoint?: ImageFocalPoint

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

/** A Flavor Descriptor's own visual identity — independent of Character. Two variants so text stays readable on both Warm White and Deep Navy backgrounds. */
export interface FlavorColor {
  onLight: string
  onDark: string
}

export interface FlavorDescriptor {
  id: string
  name: string
  nameKo?: string
  familyId: string
  description?: string
  example?: string
  aliases: string[]
  /** The note's own color, independent of any coffee's Character. Falls back to a neutral tone when unset. */
  color?: FlavorColor
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

/** A professional Brew Guide category (핸드드립, 에스프레소, 트러블슈팅, ...) — separate from Equipment tags. Admin-managed. */
export interface BrewCategory {
  id: string
  slug: string
  label: string
  labelEn: string
  order: number
  visible: boolean
}

export interface BrewGuide {
  id: string
  slug: string
  publishStatus: PublishStatus
  categoryId?: string
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

export type StoryCategory = 'NEWS' | 'ORIGIN' | 'COFFEE' | 'ROASTING' | 'BREWING' | 'SENSORY' | 'KOI' | 'EDUCATION'

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

export type BusinessPostCategory = 'WHOLESALE' | 'EDUCATION' | 'CLASS' | 'NOTICE' | 'PARTNERSHIP'

export interface BusinessLink {
  label: string
  url: string
}

/**
 * 납품 · 교육 content post — replaces the old inquiry-landing form. One post per announcement
 * (wholesale info, a class, a notice, ...). Exactly one post (the seeded wholesale-inquiry
 * post) is ever `isSystemPinned` — always sorted first, and its deletion is blocked in the
 * repository layer.
 */
export interface BusinessPost {
  id: string
  slug: string
  publishStatus: PublishStatus
  title: string
  category: BusinessPostCategory
  coverImage?: string
  excerpt: string
  body: string
  publishedDate: string
  relatedLinks: BusinessLink[]
  isSystemPinned?: boolean
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
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

  updatedAt: string
}

// ── About Editorial Block CMS ────────────────────────────────────────────────
// Content & composition are admin-editable; typography/color/positioning stay
// preset-driven (12-column grid, no free pixel placement) to protect the brand.

export type AboutBlockType =
  | 'BRAND'
  | 'PERSON'
  | 'CAREER_LIST'
  | 'IMAGE_TEXT'
  | 'IMAGE_FULL'
  | 'GALLERY'
  | 'QUOTE'
  | 'PHILOSOPHY'
  | 'FREE_TEXT'
  | 'CTA'

export type AboutLayoutPreset =
  | 'PHOTO_LEFT_TEXT_RIGHT'
  | 'TEXT_LEFT_PHOTO_RIGHT'
  | 'PHOTO_LARGE'
  | 'TEXT_LARGE'
  | 'PHOTO_FULL'
  | 'TEXT_FULL'
  | 'CUSTOM'

export type AboutBackgroundTheme = 'PAPER' | 'WHITE' | 'NIGHT' | 'SOFT'
export type AboutSpacing = 'TIGHT' | 'NORMAL' | 'WIDE'
export type AboutTextWidth = 'NARROW' | 'NORMAL' | 'WIDE'
export type AboutVerticalAlign = 'TOP' | 'CENTER' | 'BOTTOM'
export type AboutTextAlign = 'LEFT' | 'CENTER' | 'RIGHT'
export type AboutImageRatio = '4:5' | '3:4' | '1:1' | '3:2' | '16:9' | 'ORIGINAL'
export type AboutMobileOrder = 'IMAGE_FIRST' | 'TEXT_FIRST'
export type AboutCareerCategory = '자격' | '대회' | '심사' | '교육' | '경력' | '수상' | '활동' | '기타'

export interface AboutCareerItem {
  id: string
  year: string
  organization: string
  detail: string
  category: AboutCareerCategory
  visible: boolean
  featured: boolean
  order: number
}

/**
 * One Editorial Block of the About page. Fields are additive per `type` (a BRAND block
 * only reads title/subtitle/body/image/quote/ctaLabel/ctaUrl; a PERSON block additionally
 * reads the person* fields; a GALLERY block reads galleryImages, etc.) — one flat shape
 * keeps the CRUD/reorder/duplicate logic in the admin editor simple.
 */
export interface AboutBlock {
  id: string
  type: AboutBlockType
  visible: boolean
  order: number

  layout: AboutLayoutPreset
  customImageCols?: number // 4-8, CUSTOM layout only
  customImageSide?: 'LEFT' | 'RIGHT' // CUSTOM layout only
  verticalAlign: AboutVerticalAlign
  textAlign: AboutTextAlign
  background: AboutBackgroundTheme
  spacing: AboutSpacing
  textWidth: AboutTextWidth
  mobileOrder: AboutMobileOrder

  title?: string
  subtitle?: string
  body?: string
  quote?: string
  caption?: string
  ctaLabel?: string
  ctaUrl?: string

  image?: string
  imageAlt?: string
  imageRatio?: AboutImageRatio
  imageFocalPoint?: ImageFocalPoint

  galleryImages?: { url: string; caption?: string }[]
  galleryColumns?: 2 | 3

  // PERSON-type only
  personName?: string
  personEnglishName?: string
  personRole?: string
  personEnglishRole?: string
  careers?: AboutCareerItem[]

  createdAt: string
  updatedAt: string
}

export interface AboutHeroSettings {
  title: string
  subtitle?: string
  imageDesktop?: string
  imageMobile?: string
  overlay: 'low' | 'medium' | 'high'
  textPositionDesktop: 'LEFT' | 'CENTER' | 'RIGHT'
  textPositionMobile: 'LEFT' | 'CENTER'
}

export interface AboutPageSettings {
  hero: AboutHeroSettings
  seoTitle?: string
  seoDescription?: string
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

/** Submitted from the public wholesale-order form on a BusinessPost with category WHOLESALE. */
export interface WholesaleRequest {
  id: string
  name: string
  phone: string
  address: string
  coffeeType: string
  expectedKg: string
  orderFrequency: string
  status: InquiryStatus
  createdAt: string
}

export type SpotlightContentType =
  | 'FEATURED_COFFEE'
  | 'NOTICE'
  | 'EVENT'
  | 'STORY'
  | 'VIDEO'
  | 'BREW'
  | 'EDUCATION'
  | 'BUSINESS'
  | 'CUSTOM'

export type SpotlightOverlayStrength = 'low' | 'medium' | 'high'

/**
 * One slide of the Home Hero's "KOI SPOTLIGHT" carousel. FEATURED_COFFEE/STORY/BREW
 * slides link to an existing Coffee/Story/BrewGuide (linkedId) and derive their
 * title/image/URL from that record at render time, so the admin never re-types data
 * that already exists elsewhere. Other content types (NOTICE/EVENT/VIDEO/EDUCATION/
 * BUSINESS/CUSTOM) are authored directly on the slide.
 */
export interface SpotlightSlide {
  id: string
  contentType: SpotlightContentType
  order: number
  published: boolean

  linkedId?: string // Coffee/Story/BrewGuide id, for the three linked content types

  label?: string // category eyebrow override, e.g. "EVENT" — falls back to a per-type default
  title: string
  description?: string
  ctaText?: string
  ctaUrl?: string

  desktopImage?: string
  mobileImage?: string
  videoUrl?: string
  videoPoster?: string
  altText?: string
  overlayStrength: SpotlightOverlayStrength

  startDate?: string // ISO date (YYYY-MM-DD), inclusive
  endDate?: string // ISO date (YYYY-MM-DD), inclusive

  createdAt: string
  updatedAt: string
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
