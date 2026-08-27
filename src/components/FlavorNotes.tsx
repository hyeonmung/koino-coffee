import { CHARACTER_STYLE } from '../constants/characterStyle'
import type { CupCharacter } from '../types'

interface FlavorNotesProps {
  notes: string[]
  /** The coffee's Character — its accent tints every note. A single tone per coffee, not a rainbow per flavor. */
  character: CupCharacter
  limit?: number
  /** Renders "· " before the first note, for inline use right after another label. */
  leading?: boolean
  className?: string
}

/**
 * Renders a coffee's flavor notes ("Mango · Pineapple · Blackberry") tinted with that coffee's
 * Character accent. Colors follow the Character (the single source of truth for a coffee's
 * visual identity), not a per-flavor-family rainbow — keeps the site from feeling scattered.
 */
export default function FlavorNotes({ notes, character, limit, leading = false, className = '' }: FlavorNotesProps) {
  const shown = limit ? notes.slice(0, limit) : notes
  if (shown.length === 0) return null

  const accent = CHARACTER_STYLE[character].accent

  return (
    <span className={className}>
      {leading && '· '}
      {shown.map((note, i) => (
        <span key={`${note}-${i}`}>
          {i > 0 && ' · '}
          <span style={{ color: accent }}>{note}</span>
        </span>
      ))}
    </span>
  )
}
