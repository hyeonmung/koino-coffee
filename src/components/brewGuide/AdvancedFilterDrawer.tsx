import { useEffect, useState } from 'react'
import { archive } from '../../pages/public/brewGuide/tokens'

export type TimeRange = 'ALL' | 'UNDER3' | 'MID' | 'OVER4'

export interface OpenFilterValues {
  dripper: string
  competitionType: string
  servingStyle: 'ALL' | 'HOT' | 'ICED'
  dose: string
  ratio: string
  timeRange: TimeRange
}

interface AdvancedFilterDrawerProps {
  open: boolean
  onClose: () => void
  drippers: string[]
  competitionTypes: string[]
  /** Integer gram buckets that actually occur in the data — e.g. [16, 18, 20] never [10..25]. */
  doseOptions: number[]
  /** Integer "1:N" ratio buckets that actually occur in the data. */
  ratioOptions: number[]
  value: OpenFilterValues
  onApply: (next: OpenFilterValues) => void
}

/** Right-side drawer on desktop, bottom sheet on mobile — only exposes filter dimensions the
 * recipe data actually carries (dripper, recipe type, serving style, dose amount, ratio, brew
 * time). No invented categories (e.g. roast level) since brew_guides doesn't track that field. */
export default function AdvancedFilterDrawer({
  open,
  onClose,
  drippers,
  competitionTypes,
  doseOptions,
  ratioOptions,
  value,
  onApply,
}: AdvancedFilterDrawerProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  if (!open) return null

  const reset: OpenFilterValues = {
    dripper: 'ALL',
    competitionType: 'ALL',
    servingStyle: 'ALL',
    dose: 'ALL',
    ratio: 'ALL',
    timeRange: 'ALL',
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="필터 닫기" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl ${archive.bgSurface} p-6 sm:inset-y-0 sm:right-0 sm:bottom-auto sm:left-auto sm:h-full sm:w-[380px] sm:max-h-none sm:rounded-t-none sm:rounded-l-2xl`}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-[15px] font-semibold ${archive.textPrimary}`}>필터</h2>
          <button type="button" onClick={onClose} className={`text-[13px] ${archive.textMuted} ${archive.hoverTextPrimary}`}>
            닫기
          </button>
        </div>

        <FilterGroup label="BREW METHOD">
          <OptionRow active={draft.dripper === 'ALL'} onClick={() => setDraft({ ...draft, dripper: 'ALL' })} label="전체" />
          {drippers.map((d) => (
            <OptionRow key={d} active={draft.dripper === d} onClick={() => setDraft({ ...draft, dripper: d })} label={d} />
          ))}
        </FilterGroup>

        {competitionTypes.length > 0 && (
          <FilterGroup label="RECIPE TYPE">
            <OptionRow
              active={draft.competitionType === 'ALL'}
              onClick={() => setDraft({ ...draft, competitionType: 'ALL' })}
              label="전체"
            />
            {competitionTypes.map((c) => (
              <OptionRow
                key={c}
                active={draft.competitionType === c}
                onClick={() => setDraft({ ...draft, competitionType: c })}
                label={c}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup label="EXTRACTION TIME">
          <OptionRow active={draft.timeRange === 'ALL'} onClick={() => setDraft({ ...draft, timeRange: 'ALL' })} label="전체" />
          <OptionRow active={draft.timeRange === 'UNDER3'} onClick={() => setDraft({ ...draft, timeRange: 'UNDER3' })} label="3분 미만" />
          <OptionRow active={draft.timeRange === 'MID'} onClick={() => setDraft({ ...draft, timeRange: 'MID' })} label="3-4분" />
          <OptionRow active={draft.timeRange === 'OVER4'} onClick={() => setDraft({ ...draft, timeRange: 'OVER4' })} label="4분 초과" />
        </FilterGroup>

        <FilterGroup label="DOSE">
          <OptionRow active={draft.dose === 'ALL'} onClick={() => setDraft({ ...draft, dose: 'ALL' })} label="전체" />
          {doseOptions.map((g) => (
            <OptionRow key={g} active={draft.dose === String(g)} onClick={() => setDraft({ ...draft, dose: String(g) })} label={`${g}g`} />
          ))}
        </FilterGroup>

        <FilterGroup label="RATIO">
          <OptionRow active={draft.ratio === 'ALL'} onClick={() => setDraft({ ...draft, ratio: 'ALL' })} label="전체" />
          {ratioOptions.map((r) => (
            <OptionRow key={r} active={draft.ratio === String(r)} onClick={() => setDraft({ ...draft, ratio: String(r) })} label={`1:${r}`} />
          ))}
        </FilterGroup>

        <FilterGroup label="SERVING">
          <OptionRow active={draft.servingStyle === 'ALL'} onClick={() => setDraft({ ...draft, servingStyle: 'ALL' })} label="전체" />
          <OptionRow active={draft.servingStyle === 'HOT'} onClick={() => setDraft({ ...draft, servingStyle: 'HOT' })} label="HOT" />
          <OptionRow active={draft.servingStyle === 'ICED'} onClick={() => setDraft({ ...draft, servingStyle: 'ICED' })} label="ICE" />
        </FilterGroup>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setDraft(reset)}
            className={`flex-1 rounded-full border ${archive.border} py-2.5 text-[12px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary}`}
          >
            필터 초기화
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
            className="flex-1 rounded-full py-2.5 text-[12px] font-semibold text-[#0B1020]"
            style={{ backgroundColor: archive.accent }}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className={`text-[10px] font-semibold tracking-[0.15em] ${archive.textMuted}`}>{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function OptionRow({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active ? '' : `${archive.border} ${archive.textSecondary} ${archive.hoverTextPrimary}`
      }`}
      style={active ? { borderColor: archive.accent, color: archive.accent } : undefined}
    >
      {label}
    </button>
  )
}
