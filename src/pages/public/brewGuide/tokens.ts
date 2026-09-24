/**
 * Fixed-dark "Brewing Archive" palette — used only on the /brew-guide index and detail pages.
 * Deliberately independent of the site-wide light/dark `data-theme` token system (same pattern
 * as the Footer/mobile-nav's `koi-night-sky`): this section is meant to always read as a quiet,
 * lantern-lit archive at night, regardless of what theme the rest of the site is in.
 */
/** Sentinel field values (e.g. "NOT_SPECIFIED (끓인 물 사용)", "CONFLICTING_SOURCE") sometimes carry a
 * trailing note, so an exact-match check misses them and lets the raw sentinel leak into the UI. */
export function isSentinelValue(value?: string): boolean {
  if (!value) return false
  return value.startsWith('NOT_SPECIFIED') || value.startsWith('CONFLICTING_SOURCE')
}

export const archive = {
  bgMain: 'bg-[#0B1020]',
  bgSurface: 'bg-[#101827]',
  bgCard: 'bg-[#121B29]',
  border: 'border-[rgba(255,255,255,0.07)]',
  borderHover: 'hover:border-[rgba(255,255,255,0.14)]',
  divide: 'divide-[rgba(255,255,255,0.07)]',
  textPrimary: 'text-[#F5F3ED]',
  textSecondary: 'text-[#A4ADBB]',
  textMuted: 'text-[#6F7B8D]',
  hoverTextPrimary: 'hover:text-[#F5F3ED]',
  placeholderMuted: 'placeholder:text-[#6F7B8D]',
  accentBorder: 'border-[#F2C55C]',
  /** Notches the top-left and bottom-right corners so the border line stops short of where the
   * CornerStar sits — the star never has a line crossing through it. */
  cornerNotch: '[clip-path:polygon(14px_0,100%_0,100%_calc(100%-14px),calc(100%-14px)_100%,0_100%,0_14px)]',
  accent: '#F2C55C',
  accentText: 'text-[#F2C55C]',
  accentBg: 'bg-[#F2C55C]',
  blueText: 'text-[#7C96B8]',
} as const
