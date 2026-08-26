export type CupCharacter = 'CLEAR' | 'VIVID' | 'JUICY' | 'CALM' | 'ELEGANT'

export const CUP_CHARACTERS: CupCharacter[] = ['CLEAR', 'VIVID', 'JUICY', 'CALM', 'ELEGANT']

export type SensoryKey = 'acidity' | 'sweetness' | 'body' | 'finish' | 'flavor' | 'accessibility'

export type SensoryScore = 1 | 2 | 3 | 4 | 5

export interface SensoryProfile {
  acidity: SensoryScore
  sweetness: SensoryScore
  body: SensoryScore
  finish: SensoryScore
  flavor: SensoryScore
  accessibility: SensoryScore
}

export interface CoffeeProfile {
  id: string
  coffeeName: string
  country: string
  region: string
  producer: string
  variety: string
  process: string
  altitude: string
  roastLevel: string
  character: CupCharacter
  notes: string[]
  sensory: SensoryProfile
  isSample?: boolean
  createdAt: string
  updatedAt: string
}

export type CoffeeDraft = Omit<CoffeeProfile, 'id' | 'createdAt' | 'updatedAt'>

export const SENSORY_KEYS: SensoryKey[] = [
  'acidity',
  'sweetness',
  'body',
  'finish',
  'flavor',
  'accessibility',
]

export interface ValidationError {
  field: string
  message: string
}
