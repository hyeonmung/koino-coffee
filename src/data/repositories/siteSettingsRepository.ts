import { toRow } from '../caseMap'
import type { SiteSettings } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getSiteSettings(): SiteSettings {
  return store.siteSettings
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const next: SiteSettings = { ...getSiteSettings(), ...patch, updatedAt: new Date().toISOString() }

  const { error } = await supabase.from('site_settings').upsert({ id: true, ...toRow(next) })
  if (error) throw error

  store.siteSettings = next
  return next
}
