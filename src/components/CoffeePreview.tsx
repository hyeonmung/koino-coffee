import { forwardRef, type Ref } from 'react'
import { CHARACTER_INFO } from '../constants/characters'
import { CHARACTER_STYLE } from '../constants/characterStyle'
import { SENSORY_FIELDS } from '../constants/sensory'
import type { CoffeeDraft } from '../types'
import InfoTooltip from './InfoTooltip'
import RadarChart from './RadarChart'

interface CoffeePreviewProps {
  coffee: CoffeeDraft
  chartRef: Ref<HTMLDivElement>
}

const MetaItem = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/45">{label}</p>
      <p className="text-[12px] text-navy">{value}</p>
    </div>
  )
}

const CoffeePreview = forwardRef<HTMLDivElement, CoffeePreviewProps>(({ coffee, chartRef }, ref) => {
  const character = CHARACTER_INFO[coffee.character]
  const { accent, accentSoft } = CHARACTER_STYLE[coffee.character]

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-[440px] border border-navy/15 bg-white px-7 py-9"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="flex items-center justify-between border-b border-navy/15 pb-4">
        <p className="text-[12px] font-bold tracking-[0.3em] text-navy">KOINO COFFEE</p>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-navy/50">
          {coffee.country || 'ORIGIN'}
        </p>
        <h2 className="mt-1 font-serif text-[22px] font-bold leading-tight text-navy">
          {coffee.coffeeName || 'COFFEE NAME'}
        </h2>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="border border-navy bg-navy px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-warm-white">
          {character.label}
        </span>
        <span className="text-[10px] text-navy/50">{character.description}</span>
      </div>

      {coffee.notes.length > 0 && (
        <p className="mt-3 text-[13px] font-medium leading-snug" style={{ color: accent }}>
          {coffee.notes.join(' · ')}
        </p>
      )}

      <div className="mt-6">
        <RadarChart ref={chartRef} sensory={coffee.sensory} size={300} accentColor={accent} accentSoft={accentSoft} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-navy/15 pt-4">
        {SENSORY_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-navy/60">
              {field.labelKo}
              <InfoTooltip title={field.labelKo} criteria={field.criteria} />
            </span>
            <span className="font-serif text-[13px] font-semibold text-navy">{coffee.sensory[field.key]}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-navy/15 pt-4">
        <MetaItem label="지역 · REGION" value={coffee.region} />
        <MetaItem label="품종 · VARIETY" value={coffee.variety} />
        <MetaItem label="가공 방식 · PROCESS" value={coffee.process} />
        <MetaItem label="고도 · ALTITUDE" value={coffee.altitude} />
        <MetaItem label="생산자 · PRODUCER" value={coffee.producer} />
        <MetaItem label="로스팅 · ROAST LEVEL" value={coffee.roastLevel} />
      </div>
    </div>
  )
})

CoffeePreview.displayName = 'CoffeePreview'

export default CoffeePreview
