import { CUP_CHARACTERS, type CoffeeDraft, type ValidationError } from '../types'

export const MAX_FLAVOR_NOTES = 6
export const MIN_SENSORY_SCORE = 1
export const MAX_SENSORY_SCORE = 5

export function validateCoffeeDraft(draft: CoffeeDraft): ValidationError[] {
  const errors: ValidationError[] = []

  if (!draft.coffeeName.trim()) {
    errors.push({ field: 'coffeeName', message: 'Coffee Name은 필수 입력 항목입니다.' })
  }

  if (!CUP_CHARACTERS.includes(draft.character)) {
    errors.push({ field: 'character', message: 'CUP CHARACTER를 선택해 주세요.' })
  }

  if (draft.notes.length > MAX_FLAVOR_NOTES) {
    errors.push({ field: 'notes', message: `Flavor Notes는 최대 ${MAX_FLAVOR_NOTES}개까지 입력할 수 있습니다.` })
  }

  for (const [key, value] of Object.entries(draft.sensory)) {
    if (value < MIN_SENSORY_SCORE || value > MAX_SENSORY_SCORE) {
      errors.push({ field: `sensory.${key}`, message: `${key} 점수는 1~5 사이여야 합니다.` })
    }
  }

  return errors
}
