import { CUP_CHARACTERS, type CupCharacter, type SensoryProfile } from '../types'

/**
 * Flavor keyword → per-Character weight, from the KOI Character definitions. Most keywords
 * belong to one Character (weight 3). A few notes genuinely straddle two Characters (e.g.
 * "White Peach" reads mostly ELEGANT but carries a JUICY echo) and carry a second, smaller
 * weight — this is what lets combinations like "Strawberry + Raspberry + Bergamot + Jasmine"
 * tilt toward ELEGANT instead of splitting evenly.
 */
const CHARACTER_FLAVOR_WEIGHTS: Record<string, Partial<Record<CupCharacter, number>>> = {
  // CLEAR
  lemon: { CLEAR: 3 },
  lime: { CLEAR: 3 },
  orange: { CLEAR: 3 },
  grapefruit: { CLEAR: 3 },
  citrus: { CLEAR: 3 },
  'green apple': { CLEAR: 3 },
  apple: { CLEAR: 3 },
  'black tea': { CLEAR: 3, ELEGANT: 1 },
  'green tea': { CLEAR: 3 },
  tea: { CLEAR: 3 },
  clean: { CLEAR: 3 },
  crisp: { CLEAR: 3 },

  // VIVID
  blackberry: { VIVID: 3 },
  blackcurrant: { VIVID: 3 },
  raspberry: { VIVID: 3 },
  strawberry: { VIVID: 3, JUICY: 1 },
  blueberry: { VIVID: 3 },
  grape: { VIVID: 3 },
  wine: { VIVID: 3 },
  winey: { VIVID: 3 },
  herbal: { VIVID: 3 },
  fermented: { VIVID: 3 },
  fermentation: { VIVID: 3 },
  spice: { VIVID: 3 },
  funky: { VIVID: 3 },

  // JUICY
  mango: { JUICY: 3 },
  pineapple: { JUICY: 3 },
  'passion fruit': { JUICY: 3 },
  papaya: { JUICY: 3 },
  peach: { JUICY: 3 },
  apricot: { JUICY: 3 },
  plum: { JUICY: 3 },
  nectarine: { JUICY: 3 },
  melon: { JUICY: 3 },
  watermelon: { JUICY: 3 },
  'ripe berry': { JUICY: 3 },
  'tropical fruit': { JUICY: 3 },
  'stone fruit': { JUICY: 3 },

  // CALM
  chocolate: { CALM: 3 },
  'dark chocolate': { CALM: 3 },
  'milk chocolate': { CALM: 3 },
  cacao: { CALM: 3 },
  cocoa: { CALM: 3 },
  'cacao nibs': { CALM: 3 },
  almond: { CALM: 3 },
  walnut: { CALM: 3 },
  hazelnut: { CALM: 3 },
  peanut: { CALM: 3 },
  nutty: { CALM: 3 },
  caramel: { CALM: 3 },
  'brown sugar': { CALM: 3 },
  molasses: { CALM: 3 },
  toffee: { CALM: 3 },

  // ELEGANT
  floral: { ELEGANT: 3 },
  jasmine: { ELEGANT: 3 },
  bergamot: { ELEGANT: 3 },
  'orange blossom': { ELEGANT: 3 },
  'white flower': { ELEGANT: 3 },
  rose: { ELEGANT: 3 },
  'earl grey': { ELEGANT: 3 },
  chamomile: { ELEGANT: 3 },
  'delicate fruit': { ELEGANT: 3 },
  'white peach': { ELEGANT: 3, JUICY: 1 },
  'tea-like floral': { ELEGANT: 3 },
}

// Longest phrase first, so "white peach" is matched instead of the shorter "peach"/"white".
const KEYWORDS_BY_LENGTH = Object.keys(CHARACTER_FLAVOR_WEIGHTS).sort((a, b) => b.length - a.length)

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function emptyScores(): Record<CupCharacter, number> {
  return { CLEAR: 0, VIVID: 0, JUICY: 0, CALM: 0, ELEGANT: 0 }
}

export interface MatchedNote {
  note: string
  keyword: string
  weights: Partial<Record<CupCharacter, number>>
}

/** Scores each note against the flavor keyword table, using only its single longest match. */
export function scoreCharactersByFlavor(notes: string[]): { scores: Record<CupCharacter, number>; matched: MatchedNote[] } {
  const scores = emptyScores()
  const matched: MatchedNote[] = []

  for (const note of notes) {
    const q = note.trim().toLowerCase()
    if (!q) continue
    const keyword = KEYWORDS_BY_LENGTH.find((k) => new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i').test(q))
    if (!keyword) continue
    const weights = CHARACTER_FLAVOR_WEIGHTS[keyword]
    for (const character of CUP_CHARACTERS) {
      scores[character] += weights[character] ?? 0
    }
    matched.push({ note, keyword, weights })
  }

  return { scores, matched }
}

/**
 * Small, secondary nudge from Sensory values — only meaningful when flavor scores are tied
 * or very close, per KOI's Character system (Flavor is the primary signal, Sensory is a
 * tie-breaker only). Each note contributes weight 3 to the flavor score, so this nudge
 * (well under 2 points total) can't override a clear flavor-based winner.
 */
function sensoryTieBreak(sensory: SensoryProfile): Partial<Record<CupCharacter, number>> {
  const { acidity, sweetness, body, flavor } = sensory
  return {
    ELEGANT: (5 - body) * 0.12 + flavor * 0.08,
    CALM: body * 0.12 + sweetness * 0.1 - acidity * 0.08,
    JUICY: acidity * 0.08 + sweetness * 0.08,
  }
}

export interface CharacterRecommendation {
  character: CupCharacter
  /** Combined score per Character (flavor weight + sensory tie-break), for the admin score display. */
  scores: Record<CupCharacter, number>
  /** Rough admin-facing confidence (top score's share of the total) — not a scientific measure. */
  confidence: number
  matched: MatchedNote[]
}

/** Returns null when no flavor note resolves to a known keyword — nothing to recommend from. */
export function recommendCharacter(notes: string[], sensory?: SensoryProfile): CharacterRecommendation | null {
  const { scores: flavorScores, matched } = scoreCharactersByFlavor(notes)
  const totalFlavor = CUP_CHARACTERS.reduce((sum, c) => sum + flavorScores[c], 0)
  if (totalFlavor === 0) return null

  const scores = { ...flavorScores }
  if (sensory) {
    const nudge = sensoryTieBreak(sensory)
    for (const character of CUP_CHARACTERS) {
      scores[character] += nudge[character] ?? 0
    }
  }

  const ranked = [...CUP_CHARACTERS].sort((a, b) => scores[b] - scores[a])
  const top = ranked[0]
  const totalScore = CUP_CHARACTERS.reduce((sum, c) => sum + Math.max(scores[c], 0), 0)
  const confidence = totalScore > 0 ? Math.round((Math.max(scores[top], 0) / totalScore) * 100) : 0

  return { character: top, scores, confidence, matched }
}
