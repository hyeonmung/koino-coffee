/**
 * Short, tidy public URL slug for a column: the KST calendar date as YYMMDD (e.g. "261002").
 * Columns are published at most one per day, so this stays unique across years too (MMDD alone
 * would collide on the same month/day in a later year).
 */
export function shortColumnSlug(scheduledAtUTC: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(scheduledAtUTC))
  const yy = parts.find((p) => p.type === 'year')?.value ?? '00'
  const mm = parts.find((p) => p.type === 'month')?.value ?? '01'
  const dd = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${yy}${mm}${dd}`
}
