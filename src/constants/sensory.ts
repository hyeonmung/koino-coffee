import type { SensoryKey } from '../types'

export interface SensoryFieldInfo {
  key: SensoryKey
  label: string
  labelKo: string
  criteria: [string, string, string, string, string]
}

export const SENSORY_FIELDS: SensoryFieldInfo[] = [
  {
    key: 'acidity',
    label: 'ACIDITY',
    labelKo: '산미',
    criteria: [
      '산미가 거의 느껴지지 않음',
      '부드럽고 약한 산미',
      '분명히 느껴지는 산미',
      '선명하고 존재감 있는 산미',
      '매우 강하고 뚜렷한 산미',
    ],
  },
  {
    key: 'sweetness',
    label: 'SWEETNESS',
    labelKo: '단맛',
    criteria: [
      '단맛 인상이 거의 없음',
      '약한 단맛',
      '적당한 단맛',
      '분명하고 기분 좋은 단맛',
      '매우 풍부하고 지속적인 단맛',
    ],
  },
  {
    key: 'body',
    label: 'BODY',
    labelKo: '바디',
    criteria: [
      '매우 가볍고 차처럼 산뜻함',
      '가벼운 질감',
      '중간 정도의 바디감',
      '묵직하고 풍부함',
      '매우 농도감 있고 무게감이 큼',
    ],
  },
  {
    key: 'finish',
    label: 'FINISH',
    labelKo: '여운',
    criteria: [
      '여운이 매우 짧음',
      '짧은 편',
      '보통',
      '오래 지속됨',
      '매우 길고 인상적으로 지속됨',
    ],
  },
  {
    key: 'flavor',
    label: 'FLAVOR',
    labelKo: '플레이버',
    criteria: [
      '향미가 단순하고 희미함',
      '약간의 특징이 느껴짐',
      '향미가 분명히 느껴짐',
      '향미가 선명하고 개성이 있음',
      '향미가 매우 또렷하고 복합적이며 인상적임',
    ],
  },
  {
    key: 'accessibility',
    label: 'ACCESSIBILITY',
    labelKo: '접근성',
    criteria: [
      '매우 실험적이며 호불호가 큼',
      '취향을 많이 타는 편',
      '어느 정도 설명이 필요함',
      '대부분의 고객이 쉽게 즐길 수 있음',
      '매우 친숙하고 대중적으로 접근하기 쉬움',
    ],
  },
]
