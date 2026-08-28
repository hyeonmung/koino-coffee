import { toRow } from '../caseMap'
import type { AboutBlock, AboutPageSettings } from '../schema'
import { supabase } from '../supabaseClient'
import { aboutPageSettingsToRow, store } from '../store'

export function getAllAboutBlocks(): AboutBlock[] {
  return store.aboutBlocks.slice().sort((a, b) => a.order - b.order)
}

export function getVisibleAboutBlocks(): AboutBlock[] {
  return getAllAboutBlocks().filter((b) => b.visible)
}

export function getAboutBlockById(id: string): AboutBlock | undefined {
  return getAllAboutBlocks().find((b) => b.id === id)
}

export async function upsertAboutBlock(block: AboutBlock): Promise<AboutBlock[]> {
  const { error } = await supabase.from('about_blocks').upsert(toRow(block))
  if (error) throw error

  const index = store.aboutBlocks.findIndex((b) => b.id === block.id)
  if (index === -1) store.aboutBlocks = [...store.aboutBlocks, block]
  else store.aboutBlocks = store.aboutBlocks.map((b, i) => (i === index ? block : b))
  return getAllAboutBlocks()
}

export async function deleteAboutBlock(id: string): Promise<AboutBlock[]> {
  const { error } = await supabase.from('about_blocks').delete().eq('id', id)
  if (error) throw error

  store.aboutBlocks = store.aboutBlocks.filter((b) => b.id !== id)
  return getAllAboutBlocks()
}

export function getAboutPageSettings(): AboutPageSettings {
  return store.aboutPageSettings
}

export async function updateAboutPageSettings(patch: Partial<AboutPageSettings>): Promise<AboutPageSettings> {
  const next: AboutPageSettings = { ...getAboutPageSettings(), ...patch, updatedAt: new Date().toISOString() }

  const { error } = await supabase.from('about_page_settings').upsert({ id: true, ...toRow(aboutPageSettingsToRow(next)) })
  if (error) throw error

  store.aboutPageSettings = next
  return next
}
