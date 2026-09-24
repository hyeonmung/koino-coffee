import { CHARACTER_INFO } from '../constants/characters'
import { CUP_CHARACTERS, type CupCharacter } from '../types'

interface CharacterSelectorProps {
  value: CupCharacter
  onChange: (character: CupCharacter) => void
}

export default function CharacterSelector({ value, onChange }: CharacterSelectorProps) {
  const info = CHARACTER_INFO[value]

  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5">
        {CUP_CHARACTERS.map((key) => {
          const active = key === value
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`border px-2 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                active
                  ? 'border-line bg-navy text-warm-white'
                  : 'border-line/25 bg-transparent text-ink/70 hover:border-line/60 hover:text-ink'
              }`}
            >
              {CHARACTER_INFO[key].label}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink/60">
        <span className="font-semibold text-ink/80">{info.flavors}</span>
        <br />
        {info.description}
      </p>
    </div>
  )
}
