import type { Coffee } from './schema'

interface CompletenessCheck {
  label: string
  filled: boolean
}

/** Admin-only heuristic — never shown to customers. Flags high-value fields that are still empty. */
export function checkCompleteness(coffee: Coffee): { percent: number; missing: string[] } {
  const checks: CompletenessCheck[] = [
    { label: '대표 이미지', filled: Boolean(coffee.heroImage) },
    { label: 'Character 설명', filled: Boolean(coffee.characterReason) },
    { label: '가공 설명', filled: Boolean(coffee.processDescription) },
    { label: '로스터 코멘트', filled: Boolean(coffee.roasterComment) },
    { label: '지역', filled: Boolean(coffee.region) },
    { label: '생산자', filled: Boolean(coffee.producer) },
    { label: '고도', filled: Boolean(coffee.altitude) },
    { label: '품종', filled: Boolean(coffee.variety) },
    { label: 'Flavor Notes 3개 이상', filled: coffee.notes.length >= 3 },
    { label: '연결된 Brew Guide', filled: coffee.brewGuideIds.length > 0 },
    { label: '연결된 Story', filled: Boolean(coffee.storyId) },
    { label: '추천 대상 문구', filled: Boolean(coffee.recommendedFor) },
  ]

  const filledCount = checks.filter((c) => c.filled).length
  const percent = Math.round((filledCount / checks.length) * 100)
  const missing = checks.filter((c) => !c.filled).map((c) => c.label)

  return { percent, missing }
}
