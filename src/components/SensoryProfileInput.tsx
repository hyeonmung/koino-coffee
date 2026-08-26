import { SENSORY_FIELDS } from '../constants/sensory'
import type { SensoryProfile, SensoryScore } from '../types'
import SensorySlider from './SensorySlider'

interface SensoryProfileInputProps {
  sensory: SensoryProfile
  onChange: (sensory: SensoryProfile) => void
}

export default function SensoryProfileInput({ sensory, onChange }: SensoryProfileInputProps) {
  return (
    <div className="divide-y divide-navy/10">
      {SENSORY_FIELDS.map((field) => (
        <SensorySlider
          key={field.key}
          field={field}
          value={sensory[field.key]}
          onChange={(value: SensoryScore) => onChange({ ...sensory, [field.key]: value })}
        />
      ))}
    </div>
  )
}
