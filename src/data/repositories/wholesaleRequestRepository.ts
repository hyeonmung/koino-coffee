import { toRow } from '../caseMap'
import type { WholesaleRequest } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllWholesaleRequests(): WholesaleRequest[] {
  return store.wholesaleRequests.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function addWholesaleRequest(request: WholesaleRequest): Promise<WholesaleRequest[]> {
  const { error } = await supabase.from('wholesale_requests').insert(toRow(request))
  if (error) throw error

  store.wholesaleRequests = [...store.wholesaleRequests, request]
  return getAllWholesaleRequests()
}

export async function updateWholesaleRequestStatus(id: string, status: WholesaleRequest['status']): Promise<WholesaleRequest[]> {
  const existing = store.wholesaleRequests.find((r) => r.id === id)
  if (!existing) return getAllWholesaleRequests()

  const { error } = await supabase.from('wholesale_requests').update({ status }).eq('id', id)
  if (error) throw error

  store.wholesaleRequests = store.wholesaleRequests.map((r) => (r.id === id ? { ...r, status } : r))
  return getAllWholesaleRequests()
}

export async function deleteWholesaleRequest(id: string): Promise<WholesaleRequest[]> {
  const { error } = await supabase.from('wholesale_requests').delete().eq('id', id)
  if (error) throw error

  store.wholesaleRequests = store.wholesaleRequests.filter((r) => r.id !== id)
  return getAllWholesaleRequests()
}
