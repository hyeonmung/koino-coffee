import type { AboutBlock, AboutPageSettings } from '../schema'

const now = '2026-01-01T00:00:00.000Z'

function base(overrides: Partial<AboutBlock> & Pick<AboutBlock, 'id' | 'type' | 'order'>): AboutBlock {
  return {
    visible: true,
    layout: 'TEXT_FULL',
    verticalAlign: 'CENTER',
    textAlign: 'LEFT',
    background: 'PAPER',
    spacing: 'NORMAL',
    textWidth: 'NORMAL',
    mobileOrder: 'IMAGE_FIRST',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// Migrated from the previous settings.aboutIntro / aboutSections — content preserved, not
// deleted, just moved into the new Editorial Block system. PERSON blocks are intentionally
// not seeded (no real representative info exists yet) — the operator adds them via the CMS.
export const SEED_ABOUT_BLOCKS: AboutBlock[] = [
  base({
    id: 'about-brand-intro',
    type: 'BRAND',
    order: 0,
    layout: 'TEXT_FULL',
    textAlign: 'CENTER',
    background: 'WHITE',
    textWidth: 'NORMAL',
    title: '코이노니아',
    body: '코이노니아는 좋은 원두를 정직하게 로스팅하고, 그 맛을 가장 잘 표현하는 방법을 함께 고민하는 로스터리입니다.',
  }),
  base({
    id: 'about-section-why',
    type: 'FREE_TEXT',
    order: 1,
    textAlign: 'CENTER',
    title: '우리가 커피를 하는 이유',
    body: '커피 한 잔에는 산지의 계절과 사람의 손길, 그리고 로스터의 판단이 함께 담깁니다. 코이노니아는 그 과정을 손님에게 정직하게 전달하는 것을 가장 중요하게 생각합니다.',
  }),
  base({
    id: 'about-section-roasting',
    type: 'PHILOSOPHY',
    order: 2,
    textAlign: 'CENTER',
    title: '로스팅',
    body: '원두마다 표현하고 싶은 향미가 다르기 때문에, 하나의 로스팅 공식을 모든 원두에 똑같이 적용하지 않습니다. 매 배치마다 그 원두가 가장 자연스럽게 드러날 수 있는 지점을 찾습니다.',
  }),
  base({
    id: 'about-section-brew',
    type: 'FREE_TEXT',
    order: 3,
    textAlign: 'CENTER',
    title: '핸드드립과 다양한 원두',
    body: '산지, 품종, 가공 방식에 따라 완전히 다른 개성을 가진 원두를 소개합니다. 화려한 산미부터 편안한 단맛까지, 다양한 원두를 통해 커피의 폭넓은 스펙트럼을 경험할 수 있도록 구성합니다.',
  }),
  base({
    id: 'about-section-education',
    type: 'FREE_TEXT',
    order: 4,
    textAlign: 'CENTER',
    title: '교육',
    body: '좋은 원두를 아는 것만큼 중요한 것은 그것을 집에서도 맛있게 내리는 방법입니다. 브루 가이드와 클래스를 통해 손님이 직접 좋은 한 잔을 완성할 수 있도록 돕습니다.',
  }),
  base({
    id: 'about-cta',
    type: 'CTA',
    order: 5,
    textAlign: 'CENTER',
    ctaLabel: '원두 둘러보기',
    ctaUrl: '/coffees',
  }),
]

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  hero: {
    title: '코이노니아',
    subtitle: '좋은 원두를 정직하게, 그 맛을 쉽게.',
    overlay: 'medium',
    textPositionDesktop: 'CENTER',
    textPositionMobile: 'CENTER',
  },
  updatedAt: now,
}
