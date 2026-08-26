import type { BrewGuide } from '../schema'

const now = '2026-01-01T00:00:00.000Z'

export const SEED_BREW_GUIDES: BrewGuide[] = [
  {
    id: 'brew-v60',
    slug: 'v60',
    publishStatus: 'published',
    equipment: 'V60',
    title: 'V60로 내리는 KOINO 원두',
    coffeeDose: '20g',
    water: '320g',
    ratio: '1 : 16',
    temperature: '92°C',
    grind: 'Medium Fine',
    totalTime: '2:40',
    pourSteps: [
      { label: 'Bloom', water: '60g', time: '0:00' },
      { label: '2nd Pour', water: '160g', time: '0:45' },
      { label: '3rd Pour', water: '240g', time: '1:30' },
      { label: 'Final Pour', water: '320g', time: '2:00' },
    ],
    tips: '블룸 단계에서 물을 골고루 적셔주면 이후 추출이 안정적입니다. 마지막 물줄기는 얇고 천천히.',
    commonProblems: '너무 빨리 내려간다면 분쇄도를 조금 더 곱게, 쓴맛이 강하다면 물 온도를 1~2도 낮춰보세요.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'brew-espresso',
    slug: 'espresso',
    publishStatus: 'published',
    equipment: 'Espresso',
    title: '에스프레소 기본 레시피',
    coffeeDose: '18g',
    water: '36g',
    ratio: '1 : 2',
    temperature: '93°C',
    grind: 'Fine',
    totalTime: '0:28',
    pourSteps: [
      { label: 'Shot', water: '36g', time: '0:28' },
    ],
    tips: '추출 시간이 25~30초 사이에 들어오도록 분쇄도를 조정하세요.',
    commonProblems: '너무 시게 느껴지면 분쇄도를 곱게, 너무 쓰면 굵게 조정합니다.',
    createdAt: now,
    updatedAt: now,
  },
]
