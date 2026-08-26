import type { CupCharacter } from '../../types'
import type { Character } from '../schema'
import { SEED_CHARACTERS } from '../seed/characters'

const STORAGE_KEY = 'koi-sensory-map-character-overrides'

type Overrides = Partial<Record<CupCharacter, Partial<Character>>>

function loadOverrides(): Overrides {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveOverrides(overrides: Overrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

/**
 * Characters are a fixed 5-key set (deletion is intentionally not supported, matching
 * "실수 방지를 위해 제한"). Admin edits are stored as a small overrides patch merged over
 * the seeded defaults, so the set can never end up empty or corrupted.
 */
export function getAllCharacters(): Character[] {
  const overrides = loadOverrides()
  return SEED_CHARACTERS.map((c) => ({ ...c, ...overrides[c.key] })).sort((a, b) => a.order - b.order)
}

export function getCharacter(key: CupCharacter): Character | undefined {
  return getAllCharacters().find((c) => c.key === key)
}

export function updateCharacter(key: CupCharacter, patch: Partial<Omit<Character, 'key'>>): Character[] {
  const overrides = loadOverrides()
  overrides[key] = { ...overrides[key], ...patch }
  saveOverrides(overrides)
  return getAllCharacters()
}
