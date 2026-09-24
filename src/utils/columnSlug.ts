/**
 * Short, tidy public URL slug for a column: the KST calendar date as MMDD (e.g. "0921").
 * Columns are published at most one per day, so this stays unique within a year; if it ever
 * collides (e.g. across years), callers append a numeric suffix (see AdminColumnSchedulerPage).
 */
export function shortColumnSlug(scheduledAtUTC: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(scheduledAtUTC))
  const mm = parts.find((p) => p.type === 'month')?.value ?? '01'
  const dd = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${mm}${dd}`
}
