import type { CupCharacter } from '../../types'
import { toRow } from '../caseMap'
import type { Character } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

/** Characters are a fixed 5-key set (deletion is intentionally not supported, matching
 * "실수 방지를 위해 제한"). */
export function getAllCharacters(): Character[] {
  return store.characters.slice().sort((a, b) => a.order - b.order)
}

export function getCharacter(key: CupCharacter): Character | undefined {
  return getAllCharacters().find((c) => c.key === key)
}

export async function updateCharacter(key: CupCharacter, patch: Partial<Omit<Character, 'key'>>): Promise<Character[]> {
  const existing = getCharacter(key)
  const next: Character = { ...(existing as Character), ...patch, key }

  const { error } = await supabase.from('characters').upsert(toRow(next))
  if (error) throw error

  const index = store.characters.findIndex((c) => c.key === key)
  if (index === -1) store.characters = [...store.characters, next]
  else store.characters = store.characters.map((c, i) => (i === index ? next : c))
  return getAllCharacters()
}
