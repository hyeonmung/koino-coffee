import { createLocalCollection } from '../localCollection'
import type { Inquiry } from '../schema'

const collection = createLocalCollection<Inquiry>('koi-sensory-map-inquiries')

export function getAllInquiries(): Inquiry[] {
  return collection.getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addInquiry(inquiry: Inquiry): Inquiry[] {
  return collection.upsert(inquiry)
}

export function updateInquiryStatus(id: string, status: Inquiry['status']): Inquiry[] {
  const existing = collection.getById(id)
  if (!existing) return collection.getAll()
  return collection.upsert({ ...existing, status })
}

export function deleteInquiry(id: string): Inquiry[] {
  return collection.remove(id)
}
