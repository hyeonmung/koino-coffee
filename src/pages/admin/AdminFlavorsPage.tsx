import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { FLAVOR_COLOR_PRESETS, FLAVOR_NEUTRAL_COLOR } from '../../constants/flavorColor'
import {
  deleteFlavorDescriptor,
  getFlavorDescriptors,
  getFlavorFamilies,
  upsertFlavorDescriptor,
} from '../../data/repositories/flavorRepository'
import type { FlavorColor, FlavorDescriptor } from '../../data/schema'

const inputClass = 'border border-navy/25 bg-white px-2 py-1.5 text-[12px] text-navy outline-none focus:border-navy'
const labelClass = 'mb-1 block text-[10px] font-semibold text-navy/60'

function ColorSwatch({ color, size = 16 }: { color: FlavorColor; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full border border-navy/15"
      style={{ width: size, height: size, backgroundColor: color.onLight }}
    />
  )
}

/** Preset grid + Advanced hex inputs — the admin-facing "향미 색상" picker (see spec item 6). */
function ColorPicker({ value, onChange }: { value?: FlavorColor; onChange: (c: FlavorColor) => void }) {
  const [advanced, setAdvanced] = useState(false)
  const current = value ?? FLAVOR_NEUTRAL_COLOR

  return (
    <div className="border border-navy/15 bg-warm-white/60 p-3">
      <div className="flex flex-wrap gap-1.5">
        {FLAVOR_COLOR_PRESETS.map((preset) => {
          const active = value?.onLight === preset.color.onLight && value?.onDark === preset.color.onDark
          return (
            <button
              key={preset.label}
              type="button"
              title={preset.label}
              onClick={() => onChange(preset.color)}
              className={`h-6 w-6 rounded-full border-2 ${active ? 'border-navy' : 'border-transparent'}`}
              style={{ backgroundColor: preset.color.onLight }}
            />
          )
        })}
      </div>
      <button type="button" onClick={() => setAdvanced((v) => !v)} className="mt-2 text-[10px] font-semibold text-navy/45 underline">
        {advanced ? '고급 설정 닫기' : '고급 설정 — 직접 Hex 입력'}
      </button>
      {advanced && (
        <div className="mt-2 flex flex-wrap gap-3">
          <label className="block">
            <span className={labelClass}>Light 배경용 (Warm White)</span>
            <input
              value={current.onLight}
              onChange={(e) => onChange({ onLight: e.target.value, onDark: current.onDark })}
              className={`${inputClass} w-28`}
              placeholder="#9c5170"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Dark 배경용 (Deep Navy)</span>
            <input
              value={current.onDark}
              onChange={(e) => onChange({ onLight: current.onLight, onDark: e.target.value })}
              className={`${inputClass} w-28`}
              placeholder="#e3a9be"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function DescriptorEditor({
  descriptor,
  onSave,
  onClose,
}: {
  descriptor: FlavorDescriptor
  onSave: (d: FlavorDescriptor) => void
  onClose: () => void
}) {
  const families = getFlavorFamilies()
  const [draft, setDraft] = useState<FlavorDescriptor>(descriptor)

  return (
    <div className="mt-2 w-full border border-navy/20 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>영문명</span>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={`${inputClass} w-full`} />
        </label>
        <label className="block">
          <span className={labelClass}>한글명</span>
          <input value={draft.nameKo ?? ''} onChange={(e) => setDraft({ ...draft, nameKo: e.target.value })} className={`${inputClass} w-full`} />
        </label>
        <label className="block">
          <span className={labelClass}>향미 계열 (Family)</span>
          <select
            value={draft.familyId}
            onChange={(e) => setDraft({ ...draft, familyId: e.target.value })}
            className={`${inputClass} w-full`}
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>설명</span>
          <input
            value={draft.description ?? ''}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className={`${inputClass} w-full`}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>예시</span>
          <input
            value={draft.example ?? ''}
            onChange={(e) => setDraft({ ...draft, example: e.target.value })}
            className={`${inputClass} w-full`}
          />
        </label>
      </div>

      <div className="mt-3">
        <span className={labelClass}>향미 색상</span>
        {!draft.color && (
          <p className="mb-2 text-[11px] font-semibold text-accent/80">
            ⚠ 향미 색상이 지정되지 않았습니다 — 공개 화면에서는 뉴트럴 색상으로 표시됩니다.
          </p>
        )}
        <ColorPicker value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="border border-navy bg-navy px-4 py-1.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          저장
        </button>
        <button type="button" onClick={onClose} className="border border-navy/25 px-4 py-1.5 text-[12px] font-semibold text-navy/60">
          닫기
        </button>
      </div>
    </div>
  )
}

export default function AdminFlavorsPage() {
  const families = getFlavorFamilies()
  const [descriptors, setDescriptors] = useState<FlavorDescriptor[]>(() => getFlavorDescriptors())
  const [newName, setNewName] = useState('')
  const [newNameKo, setNewNameKo] = useState('')
  const [newFamilyId, setNewFamilyId] = useState(families[0]?.id ?? '')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const refresh = () => setDescriptors(getFlavorDescriptors())

  const handleAdd = () => {
    if (!newName.trim() || !newFamilyId) return
    upsertFlavorDescriptor({
      id: crypto.randomUUID(),
      name: newName.trim(),
      nameKo: newNameKo.trim() || undefined,
      familyId: newFamilyId,
      aliases: [],
    })
    setNewName('')
    setNewNameKo('')
    refresh()
  }

  const handleDelete = (id: string) => {
    deleteFlavorDescriptor(id)
    setConfirmingId(null)
    refresh()
  }

  const handleSaveDescriptor = (d: FlavorDescriptor) => {
    upsertFlavorDescriptor(d)
    setEditingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">FLAVOR LIBRARY</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">향미 관리</h1>
      <p className="mt-2 text-[12px] text-navy/50">
        여기서 추가한 향미는 원두 등록 화면의 Flavor Notes 입력 시 자동완성으로 제안되고, 각 향미마다 지정한 색상이 사이트
        전체(카드·상세·차트·취향찾기 등)에 일관되게 적용됩니다. 색상은 원두의 컵 캐릭터와 무관합니다 — Mango는 어떤
        캐릭터의 원두에서도 항상 같은 색입니다.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2 border border-navy/15 bg-white p-4">
        <label className="block">
          <span className={labelClass}>영문명</span>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} placeholder="Blackberry" />
        </label>
        <label className="block">
          <span className={labelClass}>한글명</span>
          <input value={newNameKo} onChange={(e) => setNewNameKo(e.target.value)} className={inputClass} placeholder="블랙베리" />
        </label>
        <label className="block">
          <span className={labelClass}>향미 계열 (Family)</span>
          <select value={newFamilyId} onChange={(e) => setNewFamilyId(e.target.value)} className={inputClass}>
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="border border-navy bg-navy px-4 py-1.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          추가
        </button>
      </div>
      <p className="mt-2 text-[11px] text-navy/40">
        새로 추가한 향미는 색상이 지정되기 전까지 뉴트럴 색상으로 표시됩니다. 추가 후 목록에서 클릭하면 색상을 지정할 수
        있습니다.
      </p>

      <div className="mt-8 space-y-8">
        {families.map((family) => {
          const items = descriptors.filter((d) => d.familyId === family.id)
          if (items.length === 0) return null
          return (
            <div key={family.id}>
              <p className="text-[11px] font-semibold tracking-[0.15em] text-navy/45">
                {family.name.toUpperCase()} {family.nameKo && `· ${family.nameKo}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((d) => (
                  <div key={d.id} className={editingId === d.id ? 'w-full' : ''}>
                    <span
                      className={`flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-[12px] text-navy hover:border-navy ${
                        editingId === d.id ? 'border-navy bg-navy/5' : 'border-navy/20 bg-white'
                      }`}
                    >
                      <button type="button" onClick={() => setEditingId(editingId === d.id ? null : d.id)} className="flex items-center gap-1.5">
                        <ColorSwatch color={d.color ?? FLAVOR_NEUTRAL_COLOR} />
                        {d.name}
                        {d.nameKo && <span className="text-navy/40">({d.nameKo})</span>}
                        {!d.color && <span className="text-accent/80">·미지정</span>}
                      </button>
                      {confirmingId === d.id ? (
                        <button type="button" onClick={() => handleDelete(d.id)} className="font-semibold text-red-500">
                          확인?
                        </button>
                      ) : (
                        <button type="button" onClick={() => setConfirmingId(d.id)} className="text-navy/35 hover:text-red-500">
                          ×
                        </button>
                      )}
                    </span>
                    {editingId === d.id && (
                      <DescriptorEditor descriptor={d} onSave={handleSaveDescriptor} onClose={() => setEditingId(null)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
