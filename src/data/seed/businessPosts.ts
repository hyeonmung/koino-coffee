import type { BusinessPost } from '../schema'

const now = '2026-01-01T00:00:00.000Z'

/**
 * The one system-pinned post — always first, deletion blocked in the repository. Seeded with
 * an honest, editable scaffold rather than invented contact details (no real phone/email
 * exists yet) — the operator fills in real wholesale terms and contact info via the CMS.
 */
export const SEED_BUSINESS_POSTS: BusinessPost[] = [
  {
    id: 'business-wholesale-inquiry',
    slug: 'wholesale-inquiry',
    publishStatus: 'published',
    title: '원두 납품 문의',
    category: 'WHOLESALE',
    excerpt: '카페와 매장을 위한 코이노커피 원두 납품 안내입니다.',
    body: `코이노커피는 카페, 레스토랑, 사무실 등 다양한 공간에 원두를 납품하고 있습니다.

## 납품 안내

납품을 원하시는 원두 종류, 예상 사용량, 배송 주기를 알려주시면 담당자가 확인 후 안내드립니다. 소량 주문부터 정기 납품까지 상담 가능합니다.

## 문의 방법

아래 연락처 또는 관련 링크를 통해 문의해주세요. (연락처는 사이트 설정 → 연락처 · 링크 또는 이 글의 "관련 링크"에서 관리자가 직접 입력합니다.)`,
    publishedDate: now,
    relatedLinks: [],
    isSystemPinned: true,
    createdAt: now,
    updatedAt: now,
  },
]
