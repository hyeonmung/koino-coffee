import { toRow } from '../caseMap'
import type { Inquiry } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllInquiries(): Inquiry[] {
  return store.inquiries.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function addInquiry(inquiry: Inquiry): Promise<Inquiry[]> {
  const { error } = await supabase.from('inquiries').insert(toRow(inquiry))
  if (error) throw error

  store.inquiries = [...store.inquiries, inquiry]
  return getAllInquiries()
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<Inquiry[]> {
  const existing = store.inquiries.find((i) => i.id === id)
  if (!existing) return getAllInquiries()

  const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
  if (error) throw error

  store.inquiries = store.inquiries.map((i) => (i.id === id ? { ...i, status } : i))
  return getAllInquiries()
}

export async function deleteInquiry(id: string): Promise<Inquiry[]> {
  const { error } = await supabase.from('inquiries').delete().eq('id', id)
  if (error) throw error

  store.inquiries = store.inquiries.filter((i) => i.id !== id)
  return getAllInquiries()
}
