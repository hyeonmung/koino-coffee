import type { SiteSettings } from '../schema'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'KOINO COFFEE',
  logoText: 'KOI SENSORY MAP',
  heroTitle: 'KOI SENSORY MAP',
  heroSubtitle: '한 잔을 더 쉽게 이해하는 방법.',
  heroCtaPrimaryLabel: '커피 찾기',
  heroCtaPrimaryUrl: '/discover',
  heroCtaSecondaryLabel: '전체 커피 보기',
  heroCtaSecondaryUrl: '/coffees',
  instagramUrl: '',
  naverUrl: '',
  purchaseUrl: '',
  wholesaleUrl: '/wholesale',
  footerNote: '© KOINO COFFEE. 모든 원두 정보는 로스터가 직접 작성합니다.',
  seoDefaultTitle: 'KOI SENSORY MAP — 코이노커피',
  seoDefaultDescription: '코이노커피가 취급하는 원두를 향미, 산지, 관능 프로파일로 탐색하고 나에게 맞는 커피를 발견하세요.',
  homepageFeaturedCoffeeIds: [],
  homepageStoryIds: [],
  updatedAt: new Date().toISOString(),
}
