import { useMemo, useState, type KeyboardEvent } from 'react'
import { MAX_FLAVOR_NOTES } from '../utils/validation'

interface FlavorNoteInputProps {
  notes: string[]
  onChange: (notes: string[]) => void
  suggestions?: string[]
}

export default function FlavorNoteInput({ notes, onChange, suggestions = [] }: FlavorNoteInputProps) {
  const [draft, setDraft] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addNote = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (notes.length >= MAX_FLAVOR_NOTES) return
    if (notes.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...notes, trimmed])
    setDraft('')
  }

  const removeNote = (index: number) => {
    onChange(notes.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addNote(draft)
    } else if (e.key === 'Backspace' && draft === '' && notes.length > 0) {
      removeNote(notes.length - 1)
    }
  }

  const atLimit = notes.length >= MAX_FLAVOR_NOTES

  const matchingSuggestions = useMemo(() => {
    if (!draft.trim()) return []
    const q = draft.trim().toLowerCase()
    return suggestions
      .filter((s) => s.toLowerCase().includes(q) && !notes.some((n) => n.toLowerCase() === s.toLowerCase()))
      .slice(0, 6)
  }, [draft, suggestions, notes])

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 border border-navy/25 bg-white p-2">
        {notes.map((note, i) => (
          <span
            key={`${note}-${i}`}
            className="flex items-center gap-1 border border-navy/20 bg-warm-white px-2 py-1 text-[11px] text-navy"
          >
            {note}
            <button
              type="button"
              onClick={() => removeNote(i)}
              aria-label={`${note} 삭제`}
              className="text-navy/50 hover:text-navy"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            addNote(draft)
            setTimeout(() => setShowSuggestions(false), 100)
          }}
          placeholder={atLimit ? '최대 6개까지 입력 가능' : 'Flavor 입력 후 Enter'}
          disabled={atLimit}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[13px] text-navy outline-none placeholder:text-navy/35 disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-navy/45">
        {notes.length} / {MAX_FLAVOR_NOTES}
      </p>

      {showSuggestions && matchingSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full border border-navy/15 bg-white shadow-md">
          {matchingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                addNote(s)
              }}
              className="block w-full px-3 py-1.5 text-left text-[12px] text-navy hover:bg-warm-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
