import type { Story } from '../schema'

const now = '2026-01-01T00:00:00.000Z'

export const SEED_STORIES: Story[] = [
  {
    id: 'story-koi-sensory-map',
    slug: 'koi-sensory-map-이야기',
    publishStatus: 'published',
    title: 'KOINO SENSORY MAP을 만든 이유',
    excerpt: '커피를 어렵게 설명하지 않고, 취향을 발견하게 돕는 지도를 만들고 싶었습니다.',
    body: `커피를 처음 접하는 손님에게 "이 원두는 SCA 87점, 애시드 톤이 밝고..." 라고 설명하면 대부분 다음 문장을 놓칩니다.

KOINO SENSORY MAP은 반대로 접근합니다. Character 하나로 첫인상을 전달하고, Flavor Notes로 구체적인 향을 보여주고, 마지막에 Sensory Profile로 수치를 확인하는 순서입니다.

산미가 높다고 더 좋은 커피가 아닙니다. 접근성이 높다고 더 좋은 커피도 아닙니다. 각 원두의 개성과 손님의 취향을 연결하는 것, 그것이 이 시스템의 전부입니다.`,
    category: 'KOI',
    tags: ['KOINO', '브랜드'],
    publishedDate: '2026-01-05',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'story-washed-vs-natural',
    slug: 'washed-natural-차이',
    publishStatus: 'published',
    title: 'Washed와 Natural, 무엇이 다를까',
    excerpt: '같은 농장, 같은 나무에서 딴 체리라도 프로세싱에 따라 완전히 다른 커피가 됩니다.',
    body: `Washed(수세식)는 체리 과육을 벗겨내고 발효조에서 점액질만 제거한 뒤 건조합니다. 원두 본연의 산미와 클린컵이 선명하게 드러납니다.

Natural(건식)은 체리를 통째로 건조합니다. 과육의 당분이 그대로 스며들어 진한 단맛과 과일향이 특징입니다.

두 방식 중 무엇이 더 좋다고 말할 수 없습니다. 어떤 개성을 원하는지에 따라 선택이 달라질 뿐입니다.`,
    category: 'EDUCATION',
    tags: ['프로세스', '교육'],
    publishedDate: '2026-01-10',
    createdAt: now,
    updatedAt: now,
  },
]
