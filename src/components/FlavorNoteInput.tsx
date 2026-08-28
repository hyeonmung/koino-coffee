import { useMemo, useState, type KeyboardEvent } from 'react'
import { MAX_FLAVOR_NOTES } from '../utils/validation'
import FlavorSpectrumSpine from './FlavorSpectrumSpine'

interface FlavorNoteInputProps {
  notes: string[]
  onChange: (notes: string[]) => void
  suggestions?: string[]
}

export default function FlavorNoteInput({ notes, onChange, suggestions = [] }: FlavorNoteInputProps) {
  const [draft, setDraft] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

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

  /** Cup Note order drives both the displayed text order and the Flavor Spectrum Spine's gradient order. */
  const reorder = (from: number, to: number) => {
    if (from === to) return
    const next = [...notes]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
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
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragIndex !== null) reorder(dragIndex, i)
              setDragIndex(null)
            }}
            onDragEnd={() => setDragIndex(null)}
            title="드래그하여 순서 변경 — 첫 번째 순서가 대표 향미 노트이자 향미 스펙트럼 맨 위 색이 됩니다"
            className={`flex cursor-grab items-center gap-1 border border-navy/20 bg-warm-white px-2 py-1 text-[11px] text-navy transition-opacity active:cursor-grabbing ${
              dragIndex === i ? 'opacity-30' : ''
            }`}
          >
            <span className="text-navy/25">⠿</span>
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
          placeholder={atLimit ? '최대 6개까지 입력 가능' : '향미 입력 후 Enter'}
          disabled={atLimit}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[13px] text-navy outline-none placeholder:text-navy/35 disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-1 text-right text-[10px] text-navy/45">
        {notes.length} / {MAX_FLAVOR_NOTES} · 칩을 드래그하면 순서를 바꿀 수 있습니다
      </p>

      {notes.length > 0 && (
        <div className="mt-3 flex h-10 items-stretch gap-3 border-t border-navy/10 pt-3">
          <span className="self-center text-[10px] font-semibold tracking-[0.1em] text-navy/40">향미 스펙트럼 미리보기</span>
          <FlavorSpectrumSpine notes={notes} size="md" />
        </div>
      )}

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
