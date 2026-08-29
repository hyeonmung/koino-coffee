import type { SiteSettings } from '../schema'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: '코이노니아',
  logoText: 'KOINONIA',
  heroTitle: '한 잔, 새로운 목적지.',
  heroSubtitle: '좋은 원두와 다양한 향미를 통해\n커피의 새로운 경험을 제안합니다.',
  heroCtaPrimaryLabel: '원두 둘러보기',
  heroCtaPrimaryUrl: '/coffees',
  heroCtaSecondaryLabel: '내 취향 찾기',
  heroCtaSecondaryUrl: '/discover',
  instagramUrl: '',
  naverUrl: '',
  purchaseUrl: '',
  businessUrl: '/business',
  footerNote: '© 코이노니아. 모든 원두 정보는 로스터가 직접 작성합니다.',
  seoDefaultTitle: 'KOINONIA ROASTERS 공식사이트',
  seoDefaultDescription:
    '코이노니아의 원두, 향미, 로스팅, 추출 이야기를 만나보세요. 좋은 커피를 발견하고 나에게 맞는 한 잔을 찾는 코이노니아 공식 사이트입니다.',
  ogImage: 'https://koinoniaroasters.co.kr/og-image.png',
  homepageFeaturedCoffeeIds: [],
  homepageStoryIds: [],
  homeSectionVisibility: {},

  updatedAt: new Date().toISOString(),
}
