/**
 * Builds a smooth top-to-bottom CSS gradient from a list of colors, in the order given — the
 * Flavor Spectrum Spine's only rendering primitive. A single color still returns a (visually
 * solid) gradient so callers never need to branch between backgroundColor and backgroundImage.
 */
export function createFlavorGradient(colors: string[]): string {
  if (colors.length === 0) return ''
  if (colors.length === 1) return `linear-gradient(to bottom, ${colors[0]} 0%, ${colors[0]} 100%)`
  const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
  return `linear-gradient(to bottom, ${stops.join(', ')})`
}
