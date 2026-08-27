import type { CupCharacter, SensoryKey } from '../types'

export type TasteFinderTopic = 1 | 2 | 3 | 4 | 5

export const TOPIC_LABEL: Record<TasteFinderTopic, string> = {
  1: '산미와 밝기',
  2: '향미와 향의 방향',
  3: '질감과 바디',
  4: '단맛·여운·균형',
  5: '취향의 개방성·접근성',
}

/**
 * A nudge away from the neutral midpoint (3) on a 1-5 Sensory axis. Positive = more of that
 * quality, negative = less. Aggregated across a test's 5 answers, then matched against real
 * Coffee sensory data — see matchCoffeesFromPreference in tasteFinder.ts.
 */
export interface PreferenceVector {
  acidity?: number
  sweetness?: number
  body?: number
  finish?: number
  flavor?: number
  accessibility?: number
  characterWeights?: Partial<Record<CupCharacter, number>>
}

export interface TasteFinderOption {
  label: string
  vector: PreferenceVector
}

export interface TasteFinderQuestion {
  id: string
  topic: TasteFinderTopic
  question: string
  helperText?: string
  options: TasteFinderOption[]
}

export const SENSORY_AXES: SensoryKey[] = ['acidity', 'sweetness', 'body', 'finish', 'flavor', 'accessibility']

// ---- Reusable 4-point option-text sets (varied per axis/context, not one universal set) ----

function scale(texts: [string, string, string, string], axis: keyof PreferenceVector, magnitudes: [number, number, number, number], character?: CupCharacter, characterMag?: [number, number, number, number]): TasteFinderOption[] {
  return texts.map((label, i) => ({
    label,
    vector: {
      [axis]: magnitudes[i],
      ...(character ? { characterWeights: { [character]: characterMag ? characterMag[i] : magnitudes[i] } } : {}),
    },
  }))
}

function compare(
  textsAB: [string, string, string, string],
  axis: keyof PreferenceVector,
  magnitudes: [number, number, number, number],
  characterA?: CupCharacter,
  characterB?: CupCharacter,
): TasteFinderOption[] {
  return textsAB.map((label, i) => {
    const v: PreferenceVector = { [axis]: magnitudes[i] }
    if (characterA && magnitudes[i] < 0) v.characterWeights = { [characterA]: Math.abs(magnitudes[i]) }
    if (characterB && magnitudes[i] > 0) v.characterWeights = { [characterB]: Math.abs(magnitudes[i]) }
    return { label, vector: v }
  })
}

