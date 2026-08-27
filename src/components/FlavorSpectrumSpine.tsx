import { useMemo } from 'react'
import { getFlavorColor } from '../data/flavorMatch'
import { getFlavorDescriptors } from '../data/repositories/flavorRepository'
import { createFlavorGradient } from '../utils/flavorGradient'

interface FlavorSpectrumSpineProps {
  notes: string[]
  /** Match the same slice shown as text next to it (e.g. CoffeeCard's `limit={3}`) — the Spine and the Cup Note text must always agree on which notes are "the" notes. */
  limit?: number
  size?: 'sm' | 'md' | 'lg'
  /** True on a Deep Navy background — switches every note to its dark-background color variant. */
  onDark?: boolean
  className?: string
}

const WIDTH_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-[2px]',
  md: 'w-[3px]',
  lg: 'w-[4px]',
}

/**
 * KOI's Editorial Flavor Spectrum Spine — a very thin vertical bar next to the coffee name whose
 * gradient is generated automatically from that coffee's own Cup Notes, top to bottom in the
 * order they were entered. Colors come from each note's own Flavor Descriptor (never the
 * coffee's Character), and re-derive live from the Flavor Library — nothing gradient-related is
 * ever stored on the Coffee itself. Purely decorative: aria-hidden, since the Cup Note text next
 * to it already carries the real information. Meant to sit inside a `self-stretch` flex row
 * alongside the name/flavor text block so its height always matches that content automatically.
 */
export default function FlavorSpectrumSpine({ notes, limit, size = 'md', onDark = false, className = '' }: FlavorSpectrumSpineProps) {
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const shown = limit ? notes.slice(0, limit) : notes
  if (shown.length === 0) return null

  const colors = shown.map((note) => {
    const color = getFlavorColor(note, descriptors)
    return onDark ? color.onDark : color.onLight
  })

  return (
    <span
      aria-hidden="true"
      className={`shrink-0 self-stretch rounded-[1.5px] opacity-90 transition-opacity duration-300 group-hover:opacity-100 ${WIDTH_CLASS[size]} ${className}`}
      style={{ backgroundImage: createFlavorGradient(colors) }}
    />
  )
}
