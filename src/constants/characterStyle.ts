import type { CupCharacter } from '../types'

export interface CharacterStyleTokens {
  /** Muted accent color used sparingly — Character label, flavor note text, radar accents. */
  accent: string
  /** Low-opacity fill of the same hue, for the mini/full radar polygon fill. */
  accentSoft: string
}

interface CharacterStylePair {
  onLight: CharacterStyleTokens
  onDark: CharacterStyleTokens
}

/**
 * Character → visual accent tokens. KOI's brand identity stays Deep Navy / Warm White /
 * Star Yellow — these Character accents are deliberately muted and used only in small
 * doses (Character label, flavor note text, radar line/points), never as page backgrounds.
 *
 * Each hue has an onLight and onDark variant (same convention as src/constants/flavorColor.ts)
 * so the accent stays legible against both the light canvas and the dark-mode canvas — CALM's
 * near-black brown in particular is invisible on a dark background without its own variant.
 */
const CHARACTER_STYLE: Record<CupCharacter, CharacterStylePair> = {
  CLEAR: {
    onLight: { accent: '#f4c542', accentSoft: 'rgba(244, 197, 66, 0.14)' },
    onDark: { accent: '#f4c542', accentSoft: 'rgba(244, 197, 66, 0.18)' },
  },
  VIVID: {
    onLight: { accent: '#9a30ae', accentSoft: 'rgba(154, 48, 174, 0.14)' },
    onDark: { accent: '#c96fd9', accentSoft: 'rgba(201, 111, 217, 0.2)' },
  },
  JUICY: {
    onLight: { accent: '#fd6f22', accentSoft: 'rgba(253, 111, 34, 0.14)' },
    onDark: { accent: '#fd6f22', accentSoft: 'rgba(253, 111, 34, 0.18)' },
  },
  CALM: {
    onLight: { accent: '#482c00', accentSoft: 'rgba(72, 44, 0, 0.14)' },
    onDark: { accent: '#d9a86a', accentSoft: 'rgba(217, 168, 106, 0.2)' },
  },
  ELEGANT: {
    onLight: { accent: '#ee00ff', accentSoft: 'rgba(238, 0, 255, 0.14)' },
    onDark: { accent: '#ee00ff', accentSoft: 'rgba(238, 0, 255, 0.18)' },
  },
}

export function getCharacterStyle(character: CupCharacter, dark: boolean): CharacterStyleTokens {
  return dark ? CHARACTER_STYLE[character].onDark : CHARACTER_STYLE[character].onLight
}
