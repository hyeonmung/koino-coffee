import { toRow } from '../caseMap'
import type { BrewTool } from '../schema'
import { supabase } from '../supabaseClient'
import { store } from '../store'

export function getAllBrewTools(): BrewTool[] {
  return store.brewTools.slice().sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getVisibleBrewTools(): BrewTool[] {
  return getAllBrewTools().filter((t) => t.visible)
}

export async function upsertBrewTool(tool: BrewTool): Promise<BrewTool[]> {
  const { error } = await supabase.from('brew_tools').upsert(toRow(tool))
  if (error) throw error

  const index = store.brewTools.findIndex((t) => t.id === tool.id)
  if (index === -1) store.brewTools = [...store.brewTools, tool]
  else store.brewTools = store.brewTools.map((t, i) => (i === index ? tool : t))
  return store.brewTools
}

export async function deleteBrewTool(id: string): Promise<BrewTool[]> {
  const { error } = await supabase.from('brew_tools').delete().eq('id', id)
  if (error) throw error

  store.brewTools = store.brewTools.filter((t) => t.id !== id)
  return store.brewTools
}
