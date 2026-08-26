import { useState, type KeyboardEvent } from 'react'
import { MAX_FLAVOR_NOTES } from '../utils/validation'

interface FlavorNoteInputProps {
  notes: string[]
  onChange: (notes: string[]) => void
}

export default function FlavorNoteInput({ notes, onChange }: FlavorNoteInputProps) {
  const [draft, setDraft] = useState('')

  const addNote = () => {
    const trimmed = draft.trim()
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
      addNote()
    } else if (e.key === 'Backspace' && draft === '' && notes.length > 0) {
      removeNote(notes.length - 1)
    }
  }

  const atLimit = notes.length >= MAX_FLAVOR_NOTES

  return (
    <div>
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
          onBlur={addNote}
          placeholder={atLimit ? '최대 6개까지 입력 가능' : 'Flavor 입력 후 Enter'}
          disabled={atLimit}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[13px] text-navy outline-none placeholder:text-navy/35 disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-navy/45">{notes.length} / {MAX_FLAVOR_NOTES}</p>
    </div>
  )
}
