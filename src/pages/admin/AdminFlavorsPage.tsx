import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  deleteFlavorDescriptor,
  getFlavorDescriptors,
  getFlavorFamilies,
  upsertFlavorDescriptor,
} from '../../data/repositories/flavorRepository'
import type { FlavorDescriptor } from '../../data/schema'

const inputClass = 'border border-navy/25 bg-white px-2 py-1.5 text-[12px] text-navy outline-none focus:border-navy'

export default function AdminFlavorsPage() {
  const families = getFlavorFamilies()
  const [descriptors, setDescriptors] = useState<FlavorDescriptor[]>(() => getFlavorDescriptors())
  const [newName, setNewName] = useState('')
  const [newNameKo, setNewNameKo] = useState('')
  const [newFamilyId, setNewFamilyId] = useState(families[0]?.id ?? '')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

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

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">FLAVOR LIBRARY</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">향미 관리</h1>
      <p className="mt-2 text-[12px] text-navy/50">
        여기서 추가한 향미는 원두 등록 화면의 Flavor Notes 입력 시 자동완성으로 제안됩니다.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2 border border-navy/15 bg-white p-4">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-navy/60">영문명</span>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} placeholder="Blackberry" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-navy/60">한글명</span>
          <input value={newNameKo} onChange={(e) => setNewNameKo(e.target.value)} className={inputClass} placeholder="블랙베리" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-navy/60">향미 계열 (Family)</span>
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
                  <span key={d.id} className="flex items-center gap-1.5 border border-navy/20 bg-white px-2.5 py-1.5 text-[12px] text-navy">
                    {d.name}
                    {d.nameKo && <span className="text-navy/40">({d.nameKo})</span>}
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
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
