import type { CupCharacter } from '../types'

export interface CharacterStyleTokens {
  /** Muted accent color used sparingly — Character label, flavor note text, radar accents. */
  accent: string
  /** Low-opacity fill of the same hue, for the mini/full radar polygon fill. */
  accentSoft: string
}

/**
 * Character → visual accent tokens. KOI's brand identity stays Deep Navy / Warm White /
 * Star Yellow — these Character accents are deliberately muted and used only in small
 * doses (Character label, flavor note text, radar line/points), never as page backgrounds.
 */
export const CHARACTER_STYLE: Record<CupCharacter, CharacterStyleTokens> = {
  CLEAR: { accent: '#3E6E82', accentSoft: 'rgba(62, 110, 130, 0.14)' },
  VIVID: { accent: '#8C3A4F', accentSoft: 'rgba(140, 58, 79, 0.14)' },
  JUICY: { accent: '#BE6A34', accentSoft: 'rgba(190, 106, 52, 0.14)' },
  CALM: { accent: '#77572F', accentSoft: 'rgba(119, 87, 47, 0.14)' },
  ELEGANT: { accent: '#8A6390', accentSoft: 'rgba(138, 99, 144, 0.14)' },
}
