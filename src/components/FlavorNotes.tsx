import { FLAVOR_FAMILY_COLOR } from '../constants/flavorColors'
import { findDescriptorByNote } from '../data/flavorMatch'
import { getFlavorDescriptors } from '../data/repositories/flavorRepository'

interface FlavorNotesProps {
  notes: string[]
  limit?: number
  /** Renders "· " before the first note, for inline use right after another label. */
  leading?: boolean
  className?: string
}

/**
 * Renders a coffee's flavor notes ("Mango · Pineapple · Blackberry") with each note tinted
 * by its Flavor Family. Notes that don't resolve to a known descriptor keep the inherited
 * (uncolored) text so nothing is guessed.
 */
export default function FlavorNotes({ notes, limit, leading = false, className = '' }: FlavorNotesProps) {
  const shown = limit ? notes.slice(0, limit) : notes
  if (shown.length === 0) return null

  const descriptors = getFlavorDescriptors()

  return (
    <span className={className}>
      {leading && '· '}
      {shown.map((note, i) => {
        const familyId = findDescriptorByNote(note, descriptors)?.familyId
        const color = familyId ? FLAVOR_FAMILY_COLOR[familyId] : undefined
        return (
          <span key={`${note}-${i}`}>
            {i > 0 && ' · '}
            <span style={color ? { color } : undefined}>{note}</span>
          </span>
        )
      })}
    </span>
  )
}
