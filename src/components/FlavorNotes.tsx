import { useMemo } from 'react'
import { getFlavorColor } from '../data/flavorMatch'
import { getFlavorDescriptors } from '../data/repositories/flavorRepository'

interface FlavorNotesProps {
  notes: string[]
  limit?: number
  /** Renders "· " before the first note, for inline use right after another label. */
  leading?: boolean
  className?: string
  /** True when rendering on a Deep Navy background (e.g. a KOI Night section) — each note switches to its dark-background color variant. */
  onDark?: boolean
}

const NBSP = ' '

/**
 * Renders a coffee's flavor notes ("Mango · Pineapple · Blackberry"), each colored with its OWN
 * Flavor Descriptor color — Mango always reads as Mango, regardless of the coffee's Character.
 * Notes without a registered color fall back to a neutral tone. The "·" separator stays neutral
 * so it never competes with the note colors. The space before each "·" is a normal breakable
 * space (a line can wrap between notes), but the space after it is a non-breaking space — so the
 * dot always travels down with the note it introduces, never stranded alone at a line edge.
 */
export default function FlavorNotes({ notes, limit, leading = false, className = '', onDark = false }: FlavorNotesProps) {
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const shown = limit ? notes.slice(0, limit) : notes
  if (shown.length === 0) return null

  const separatorClass = onDark ? 'text-warm-white/35' : 'text-navy/30'

  return (
    <span className={className}>
      {shown.map((note, i) => {
        const color = getFlavorColor(note, descriptors)
        const showSeparator = leading || i > 0
        const separator = i === 0 ? `·${NBSP}` : ` ·${NBSP}`
        return (
          <span key={`${note}-${i}`}>
            {showSeparator && <span className={separatorClass}>{separator}</span>}
            <span style={{ color: onDark ? color.onDark : color.onLight }}>{note}</span>
          </span>
        )
      })}
    </span>
  )
}
