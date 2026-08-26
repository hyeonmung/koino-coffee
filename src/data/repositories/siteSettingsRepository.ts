import { createLocalSingleton } from '../localCollection'
import type { SiteSettings } from '../schema'
import { DEFAULT_SITE_SETTINGS } from '../seed/siteSettings'

const singleton = createLocalSingleton<SiteSettings>('koi-sensory-map-site-settings')

export function getSiteSettings(): SiteSettings {
  return singleton.get(DEFAULT_SITE_SETTINGS)
}

export function updateSiteSettings(patch: Partial<SiteSettings>): SiteSettings {
  const next = { ...getSiteSettings(), ...patch, updatedAt: new Date().toISOString() }
  singleton.set(next)
  return next
}
