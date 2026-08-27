import { CHARACTER_INFO } from '../constants/characters'
import { SENSORY_FIELDS } from '../constants/sensory'
import type { Coffee } from './schema'
import {
  SENSORY_AXES,
  TASTE_FINDER_QUESTIONS,
  type PreferenceVector,
  type TasteFinderQuestion,
  type TasteFinderTopic,
} from './tasteFinderQuestions'
import { CUP_CHARACTERS, type CupCharacter, type SensoryKey, type SensoryScore } from '../types'

const LAST_QUESTIONS_KEY = 'koi-sensory-map-taste-finder-last-questions'
const TOPICS: TasteFinderTopic[] = [1, 2, 3, 4, 5]

/**
 * One random question per topic (5 total). Prefers a question that wasn't used in the
 * immediately previous test (per topic), so retesting right away doesn't just repeat the
 * same 5 questions — falls back to the full topic pool once every question's been seen.
 */
export function pickQuestionSet(bank: TasteFinderQuestion[] = TASTE_FINDER_QUESTIONS): TasteFinderQuestion[] {
  let lastIds: string[] = []
  try {
    lastIds = JSON.parse(localStorage.getItem(LAST_QUESTIONS_KEY) ?? '[]')
  } catch {
    lastIds = []
  }

  const picked = TOPICS.map((topic) => {
    const pool = bank.filter((q) => q.topic === topic)
    const notLast = pool.filter((q) => !lastIds.includes(q.id))
    const choices = notLast.length > 0 ? notLast : pool
    return choices[Math.floor(Math.random() * choices.length)]
  })

  try {
    localStorage.setItem(LAST_QUESTIONS_KEY, JSON.stringify(picked.map((q) => q.id)))
  } catch {
    // localStorage unavailable — repeat-avoidance is a nice-to-have, not required for the test to work
  }

  return picked
}

export function emptyVector(): PreferenceVector {
  return { characterWeights: {} }
}

export function addVector(a: PreferenceVector, b: PreferenceVector): PreferenceVector {
  const next: PreferenceVector = { ...a, characterWeights: { ...a.characterWeights } }
  for (const axis of SENSORY_AXES) {
    if (b[axis] !== undefined) next[axis] = (next[axis] ?? 0) + b[axis]!
  }
  if (b.characterWeights) {
    for (const character of CUP_CHARACTERS) {
      const w = b.characterWeights[character]
      if (w) next.characterWeights![character] = (next.characterWeights![character] ?? 0) + w
    }
  }
  return next
}

function dominantCharacter(vector: PreferenceVector): CupCharacter | null {
  const weights = vector.characterWeights ?? {}
  let best: CupCharacter | null = null
  let bestScore = 0
  for (const character of CUP_CHARACTERS) {
    const w = weights[character] ?? 0
    if (w > bestScore) {
      best = character
      bestScore = w
    }
  }
  return best
}

export interface TasteMatch {
  coffee: Coffee
  score: number
  reasons: string[]
}

const AXIS_MAX = 15
const CHARACTER_MAX = 30

/**
 * Scores coffees against an aggregated preference vector (the sum of a test's 5 answers) —
 * not against the specific question IDs asked. Two people who answer differently-worded
 * questions the same way end up with a similar vector, and therefore similar recommendations.
 * Only Published, non-archived coffees should be passed in (callers filter before calling).
 */
export function matchCoffeesFromVector(vector: PreferenceVector, coffees: Coffee[], limit = 3): TasteMatch[] {
  const leaningCharacter = dominantCharacter(vector)

  const results = coffees.map((coffee) => {
    let score = 0
    const axisContributions: { key: SensoryKey; magnitude: number }[] = []

    for (const key of SENSORY_AXES) {
      const nudge = vector[key]
      if (!nudge) {
        score += AXIS_MAX * 0.5
        continue
      }
      const target = Math.max(1, Math.min(5, Math.round(3 + nudge))) as SensoryScore
      const diff = Math.abs(coffee.sensory[key] - target)
      score += Math.max(0, AXIS_MAX - diff * (AXIS_MAX / 4))
      axisContributions.push({ key, magnitude: Math.abs(nudge) })
    }

    const reasons: string[] = []
    if (leaningCharacter && coffee.character === leaningCharacter) {
      score += CHARACTER_MAX
      reasons.push(`선택하신 답변들이 ${CHARACTER_INFO[leaningCharacter].label} 성격과 가장 잘 맞습니다.`)
    } else {
      score += CHARACTER_MAX * 0.25
    }

    const dominant = axisContributions.sort((a, b) => b.magnitude - a.magnitude)[0]
    if (dominant && dominant.magnitude >= 0.8) {
      const field = SENSORY_FIELDS.find((f) => f.key === dominant.key)
      if (field) reasons.push(`${field.labelKo} 성향이 답변하신 취향과 가깝습니다.`)
    }
    if (reasons.length === 0) reasons.push('입력하신 취향과 전반적으로 균형이 맞는 커피입니다.')

    const maxScore = AXIS_MAX * SENSORY_AXES.length + CHARACTER_MAX
    return { coffee, score: Math.round((score / maxScore) * 100), reasons: reasons.slice(0, 2) }
  })

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
