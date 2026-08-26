import { COUNTRY_META, COUNTRY_PRIORITY, OTHER_COUNTRY_KEY } from '../constants/countries'
import type { CoffeeProfile } from '../types'

export interface CountryGroup {
  key: string
  slug: string
  labelEn: string
  labelKo?: string
  flag: string
  coffees: CoffeeProfile[]
}

export function normalizeCountryKey(raw: string): string {
  const trimmed = raw.trim().toLowerCase()
  return trimmed || OTHER_COUNTRY_KEY
}

export function countryKeyToSlug(key: string): string {
  return encodeURIComponent(key.replace(/\s+/g, '-'))
}

export function slugToCountryKey(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ')
}

export function groupCoffeesByCountry(coffees: CoffeeProfile[]): CountryGroup[] {
  const map = new Map<string, CountryGroup>()

  for (const coffee of coffees) {
    const key = normalizeCountryKey(coffee.country)
    const existing = map.get(key)
    if (existing) {
      existing.coffees.push(coffee)
      continue
    }
    const meta = COUNTRY_META[key]
    map.set(key, {
      key,
      slug: countryKeyToSlug(key),
      labelEn: meta?.en ?? (key === OTHER_COUNTRY_KEY ? 'Other' : coffee.country.trim()),
      labelKo: meta?.ko ?? (key === OTHER_COUNTRY_KEY ? '기타' : undefined),
      flag: meta?.flag ?? '☕',
      coffees: [coffee],
    })
  }

  const groups = Array.from(map.values())

  groups.sort((a, b) => {
    const ai = COUNTRY_PRIORITY.indexOf(a.key)
    const bi = COUNTRY_PRIORITY.indexOf(b.key)
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    }
    if (a.key === OTHER_COUNTRY_KEY) return 1
    if (b.key === OTHER_COUNTRY_KEY) return -1
    return a.labelEn.localeCompare(b.labelEn)
  })

  return groups
}
