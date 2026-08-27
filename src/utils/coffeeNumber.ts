/** #001 style — always at least 3 digits, never truncated past 999 (e.g. 1000 -> "#1000"). */
export function formatCoffeeNumber(n: number | undefined): string | undefined {
  if (n === undefined || n === null || !Number.isFinite(n) || n <= 0) return undefined
  return `#${String(Math.trunc(n)).padStart(3, '0')}`
}
