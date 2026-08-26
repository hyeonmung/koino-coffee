import { CHARACTER_INFO } from '../../constants/characters'
import { CUP_CHARACTERS } from '../../types'
import type { Character } from '../schema'

const HERO_COPY: Record<string, string> = {
  CLEAR: '군더더기 없이 맑은 한 잔. 티처럼 깨끗하게 마시고 싶을 때 어울립니다.',
  VIVID: '한 모금에 개성이 드러나는 커피. 익숙한 맛보다 강한 인상을 원할 때.',
  JUICY: '잘 익은 과일을 베어 문 듯한 풍부함. 화려하고 과즙감 있는 한 잔.',
  CALM: '고소하고 달콤해서 편하게 매일 마시기 좋은 커피.',
  ELEGANT: '향이 섬세하게 펼쳐지는, 조용하지만 인상적인 커피.',
}

export const SEED_CHARACTERS: Character[] = CUP_CHARACTERS.map((key, index) => {
  const info = CHARACTER_INFO[key]
  return {
    key,
    label: info.label,
    flavors: info.flavors,
    description: info.description,
    heroCopy: HERO_COPY[key],
    order: index,
  }
})
