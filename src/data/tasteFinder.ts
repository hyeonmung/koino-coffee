import type { Coffee } from './schema'
import type { CupCharacter, SensoryScore } from '../types'
import { findDescriptorByNote } from './flavorMatch'
import type { FlavorDescriptor } from './schema'

export interface TasteFinderAnswers {
  feeling: CupCharacter | null
  acidityTarget: SensoryScore | null // null = "상관없음"
  bodyTarget: SensoryScore | null
  flavorFamilyIds: string[]
  noveltyTarget: SensoryScore | null // maps to preferred accessibility
}

export const EMPTY_ANSWERS: TasteFinderAnswers = {
  feeling: null,
  acidityTarget: null,
  bodyTarget: null,
  flavorFamilyIds: [],
  noveltyTarget: null,
}

/**
 * Scoring weights — kept as a single, easily editable object so tuning the algorithm
 * doesn't require touching the matching logic itself. (An admin UI for live-tuning these
 * is a natural follow-up; today they're code-level constants.)
 */
export const TASTE_FINDER_WEIGHTS = {
  characterMatch: 40,
  acidityMax: 20,
  bodyMax: 20,
  flavorFamilyEach: 5,
  flavorFamilyMax: 20,
  noveltyMax: 20,
}

export interface TasteMatch {
  coffee: Coffee
  score: number
  reasons: string[]
}

function closeness(actual: SensoryScore, target: SensoryScore | null, max: number): number {
  if (target === null) return max * 0.5
  const diff = Math.abs(actual - target)
  return Math.max(0, max - diff * (max / 4))
}

export function matchCoffees(
  answers: TasteFinderAnswers,
  coffees: Coffee[],
  descriptors: FlavorDescriptor[],
  limit = 3,
): TasteMatch[] {
  const w = TASTE_FINDER_WEIGHTS
  const maxScore = w.characterMatch + w.acidityMax + w.bodyMax + w.flavorFamilyMax + w.noveltyMax

  const results = coffees.map((coffee) => {
    let score = 0
    const reasons: string[] = []

    if (answers.feeling && coffee.character === answers.feeling) {
      score += w.characterMatch
      reasons.push(`선택하신 인상과 같은 ${coffee.character} 성격의 커피입니다.`)
    }

    score += closeness(coffee.sensory.acidity, answers.acidityTarget, w.acidityMax)
    score += closeness(coffee.sensory.body, answers.bodyTarget, w.bodyMax)

    if (answers.flavorFamilyIds.length > 0) {
      const coffeeFamilyIds = new Set(
        coffee.notes.map((n) => findDescriptorByNote(n, descriptors)?.familyId).filter((v): v is string => Boolean(v)),
      )
      const overlap = answers.flavorFamilyIds.filter((id) => coffeeFamilyIds.has(id)).length
      const flavorScore = Math.min(w.flavorFamilyMax, overlap * w.flavorFamilyEach)
      score += flavorScore
      if (overlap > 0) reasons.push('선호하신 향미 계열과 겹치는 노트가 있습니다.')
    } else {
      score += w.flavorFamilyMax * 0.4
    }

    score += closeness(coffee.sensory.accessibility, answers.noveltyTarget, w.noveltyMax)
    if (answers.noveltyTarget !== null && answers.noveltyTarget <= 2 && coffee.sensory.accessibility <= 2) {
      reasons.push('개성이 뚜렷하고 실험적인 향미를 가진 커피입니다.')
    }
    if (answers.noveltyTarget !== null && answers.noveltyTarget >= 4 && coffee.sensory.accessibility >= 4) {
      reasons.push('누구나 편하게 즐기기 좋은 친숙한 커피입니다.')
    }

    if (reasons.length === 0) reasons.push('입력하신 취향과 전반적으로 균형이 맞는 커피입니다.')

    return { coffee, score: Math.round((score / maxScore) * 100), reasons: reasons.slice(0, 2) }
  })

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
