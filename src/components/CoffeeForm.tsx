import type { ChangeEvent } from 'react'
import type { CoffeeDraft } from '../types'

interface CoffeeFormProps {
  coffee: CoffeeDraft
  onChange: (patch: Partial<CoffeeDraft>) => void
  nameError?: string
}

interface FieldDef {
  key: keyof Pick<
    CoffeeDraft,
    'coffeeName' | 'country' | 'region' | 'producer' | 'variety' | 'process' | 'altitude' | 'roastLevel'
  >
  label: string
  placeholder: string
  required?: boolean
  span?: 1 | 2
}

const FIELDS: FieldDef[] = [
  { key: 'coffeeName', label: 'Coffee Name', placeholder: 'Kenya Kirinyaga Mbula AA', required: true, span: 2 },
  { key: 'country', label: 'Country', placeholder: 'Kenya' },
  { key: 'region', label: 'Region', placeholder: 'Kirinyaga' },
  { key: 'producer', label: 'Producer / Farm', placeholder: 'Mbula Factory' },
  { key: 'variety', label: 'Variety', placeholder: 'SL28, SL34' },
  { key: 'process', label: 'Process', placeholder: 'Washed' },
  { key: 'altitude', label: 'Altitude', placeholder: '1,700 - 1,900m' },
  { key: 'roastLevel', label: 'Roast Level', placeholder: 'Light' },
]

export default function CoffeeForm({ coffee, onChange, nameError }: CoffeeFormProps) {
  const handleChange = (key: FieldDef['key']) => (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ [key]: e.target.value })
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-3">
      {FIELDS.map((field) => (
        <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
          <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] text-navy/60">
            {field.label}
            {field.required && <span className="text-accent">*</span>}
          </label>
          <input
            value={coffee[field.key]}
            onChange={handleChange(field.key)}
            placeholder={field.placeholder}
            className={`w-full border bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy ${
              field.key === 'coffeeName' && nameError ? 'border-red-400' : 'border-navy/25'
            }`}
          />
          {field.key === 'coffeeName' && nameError && (
            <p className="mt-1 text-[10px] text-red-500">{nameError}</p>
          )}
        </div>
      ))}
    </div>
  )
}
