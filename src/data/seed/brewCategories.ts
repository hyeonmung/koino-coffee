import type { BrewCategory } from '../schema'

export const SEED_BREW_CATEGORIES: BrewCategory[] = [
  { id: 'cat-pour-over', slug: 'pour-over', label: '핸드드립', labelEn: 'POUR OVER', order: 0, visible: true },
  { id: 'cat-immersion', slug: 'immersion', label: '침지식 추출', labelEn: 'IMMERSION', order: 1, visible: true },
  { id: 'cat-espresso', slug: 'espresso', label: '에스프레소', labelEn: 'ESPRESSO', order: 2, visible: true },
  { id: 'cat-iced-cold', slug: 'iced-cold', label: '아이스 · 콜드 추출', labelEn: 'ICED & COLD', order: 3, visible: true },
  { id: 'cat-brew-variables', slug: 'brew-variables', label: '추출 변수', labelEn: 'BREW VARIABLES', order: 4, visible: true },
  { id: 'cat-water-grind', slug: 'water-grind', label: '물 · 분쇄', labelEn: 'WATER & GRIND', order: 5, visible: true },
  { id: 'cat-recipe-dial-in', slug: 'recipe-dial-in', label: '레시피 설계 · 다이얼인', labelEn: 'RECIPE & DIAL-IN', order: 6, visible: true },
  { id: 'cat-troubleshooting', slug: 'troubleshooting', label: '트러블슈팅', labelEn: 'TROUBLESHOOTING', order: 7, visible: true },
]
