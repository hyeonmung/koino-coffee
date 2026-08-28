import { toRow } from '../caseMap'
import type { DictionaryTerm } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllDictionaryTerms(): DictionaryTerm[] {
  return store.dictionaryTerms
}

export async function upsertDictionaryTerm(term: DictionaryTerm): Promise<DictionaryTerm[]> {
  const { error } = await supabase.from('dictionary_terms').upsert(toRow(term))
  if (error) throw error

  const index = store.dictionaryTerms.findIndex((t) => t.id === term.id)
  if (index === -1) store.dictionaryTerms = [...store.dictionaryTerms, term]
  else store.dictionaryTerms = store.dictionaryTerms.map((t, i) => (i === index ? term : t))
  return store.dictionaryTerms
}

export async function deleteDictionaryTerm(id: string): Promise<DictionaryTerm[]> {
  const { error } = await supabase.from('dictionary_terms').delete().eq('id', id)
  if (error) throw error

  store.dictionaryTerms = store.dictionaryTerms.filter((t) => t.id !== id)
  return store.dictionaryTerms
}
