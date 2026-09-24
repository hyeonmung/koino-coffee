import { toRow } from '../caseMap'
import type { Column } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'
import { isPublished } from '../../utils/scheduledTime'

export function getAllColumns(): Column[] {
  return store.columns.slice().sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
}

/** What a public visitor may see: published status AND the scheduled time has actually passed. */
export function getPublishedColumns(): Column[] {
  return getAllColumns().filter((c) => c.publishStatus === 'published' && isPublished(c.scheduledAt))
}

export function getColumnBySlug(slug: string): Column | undefined {
  const column = store.columns.find((c) => c.slug === slug)
  if (!column) return undefined
  if (column.publishStatus === 'published' && isPublished(column.scheduledAt)) return column
  return undefined
}

export function getColumnById(id: string): Column | undefined {
  return store.columns.find((c) => c.id === id)
}

/** Bumps the view counter server-side (RPC, safe for anonymous visitors) and patches the local store to match. */
export async function incrementColumnViews(id: string): Promise<void> {
  const { data, error } = await supabase.rpc('increment_column_views', { p_id: id })
  if (error) throw error
  store.columns = store.columns.map((c) => (c.id === id ? { ...c, views: data as number } : c))
}

/** Slugs the given (logged-in) user has "좋아요"'d, for seeding the heart state on load. */
export async function getLikedColumnSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('column_likes').select('column_slug').eq('user_id', userId)
  if (error) return []
  return (data ?? []).map((row) => row.column_slug as string)
}

/** Toggles the current logged-in user's "좋아요" for a column (one vote per account, enforced server-side) and patches the local store's tally. */
export async function toggleColumnLike(slug: string): Promise<{ liked: boolean; likeCount: number } | undefined> {
  const { data, error } = await supabase.rpc('toggle_column_like', { p_slug: slug })
  if (error || !data?.[0]) return undefined
  const result = data[0] as { liked: boolean; like_count: number }
  store.columns = store.columns.map((c) => (c.slug === slug ? { ...c, likeCount: result.like_count } : c))
  return { liked: result.liked, likeCount: result.like_count }
}

export async function upsertColumn(column: Column): Promise<Column[]> {
  const { error } = await supabase.from('columns').upsert(toRow(column))
  if (error) throw error

  const index = store.columns.findIndex((c) => c.id === column.id)
  if (index === -1) store.columns = [...store.columns, column]
  else store.columns = store.columns.map((c, i) => (i === index ? column : c))
  return store.columns
}

/** Used by the weekly scheduler to save up to 7 rows in a single round trip. */
export async function batchUpsertColumns(columns: Column[]): Promise<Column[]> {
  if (columns.length === 0) return store.columns
  const { error } = await supabase.from('columns').upsert(columns.map(toRow))
  if (error) throw error

  const byId = new Map(columns.map((c) => [c.id, c]))
  const existingIds = new Set(store.columns.map((c) => c.id))
  const merged = store.columns.map((c) => byId.get(c.id) ?? c)
  for (const c of columns) if (!existingIds.has(c.id)) merged.push(c)
  store.columns = merged
  return store.columns
}

export async function deleteColumn(id: string): Promise<Column[]> {
  const { error } = await supabase.from('columns').delete().eq('id', id)
  if (error) throw error

  store.columns = store.columns.filter((c) => c.id !== id)
  return store.columns
}

export function columnSlugExists(slug: string, excludeId?: string): boolean {
  return store.columns.some((c) => c.slug === slug && c.id !== excludeId)
}

/** Columns already scheduled somewhere within [mondayISO 00:00, +7 days), for the scheduler's duplicate-week warning. */
export function getColumnsInWeek(mondayISO: string): Column[] {
  const start = new Date(`${mondayISO}T00:00:00+09:00`).getTime()
  const end = start + 7 * 24 * 60 * 60 * 1000
  return store.columns.filter((c) => {
    const t = new Date(c.scheduledAt).getTime()
    return t >= start && t < end
  })
}
