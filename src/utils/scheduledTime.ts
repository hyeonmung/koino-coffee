const KST_OFFSET = '+09:00'

/**
 * Random time between 06:00:00 and 07:59:59 KST on the given calendar date, returned as a
 * UTC ISO string ready to store. Korea has no DST, so a fixed +09:00 offset is safe forever.
 */
export function randomMorningTime(dateISO: string): string {
  return toScheduledISO(dateISO, randomMorningTimeHHMM())
}

/** A random "HH:MM" between 06:00 and 07:59 KST, for a per-row <input type="time">. */
export function randomMorningTimeHHMM(): string {
  const hour = 6 + Math.floor(Math.random() * 2)
  const minute = Math.floor(Math.random() * 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hour)}:${pad(minute)}`
}

/** Combines a calendar date (YYYY-MM-DD) and a KST wall-clock time (HH:MM) into a UTC ISO string. */
export function toScheduledISO(dateISO: string, timeHHMM: string): string {
  return new Date(`${dateISO}T${timeHHMM}:00${KST_OFFSET}`).toISOString()
}

export function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function isPublished(scheduledAt: string): boolean {
  return new Date(scheduledAt).getTime() <= Date.now()
}

/** Monday..Sunday dates (YYYY-MM-DD, local calendar) starting from `mondayISO`. */
export function weekDates(mondayISO: string): string[] {
  const [y, m, d] = mondayISO.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(base)
    dt.setDate(base.getDate() + i)
    const yy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  })
}

/** The nearest Monday on/after today, as YYYY-MM-DD (local calendar). */
export function nextMondayISO(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun..6=Sat
  const diff = day === 1 ? 0 : day === 0 ? 1 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  const yy = monday.getFullYear()
  const mm = String(monday.getMonth() + 1).padStart(2, '0')
  const dd = String(monday.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
