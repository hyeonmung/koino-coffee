const HANGUL_INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

// Doubled/tense initials bucket into their base consonant for the simplified 14-key index.
const INITIAL_TO_BASE: Record<string, string> = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' }

export const HANGUL_INDEX = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

/**
 * The 초성(initial consonant) of the first valid Hangul syllable in `text`, computed from
 * Unicode codepoint math (not a naive startsWith) — e.g. "베르가못" -> "ㅂ". Returns null for
 * non-Hangul text (skips leading whitespace).
 */
export function getHangulInitial(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  const code = trimmed.codePointAt(0)!
  if (code < 0xac00 || code > 0xd7a3) return null
  const initialIndex = Math.floor((code - 0xac00) / 588)
  const initial = HANGUL_INITIALS[initialIndex]
  return INITIAL_TO_BASE[initial] ?? initial
}

/** First A-Z letter of `text` (case-insensitive), or null if it doesn't start with one. */
export function getLatinInitial(text: string): string | null {
  const ch = text.trim().charAt(0).toUpperCase()
  return /^[A-Z]$/.test(ch) ? ch : null
}
