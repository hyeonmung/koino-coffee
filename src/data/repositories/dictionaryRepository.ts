import { createLocalCollection } from '../localCollection'
import type { DictionaryTerm } from '../schema'
import { SEED_DICTIONARY_TERMS } from '../seed/dictionary'

const collection = createLocalCollection<DictionaryTerm>('koi-sensory-map-dictionary-terms')

export function getAllDictionaryTerms(): DictionaryTerm[] {
  return collection.seedIfEmpty(SEED_DICTIONARY_TERMS)
}

export function upsertDictionaryTerm(term: DictionaryTerm): DictionaryTerm[] {
  return collection.upsert(term)
}

export function deleteDictionaryTerm(id: string): DictionaryTerm[] {
  return collection.remove(id)
}