export const TASTE_FINDER_QUESTIONS: TasteFinderQuestion[] = [
  // ============ TOPIC 1 — 산미와 밝기 / ACIDITY & BRIGHTNESS ============
  {
    id: 't1-q1',
    topic: 1,
    question: '레몬이나 라임처럼 또렷하고 선명한 산미가 느껴지는 커피를 얼마나 즐기시나요?',
    options: scale(['전혀 즐기지 않아요', '가끔은 괜찮아요', '꽤 즐기는 편이에요', '가장 좋아하는 스타일이에요'], 'acidity', [-1.5, 0, 1.2, 2], 'CLEAR', [0, 0, 1, 2]),
  },
  {
    id: 't1-q2',
    topic: 1,
    question: '청사과처럼 상쾌하고 깨끗한 산미와 초콜릿처럼 부드러운 맛 중 어느 쪽에 더 끌리시나요?',
    options: compare(['초콜릿 쪽이 훨씬 좋아요', '초콜릿 쪽에 조금 더 가까워요', '청사과 쪽에 조금 더 가까워요', '청사과 쪽이 훨씬 좋아요'], 'acidity', [-2, -0.8, 0.8, 2], 'CALM', 'CLEAR'),
  },
  {
    id: 't1-q3',
    topic: 1,
    question: '커피가 식으면서 과일의 산뜻함이 더 선명해지는 경험을 좋아하시나요?',
    helperText: '식을수록 향이 더 또렷해지는 것은 맑고 깨끗한 인상의 커피에서 자주 나타납니다.',
    options: scale(['그런 변화는 잘 못 느껴요', '느껴지면 나쁘지 않아요', '그 순간을 좋아해요', '그 변화 자체를 찾아 마셔요'], 'acidity', [-1, 0.2, 1, 1.8], 'CLEAR', [0, 0, 0.5, 1.5]),
  },
  {
    id: 't1-q4',
    topic: 1,
    question: '자몽처럼 약간 쌉쌀하면서 생기 있는 산미가 있는 커피도 즐길 수 있나요?',
    options: scale(['부담스러워서 피하게 돼요', '한 번쯤은 시도해볼 수 있어요', '오히려 매력적으로 느껴져요', '그런 산미를 일부러 찾아요'], 'acidity', [-1.2, 0.3, 1.3, 2], 'VIVID', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't1-q5',
    topic: 1,
    question: '복숭아나 자두처럼 둥글고 부드러운 과일 산미를 선호하시나요?',
    options: scale(['그보다는 다른 산미가 좋아요', '나쁘지 않지만 우선순위는 아니에요', '자주 찾는 편이에요', '가장 편안하게 느끼는 산미예요'], 'acidity', [-0.5, 0.3, 1, 1.5], 'JUICY', [0, 0, 1, 2]),
  },
  {
    id: 't1-q6',
    topic: 1,
    question: '첫 모금에서 산미가 명확하게 느껴지는 커피와 천천히 산미가 드러나는 커피 중 어느 쪽이 좋나요?',
    options: compare(['천천히 드러나는 쪽이 훨씬 좋아요', '천천히 드러나는 쪽에 가까워요', '첫 모금에 명확한 쪽에 가까워요', '첫 모금에 명확한 쪽이 훨씬 좋아요'], 'acidity', [-1, -0.3, 1, 2], 'ELEGANT', 'CLEAR'),
  },
  {
    id: 't1-q7',
    topic: 1,
    question: '홍차에 레몬 한 조각을 넣은 듯 가볍고 산뜻한 인상의 커피를 좋아하시나요?',
    options: scale(['그런 가벼운 인상은 안 끌려요', '가볍게 마실 땐 괜찮아요', '자주 찾는 인상이에요', '가장 이상적인 한 잔이에요'], 'acidity', [-0.8, 0.3, 1.2, 1.8], 'CLEAR', [0, 0, 1, 1.5]),
  },
  {
    id: 't1-q8',
    topic: 1,
    question: '산미가 적고 고소한 커피보다 향이 밝고 생기 있는 커피를 새로운 선택으로 시도해보고 싶나요?',
    options: scale(['늘 마시던 대로가 편해요', '기회가 되면 시도해볼게요', '적극적으로 시도해보고 싶어요', '지금 바로 바꿔보고 싶어요'], 'acidity', [-1, 0.4, 1.3, 2], 'VIVID', [0, 0.2, 1, 1.5]),
  },
  {
    id: 't1-q9',
    topic: 1,
    question: '과일 주스를 마실 때 느껴지는 산뜻한 산미가 커피에서도 느껴지는 것을 긍정적으로 생각하시나요?',
    options: scale(['커피에서는 어색하게 느껴져요', '있으면 재미있는 정도예요', '오히려 반가운 느낌이에요', '그런 커피를 가장 좋아해요'], 'acidity', [-1, 0.3, 1.2, 1.8], 'JUICY', [0, 0, 1, 1.5]),
  },
  {
    id: 't1-q10',
    topic: 1,
    question: '산미가 강하지 않더라도 향미를 또렷하게 만들어주는 정도의 산뜻함은 어느 정도 필요하다고 생각하시나요?',
    options: scale(['전혀 필요 없어요', '아주 약간이면 충분해요', '어느 정도는 있어야 해요', '향의 중심이 될 만큼 필요해요'], 'acidity', [-0.8, 0.2, 0.8, 1.3], 'CLEAR', [0, 0, 0.5, 1]),
  },

  // ============ TOPIC 2 — 향미와 향의 방향 / AROMA & FLAVOR ============
  {
    id: 't2-q1',
    topic: 2,
    question: '자스민이나 꽃차처럼 향이 먼저 느껴지는 커피를 좋아하시나요?',
    options: scale(['꽃향은 낯설게 느껴져요', '가끔은 즐길 수 있어요', '좋아하는 향의 방향이에요', '가장 매력적으로 느끼는 향이에요'], 'flavor', [-0.5, 0.3, 1.2, 1.8], 'ELEGANT', [0, 0, 1.5, 2.5]),
  },
  {
    id: 't2-q2',
    topic: 2,
    question: '망고·파인애플 같은 열대과일 향이 분명한 커피와 익숙한 초콜릿 향의 커피 중 어느 쪽에 더 끌리나요?',
    options: compare(['초콜릿 향이 훨씬 좋아요', '초콜릿 향에 조금 더 가까워요', '열대과일 향에 조금 더 가까워요', '열대과일 향이 훨씬 좋아요'], 'flavor', [-0.5, -0.2, 0.5, 1], 'CALM', 'JUICY'),
  },
  {
    id: 't2-q3',
    topic: 2,
    question: '얼그레이에서 느껴지는 베르가못처럼 향긋한 시트러스 향을 커피에서도 즐기시나요?',
    options: scale(['그런 향은 안 끌려요', '있으면 나쁘지 않아요', '자주 찾는 향이에요', '가장 좋아하는 향이에요'], 'acidity', [-0.3, 0.2, 0.8, 1.2], 'ELEGANT', [0, 0, 1, 1.8]),
  },
  {
    id: 't2-q4',
    topic: 2,
    question: '딸기·라즈베리·블랙베리처럼 베리류가 연상되는 향미를 얼마나 선호하시나요?',
    options: scale(['전혀 선호하지 않아요', '가끔은 즐길 수 있어요', '자주 찾는 향미예요', '가장 좋아하는 향미예요'], 'flavor', [-0.5, 0.3, 1.2, 1.8], 'VIVID', [0, 0, 1.5, 2.5]),
  },
  {
    id: 't2-q5',
    topic: 2,
    question: '복숭아·살구·자두 같은 핵과류의 부드럽고 익은 과일 향을 좋아하시나요?',
    options: scale(['다른 향을 더 선호해요', '나쁘지 않은 정도예요', '자주 찾는 향이에요', '가장 편안하게 느끼는 향이에요'], 'flavor', [-0.3, 0.3, 1, 1.6], 'JUICY', [0, 0, 1.5, 2.3]),
  },
  {
    id: 't2-q6',
    topic: 2,
    question: '아몬드·헤이즐넛·호두처럼 고소한 견과류 향이 중심인 커피를 편안하게 느끼시나요?',
    options: scale(['그다지 편안하지 않아요', '나쁘지 않은 정도예요', '편안하게 느껴요', '가장 편안한 향이에요'], 'flavor', [-0.3, 0.4, 1, 1.6], 'CALM', [0, 0, 1.5, 2.3]),
  },
  {
    id: 't2-q7',
    topic: 2,
    question: '캐러멜·흑설탕·꿀처럼 달콤한 향이 중심인 커피를 자주 찾는 편인가요?',
    options: scale(['거의 찾지 않아요', '가끔 찾아요', '자주 찾는 편이에요', '거의 항상 찾는 스타일이에요'], 'sweetness', [-0.5, 0.4, 1.2, 1.8], 'CALM', [0, 0, 1.5, 2.3]),
  },
  {
    id: 't2-q8',
    topic: 2,
    question: '카카오·다크초콜릿처럼 깊고 쌉쌀한 향이 있는 커피에 매력을 느끼시나요?',
    options: scale(['쌉쌀한 향은 부담스러워요', '가끔은 매력적이에요', '자주 끌리는 향이에요', '가장 매력적으로 느끼는 향이에요'], 'body', [-0.3, 0.3, 1, 1.5], 'CALM', [0, 0, 1.2, 2]),
  },
  {
    id: 't2-q9',
    topic: 2,
    question: '허브·와인·발효 과일처럼 평소 커피에서 만나기 어려운 독특한 향도 적극적으로 경험해보고 싶나요?',
    options: scale(['익숙한 향이 훨씬 편해요', '기회가 되면 시도해볼게요', '적극적으로 경험해보고 싶어요', '그런 독특한 향을 가장 찾아요'], 'accessibility', [1, 0, -1, -1.8], 'VIVID', [0, 0, 1.5, 2.5]),
  },
  {
    id: 't2-q10',
    topic: 2,
    question: '한 가지 향이 또렷한 커피와 여러 향이 순서대로 변화하는 복합적인 커피 중 어느 쪽을 더 흥미롭게 느끼나요?',
    options: compare(['또렷한 한 가지 향이 훨씬 좋아요', '또렷한 쪽에 조금 더 가까워요', '복합적인 쪽에 조금 더 가까워요', '복합적으로 변화하는 쪽이 훨씬 좋아요'], 'flavor', [-1, -0.3, 0.8, 1.6], 'CLEAR', 'ELEGANT'),
  },

  // ============ TOPIC 3 — 질감과 바디 / BODY & MOUTHFEEL ============
  {
    id: 't3-q1',
    topic: 3,
    question: '홍차처럼 가볍고 맑게 넘어가는 커피와 우유처럼 부드럽고 묵직한 커피 중 어느 쪽이 좋나요?',
    options: compare(['홍차처럼 가벼운 쪽이 훨씬 좋아요', '가벼운 쪽에 조금 더 가까워요', '묵직한 쪽에 조금 더 가까워요', '우유처럼 묵직한 쪽이 훨씬 좋아요'], 'body', [-2, -0.8, 0.8, 2], 'CLEAR', 'CALM'),
  },
  {
    id: 't3-q2',
    topic: 3,
    question: '커피를 마셨을 때 입안을 채우는 농도감이 분명한 것을 좋아하시나요?',
    options: scale(['가벼운 쪽이 훨씬 좋아요', '약간의 농도감이면 충분해요', '분명한 농도감을 좋아해요', '진한 농도감을 가장 좋아해요'], 'body', [-1.5, 0, 1.2, 2], 'CALM', [0, 0, 1, 1.8]),
  },
  {
    id: 't3-q3',
    topic: 3,
    question: '필터커피에서도 물처럼 가볍기보다 약간의 점성과 부드러운 질감이 느껴지는 것을 선호하시나요?',
    options: scale(['가벼울수록 좋아요', '크게 상관없어요', '약간의 점성이 좋아요', '점성이 확실히 느껴지는 쪽이 좋아요'], 'body', [-1, 0, 1, 1.6], 'CALM', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't3-q4',
    topic: 3,
    question: '향이 섬세하다면 바디가 가벼운 커피도 충분히 만족스럽다고 생각하시나요?',
    options: scale(['그래도 바디감은 필요해요', '어느 정도는 동의해요', '충분히 만족스러워요', '오히려 그런 커피를 가장 좋아해요'], 'body', [1, 0.3, -0.8, -1.5], 'ELEGANT', [0, 0, 1.2, 2]),
  },
  {
    id: 't3-q5',
    topic: 3,
    question: '초콜릿 음료처럼 밀도 있는 질감과 차처럼 섬세한 질감 중 평소 어느 쪽을 더 자주 찾나요?',
    options: compare(['차처럼 섬세한 쪽이 훨씬 좋아요', '섬세한 쪽에 조금 더 가까워요', '밀도 있는 쪽에 조금 더 가까워요', '초콜릿처럼 밀도 있는 쪽이 훨씬 좋아요'], 'body', [-2, -0.8, 0.8, 2], 'ELEGANT', 'CALM'),
  },
  {
    id: 't3-q6',
    topic: 3,
    question: '커피가 입안에서 매끄럽고 실키하게 느껴지는 질감을 중요하게 생각하시나요?',
    options: scale(['크게 중요하지 않아요', '있으면 좋은 정도예요', '꽤 중요하게 생각해요', '가장 중요한 요소 중 하나예요'], 'body', [-0.3, 0.3, 1, 1.5], 'CALM', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't3-q7',
    topic: 3,
    question: '과일 주스처럼 촉촉하고 과즙감 있는 질감의 커피를 좋아하시나요?',
    options: scale(['그런 질감은 안 끌려요', '나쁘지 않은 정도예요', '자주 찾는 질감이에요', '가장 좋아하는 질감이에요'], 'sweetness', [-0.3, 0.3, 1, 1.5], 'JUICY', [0, 0, 1.5, 2.3]),
  },
  {
    id: 't3-q8',
    topic: 3,
    question: '커피를 삼킨 뒤에도 입안에 묵직한 질감이 남는 것을 좋아하시나요?',
    options: scale(['깔끔하게 사라지는 게 좋아요', '크게 상관없어요', '남는 질감이 좋아요', '오래 남을수록 좋아요'], 'body', [-1.2, 0, 1, 1.6], 'CALM', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't3-q9',
    topic: 3,
    question: '깔끔하게 사라지는 가벼운 질감과 혀에 오래 머무는 진한 질감 중 어떤 쪽이 더 편안한가요?',
    options: compare(['가볍게 사라지는 쪽이 훨씬 편해요', '가벼운 쪽에 조금 더 가까워요', '진한 쪽에 조금 더 가까워요', '진하게 오래 머무는 쪽이 훨씬 편해요'], 'body', [-1.5, -0.5, 0.5, 1.5], 'CLEAR', 'CALM'),
  },
  {
    id: 't3-q10',
    topic: 3,
    question: '같은 향미라면 향의 섬세함과 묵직한 바디 중 어느 요소를 더 중요하게 선택하시나요?',
    options: compare(['향의 섬세함이 훨씬 중요해요', '섬세함 쪽에 조금 더 가까워요', '바디 쪽에 조금 더 가까워요', '묵직한 바디가 훨씬 중요해요'], 'body', [-1.5, -0.5, 0.5, 1.5], 'ELEGANT', 'CALM'),
  },

  // ============ TOPIC 4 — 단맛·여운·균형 / SWEETNESS, FINISH & BALANCE ============
  {
    id: 't4-q1',
    topic: 4,
    question: '커피를 삼킨 뒤 캐러멜이나 흑설탕 같은 단맛이 오래 남는 것을 좋아하시나요?',
    options: scale(['그다지 신경 쓰지 않아요', '있으면 좋은 정도예요', '자주 기대하는 여운이에요', '가장 좋아하는 여운이에요'], 'sweetness', [-0.3, 0.4, 1.2, 1.8], 'CALM', [0, 0, 1, 1.8]),
  },
  {
    id: 't4-q2',
    topic: 4,
    question: '첫 모금의 강렬함보다 마신 뒤 좋은 향이 오래 이어지는 커피를 더 높게 평가하시나요?',
    options: compare(['첫 모금의 강렬함이 훨씬 중요해요', '첫 모금 쪽에 조금 더 가까워요', '여운 쪽에 조금 더 가까워요', '오래 이어지는 여운이 훨씬 중요해요'], 'finish', [-1.5, -0.5, 0.8, 1.6], 'VIVID', 'ELEGANT'),
  },
  {
    id: 't4-q3',
    topic: 4,
    question: '산미와 단맛이 비슷한 강도로 균형을 이루는 커피를 편안하게 느끼시나요?',
    options: scale(['한쪽이 뚜렷한 게 더 좋아요', '어느 정도는 동의해요', '균형 잡힌 쪽이 편안해요', '균형이 가장 중요한 기준이에요'], 'accessibility', [-0.3, 0.2, 0.8, 1.3], 'CALM', [0, 0, 0.5, 1]),
  },
  {
    id: 't4-q4',
    topic: 4,
    question: '잘 익은 과일처럼 산뜻함 뒤에 자연스러운 단맛이 따라오는 커피를 좋아하시나요?',
    options: scale(['그런 흐름은 안 끌려요', '나쁘지 않은 정도예요', '자주 찾는 흐름이에요', '가장 좋아하는 흐름이에요'], 'sweetness', [-0.3, 0.3, 1.1, 1.7], 'JUICY', [0, 0, 1.3, 2]),
  },
  {
    id: 't4-q5',
    topic: 4,
    question: '향이 화려하더라도 단맛이 충분하지 않으면 아쉽게 느끼는 편인가요?',
    options: scale(['향이 좋으면 단맛은 상관없어요', '가끔 아쉬울 때가 있어요', '자주 아쉽게 느껴요', '단맛이 없으면 늘 아쉬워요'], 'sweetness', [-0.5, 0.3, 1, 1.6], 'CALM', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't4-q6',
    topic: 4,
    question: '한 모금마다 맛이 빠르게 사라지는 깔끔한 커피와 오랫동안 향이 남는 커피 중 어느 쪽을 선호하시나요?',
    options: compare(['빠르게 사라지는 깔끔함이 훨씬 좋아요', '깔끔한 쪽에 조금 더 가까워요', '오래 남는 쪽에 조금 더 가까워요', '오랫동안 향이 남는 쪽이 훨씬 좋아요'], 'finish', [-1.6, -0.5, 0.8, 1.6], 'CLEAR', 'ELEGANT'),
  },
  {
    id: 't4-q7',
    topic: 4,
    question: '초콜릿이나 견과류처럼 익숙한 단맛이 지속되는 커피를 매일 마시기 좋다고 느끼시나요?',
    options: scale(['매일 마시기엔 다른 스타일이 좋아요', '가끔은 좋아요', '자주 찾는 데일리 커피예요', '가장 이상적인 데일리 커피예요'], 'sweetness', [-0.3, 0.4, 1.1, 1.7], 'CALM', [0, 0, 1.3, 2.2]),
  },
  {
    id: 't4-q8',
    topic: 4,
    question: '온도가 내려가면서 단맛이 더 뚜렷해지는 커피를 천천히 즐기는 것을 좋아하시나요?',
    options: scale(['빨리 마시는 편이라 상관없어요', '느껴지면 좋은 정도예요', '그 변화를 즐기는 편이에요', '그 변화를 가장 기대하며 마셔요'], 'finish', [-0.3, 0.3, 1, 1.6], 'ELEGANT', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't4-q9',
    topic: 4,
    question: '맛이 한쪽으로 강하게 치우친 커피보다 여러 요소가 조화를 이루는 커피를 선호하시나요?',
    options: scale(['개성이 강한 쪽이 더 좋아요', '둘 다 좋아요', '조화로운 쪽을 더 선호해요', '균형과 조화가 가장 중요해요'], 'accessibility', [-0.5, 0.2, 0.8, 1.3], 'CALM', [0, 0, 0.5, 1]),
  },
  {
    id: 't4-q10',
    topic: 4,
    question: '마신 뒤 입안에 남는 마지막 인상이 좋다면 처음에는 다소 낯선 향미가 있어도 괜찮나요?',
    options: scale(['처음부터 익숙한 향이 편해요', '조금이라면 괜찮아요', '마지막 인상이 좋으면 괜찮아요', '낯선 향일수록 오히려 기대돼요'], 'finish', [-0.3, 0.4, 1.1, 1.7], 'VIVID', [0, 0, 1, 1.8]),
  },

  // ============ TOPIC 5 — 취향 개방성·접근성 / EXPLORATION & ACCESSIBILITY ============
  {
    id: 't5-q1',
    topic: 5,
    question: '평소 익숙한 커피와 전혀 다른 향이 느껴져도 새로운 경험이라면 즐겨보고 싶나요?',
    options: scale(['익숙한 커피가 훨씬 편해요', '가끔은 시도해볼게요', '적극적으로 즐겨보고 싶어요', '새로운 경험을 가장 우선해요'], 'accessibility', [1.5, 0.3, -1, -1.8], 'VIVID', [0, 0, 1.2, 2.2]),
  },
  {
    id: 't5-q2',
    topic: 5,
    question: '처음 마시는 원두를 고를 때 실패 가능성이 적은 편안한 선택과 새로운 경험 중 어느 쪽을 택하나요?',
    options: compare(['편안한 선택이 훨씬 좋아요', '편안한 쪽에 조금 더 가까워요', '새로운 경험 쪽에 조금 더 가까워요', '새로운 경험을 훨씬 선호해요'], 'accessibility', [1.8, 0.6, -0.6, -1.8], 'CALM', 'VIVID'),
  },
  {
    id: 't5-q3',
    topic: 5,
    question: '커피에서 와인이나 발효 과일을 연상시키는 독특한 향이 나타나도 흥미롭게 받아들일 수 있나요?',
    options: scale(['거부감이 먼저 들어요', '낯설지만 시도는 해봐요', '흥미롭게 받아들이는 편이에요', '그런 향을 오히려 반가워해요'], 'accessibility', [1.5, 0.3, -1, -1.8], 'VIVID', [0, 0, 1.3, 2.3]),
  },
  {
    id: 't5-q4',
    topic: 5,
    question: '매일 편하게 마실 커피와 특별한 날 경험할 커피를 고른다면 오늘은 어느 쪽이 필요한가요?',
    options: compare(['매일 마시는 편안한 커피가 필요해요', '편안한 쪽에 조금 더 가까워요', '특별한 경험 쪽에 조금 더 가까워요', '특별한 경험이 되는 커피가 필요해요'], 'accessibility', [1.5, 0.5, -0.5, -1.5], 'CALM', 'ELEGANT'),
  },
  {
    id: 't5-q5',
    topic: 5,
    question: '바리스타의 설명을 들으면 평소 선택하지 않던 산지나 가공방식의 커피도 시도해볼 의향이 있나요?',
    options: scale(['그래도 익숙한 쪽을 선택해요', '설명이 괜찮으면 시도해요', '적극적으로 물어보고 시도해요', '늘 새로운 걸 먼저 물어봐요'], 'accessibility', [1, 0.2, -0.8, -1.5], 'VIVID', [0, 0, 0.8, 1.5]),
  },
  {
    id: 't5-q6',
    topic: 5,
    question: '한 잔의 커피가 익숙하고 안정적인 맛을 주는 것과 기억에 강하게 남는 개성을 보여주는 것 중 무엇을 더 중요하게 생각하나요?',
    options: compare(['안정적인 맛이 훨씬 중요해요', '안정적인 쪽에 조금 더 가까워요', '개성 있는 쪽에 조금 더 가까워요', '기억에 남는 개성이 훨씬 중요해요'], 'accessibility', [1.5, 0.5, -0.5, -1.5], 'CALM', 'VIVID'),
  },
  {
    id: 't5-q7',
    topic: 5,
    question: '맛을 바로 이해하기 쉬운 커피와 여러 번 마셔보며 특징을 발견하는 커피 중 어느 쪽이 더 즐거운가요?',
    options: compare(['바로 이해하기 쉬운 쪽이 훨씬 즐거워요', '이해하기 쉬운 쪽에 조금 더 가까워요', '발견하는 쪽에 조금 더 가까워요', '천천히 발견하는 쪽이 훨씬 즐거워요'], 'accessibility', [1.5, 0.5, -0.5, -1.5], 'CLEAR', 'ELEGANT'),
  },
  {
    id: 't5-q8',
    topic: 5,
    question: '무산소 발효나 실험적인 프로세싱처럼 개성이 강한 커피에도 관심이 있나요?',
    options: scale(['잘 모르겠고 관심도 적어요', '궁금하긴 해요', '관심이 많은 편이에요', '가장 먼저 찾아보는 스타일이에요'], 'accessibility', [1.3, 0.2, -1, -1.8], 'VIVID', [0, 0, 1.3, 2.3]),
  },
  {
    id: 't5-q9',
    topic: 5,
    question: '원두를 선택할 때 이미 좋아하는 Flavor Note를 기준으로 고르는 편인가요, 아니면 처음 보는 Flavor도 적극적으로 선택하나요?',
    options: compare(['늘 좋아하는 노트를 기준으로 골라요', '좋아하는 쪽에 조금 더 가까워요', '새로운 노트 쪽에 조금 더 가까워요', '처음 보는 노트를 적극적으로 선택해요'], 'accessibility', [1.5, 0.5, -0.5, -1.5], 'CALM', 'VIVID'),
  },
  {
    id: 't5-q10',
    topic: 5,
    question: '가격과 희소성이 같다는 조건이라면 안정적으로 맛있는 커피보다 처음 경험하는 독특한 커피를 선택할 가능성이 얼마나 높나요?',
    options: scale(['거의 항상 안정적인 쪽을 선택해요', '반반 정도예요', '독특한 쪽을 선택할 때가 많아요', '거의 항상 독특한 쪽을 선택해요'], 'accessibility', [1.5, 0.2, -1, -1.8], 'VIVID', [0, 0, 1.3, 2.3]),
  },
]
