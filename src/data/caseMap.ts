/**
 * Generic snake_case (Postgres column) <-> camelCase (TS field) conversion, top-level only.
 * jsonb column values are passed through unchanged — their own keys are already camelCase
 * JS as written by the app, never snake_cased on the way in or out.
 */
function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}

export function rowToCamel<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v
  return out as T
}

export function toRow(obj: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    out[toSnake(k)] = v
  }
  return out
}
