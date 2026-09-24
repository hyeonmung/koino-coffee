import type { OpenFilterValues } from './AdvancedFilterDrawer'
import { archive } from '../../pages/public/brewGuide/tokens'
import { equipmentLabel } from '../../pages/public/brewGuide/parse'

interface FilterSidebarProps {
  drippers: string[]
  competitionTypes: string[]
  /** Integer gram buckets that actually occur in the data — e.g. [16, 18, 20] never [10..25]. */
  doseOptions: number[]
  /** Integer "1:N" ratio buckets that actually occur in the data. */
  ratioOptions: number[]
  value: OpenFilterValues
  onChange: (patch: Partial<OpenFilterValues>) => void
}

/** Persistent left-column filter sidebar for desktop — every click applies immediately, unlike
 * the mobile AdvancedFilterDrawer which stages changes behind an "적용하기" step. Same filter
 * dimensions, same real data, just a layout suited to a wide viewport with room to spare. */
export default function FilterSidebar({ drippers, competitionTypes, doseOptions, ratioOptions, value, onChange }: FilterSidebarProps) {
  const hasActive =
    value.dripper !== 'ALL' ||
    value.competitionType !== 'ALL' ||
    value.servingStyle !== 'ALL' ||
    value.dose !== 'ALL' ||
    value.ratio !== 'ALL' ||
    value.timeRange !== 'ALL'

  return (
    <aside className="hidden lg:block lg:w-[220px] lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className={`text-[13px] font-semibold ${archive.textPrimary}`}>카테고리</h2>
        {hasActive && (
          <button
            type="button"
            onClick={() =>
              onChange({ dripper: 'ALL', competitionType: 'ALL', servingStyle: 'ALL', dose: 'ALL', ratio: 'ALL', timeRange: 'ALL' })
            }
            className={`text-[11px] ${archive.textMuted} ${archive.hoverTextPrimary}`}
          >
            초기화
          </button>
        )}
      </div>

      <FilterGroup
        label="드리퍼"
        options={drippers.map((d) => ({ value: d, label: equipmentLabel(d) }))}
        selected={value.dripper}
        onSelect={(v) => onChange({ dripper: v })}
      />

      {competitionTypes.length > 0 && (
        <FilterGroup
          label="레시피타입"
          options={competitionTypes.map((c) => ({ value: c, label: c }))}
          selected={value.competitionType}
          onSelect={(v) => onChange({ competitionType: v })}
        />
      )}

      <FilterGroup
        label="추출시간"
        options={[
          { value: 'UNDER3', label: '3분 미만' },
          { value: 'MID', label: '3-4분' },
          { value: 'OVER4', label: '4분 초과' },
        ]}
        selected={value.timeRange}
        onSelect={(v) => onChange({ timeRange: v as OpenFilterValues['timeRange'] })}
      />

      <FilterGroup
        label="도징량"
        options={doseOptions.map((g) => ({ value: String(g), label: `${g}g` }))}
        selected={value.dose}
        onSelect={(v) => onChange({ dose: v })}
      />

      <FilterGroup
        label="추출비"
        options={ratioOptions.map((r) => ({ value: String(r), label: `1:${r}` }))}
        selected={value.ratio}
        onSelect={(v) => onChange({ ratio: v })}
      />

      <FilterGroup
        label="온도"
        options={[
          { value: 'HOT', label: 'HOT' },
          { value: 'ICED', label: 'ICE' },
        ]}
        selected={value.servingStyle}
        onSelect={(v) => onChange({ servingStyle: v as OpenFilterValues['servingStyle'] })}
      />
    </aside>
  )
}

/** Idle state shows every option as a pill; once one is picked, only that pill stays visible
 * (with a clear "×") instead of piling up next to the rest — one active choice per category. */
function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string
  onSelect: (value: string) => void
}) {
  const active = options.find((o) => o.value === selected)

  return (
    <div className="mt-6">
      <p className={`text-[10px] font-semibold tracking-[0.15em] ${archive.textMuted}`}>{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {active ? (
          <span
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-medium"
            style={{ color: archive.accent, backgroundColor: 'rgba(242,197,92,0.1)' }}
          >
            {active.label}
            <button type="button" onClick={() => onSelect('ALL')} aria-label={`${label} 필터 해제`} className="hover:opacity-70">
              ×
            </button>
          </span>
        ) : (
          options.map((o) => <Row key={o.value} onClick={() => onSelect(o.value)} label={o.label} />)
        )}
      </div>
    </div>
  )
}

function Row({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1.5 text-[12.5px] font-medium transition-colors ${archive.border} ${archive.textSecondary} ${archive.hoverTextPrimary}`}
    >
      {label}
    </button>
  )
}
