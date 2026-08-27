import { createLocalCollection, createLocalSingleton } from '../localCollection'
import type { AboutBlock, AboutPageSettings } from '../schema'
import { DEFAULT_ABOUT_PAGE_SETTINGS, SEED_ABOUT_BLOCKS } from '../seed/aboutBlocks'

const blocks = createLocalCollection<AboutBlock>('koi-sensory-map-about-blocks')
const pageSettings = createLocalSingleton<AboutPageSettings>('koi-sensory-map-about-settings')

export function getAllAboutBlocks(): AboutBlock[] {
  return blocks.seedIfEmpty(SEED_ABOUT_BLOCKS).slice().sort((a, b) => a.order - b.order)
}

export function getVisibleAboutBlocks(): AboutBlock[] {
  return getAllAboutBlocks().filter((b) => b.visible)
}

export function getAboutBlockById(id: string): AboutBlock | undefined {
  return getAllAboutBlocks().find((b) => b.id === id)
}

export function upsertAboutBlock(block: AboutBlock): AboutBlock[] {
  return blocks.upsert(block)
}

export function deleteAboutBlock(id: string): AboutBlock[] {
  return blocks.remove(id)
}

export function getAboutPageSettings(): AboutPageSettings {
  return pageSettings.get(DEFAULT_ABOUT_PAGE_SETTINGS)
}

export function updateAboutPageSettings(patch: Partial<AboutPageSettings>): AboutPageSettings {
  const next = { ...getAboutPageSettings(), ...patch, updatedAt: new Date().toISOString() }
  pageSettings.set(next)
  return next
}
