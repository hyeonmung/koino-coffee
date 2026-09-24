/** Best-effort seconds parse from free-text totalTime strings ("2:40", "3m30s", "약 3:00~3:30", ...).
 * Returns null when unparseable — callers must treat that as "unknown", never guess a value. */
export function parseSeconds(text: string): number | null {
  const mmss = text.match(/(\d+)\s*[:：]\s*(\d{1,2})/)
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2])
  const minSec = text.match(/(\d+)\s*m\s*(\d+)?\s*s?/i)
  if (minSec) return Number(minSec[1]) * 60 + Number(minSec[2] ?? 0)
  return null
}

/** Best-effort gram parse from free-text coffeeDose strings ("20g", "18-20g", ...).
 * Returns null when unparseable (e.g. "NOT_SPECIFIED", "12oz"). */
export function parseGrams(text: string): number | null {
  const match = text.match(/(\d+(\.\d+)?)\s*g/)
  return match ? Number(match[1]) : null
}

/** Best-effort "1:N" ratio denominator parse ("1:15", "1:16.7", ...). Deliberately does not match
 * reversed notations like "16:1" — those need their own review, never silently reinterpreted. */
export function parseRatioDenominator(text: string): number | null {
  const match = text.match(/1\s*[:：]\s*(\d+(\.\d+)?)/)
  return match ? Number(match[1]) : null
}

/** A bucketed integer for dose/ratio filter categories — "16.5g" and "1:16.7" both belong in the
 * "16" bucket. Only categories with at least one matching recipe should ever be shown; never
 * pre-populate a full numeric range up front. */
export function bucketInt(value: number): number {
  return Math.floor(value)
}

const ICE_PATTERN = /아이스|iced|콜드브루|cold\s*brew|얼음/i

/** Fallback for when the admin hasn't set BrewGuide.servingStyle explicitly (most OPEN recipes
 * never got one — 194/195 are null in the source data). Callers should prefer guide.servingStyle
 * and only fall back to this: infer HOT vs ICED from what the recipe actually is — title wording
 * or "Cold Brew" equipment — rather than leaving the ICE filter permanently empty. Defaults to
 * HOT, matching the vast majority of real pour-over recipes. */
export function inferServingStyle(guide: { title: string; equipment: string }): 'HOT' | 'ICED' {
  if (guide.equipment === 'Cold Brew') return 'ICED'
  return ICE_PATTERN.test(guide.title) ? 'ICED' : 'HOT'
}
