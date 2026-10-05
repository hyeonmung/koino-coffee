import { toRow } from '../caseMap'
import type { Playlist } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'
import { isPublished } from '../../utils/scheduledTime'

export function getAllPlaylists(): Playlist[] {
  return store.playlists.slice().sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
}

/** What a public visitor may see: published status AND the scheduled time has actually passed. */
export function getPublishedPlaylists(): Playlist[] {
  return getAllPlaylists().filter((p) => p.publishStatus === 'published' && isPublished(p.scheduledAt))
}

export function getPlaylistBySlug(slug: string): Playlist | undefined {
  const playlist = store.playlists.find((p) => p.slug === slug)
  if (!playlist) return undefined
  if (playlist.publishStatus === 'published' && isPublished(playlist.scheduledAt)) return playlist
  return undefined
}

export function getPlaylistById(id: string): Playlist | undefined {
  return store.playlists.find((p) => p.id === id)
}

export async function upsertPlaylist(playlist: Playlist): Promise<Playlist[]> {
  const { error } = await supabase.from('playlists').upsert(toRow(playlist))
  if (error) throw error

  const index = store.playlists.findIndex((p) => p.id === playlist.id)
  if (index === -1) store.playlists = [...store.playlists, playlist]
  else store.playlists = store.playlists.map((p, i) => (i === index ? playlist : p))
  return store.playlists
}

export async function deletePlaylist(id: string): Promise<Playlist[]> {
  const { error } = await supabase.from('playlists').delete().eq('id', id)
  if (error) throw error

  store.playlists = store.playlists.filter((p) => p.id !== id)
  return store.playlists
}

export function playlistSlugExists(slug: string, excludeId?: string): boolean {
  return store.playlists.some((p) => p.slug === slug && p.id !== excludeId)
}
