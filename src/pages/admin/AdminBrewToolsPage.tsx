import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { deleteBrewTool, getAllBrewTools, upsertBrewTool } from '../../data/repositories/brewToolRepository'
import type { BrewTool } from '../../data/schema'

const inputClass = 'border border-line/25 bg-surface px-2 py-1.5 text-[12px] text-ink outline-none focus:border-line'

export default function AdminBrewToolsPage() {
  const [tools, setTools] = useState<BrewTool[]>(() => getAllBrewTools())
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const refresh = () => setTools(getAllBrewTools())

  const handleAdd = async () => {
    if (!name.trim()) return
    const now = new Date().toISOString()
    await upsertBrewTool({
      id: crypto.randomUUID(),
      name: name.trim(),
      imageUrl: imageUrl || undefined,
      sortOrder: tools.length,
      visible: true,
      createdAt: now,
      updatedAt: now,
    })
    setName('')
    setImageUrl('')
    refresh()
  }

  const move = async (tool: BrewTool, direction: -1 | 1) => {
    const idx = tools.findIndex((t) => t.id === tool.id)
    const target = tools[idx + direction]
    if (!target) return
    await upsertBrewTool({ ...tool, sortOrder: target.sortOrder })
    await upsertBrewTool({ ...target, sortOrder: tool.sortOrder })
    refresh()
  }

  const toggleVisible = async (tool: BrewTool) => {
    await upsertBrewTool({ ...tool, visible: !tool.visible })
    refresh()
  }

  const rename = async (tool: BrewTool, patch: Partial<BrewTool>) => {
    await upsertBrewTool({ ...tool, ...patch })
    refresh()
  }

  const handleDelete = async (id: string) => {
    await deleteBrewTool(id)
    setConfirmingId(null)
    refresh()
  }

  return (
    <AdminLayout>
      <Link to="/admin/brew-guides" className="text-[11px] font-semibold text-ink/45 hover:text-ink">
        ← 브루잉 레시피 목록
      </Link>
      <p className="mt-2 text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">BREW TOOLS</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-ink">코이의 브루잉 도구 관리</h1>
      <p className="mt-2 max-w-[560px] text-[12px] text-ink/50">
        브루잉 레시피 목록 페이지의 "최근 본 레시피" 아래에 노출되는 도구 갤러리입니다. 이미지와 이름만 있는 순수 소개용 목록입니다.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2 border border-line/15 bg-surface p-4">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold text-ink/60">도구 이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="예: Hario V60 드리퍼" />
        </label>
        <div className="w-[220px]">
          <ImageUploadField label="이미지" value={imageUrl} onChange={setImageUrl} />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="border border-line bg-navy px-4 py-1.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          + 도구 추가
        </button>
      </div>

      <div className="mt-6 divide-y divide-line/10 border border-line/15 bg-surface">
        {tools.map((tool, idx) => (
          <div key={tool.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(tool, -1)}
                disabled={idx === 0}
                className="text-[10px] text-ink/40 hover:text-ink disabled:opacity-20"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(tool, 1)}
                disabled={idx === tools.length - 1}
                className="text-[10px] text-ink/40 hover:text-ink disabled:opacity-20"
              >
                ▼
              </button>
            </div>

            {tool.imageUrl ? (
              <img src={tool.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded bg-line/10" />
            )}

            <input value={tool.name} onChange={(e) => rename(tool, { name: e.target.value })} className={`${inputClass} w-48`} />

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleVisible(tool)}
                className={`border px-2.5 py-1 text-[10px] font-semibold ${
                  tool.visible ? 'border-line/20 text-ink/60' : 'border-line/20 bg-line/5 text-ink/35'
                }`}
              >
                {tool.visible ? '공개' : '숨김'}
              </button>
              {confirmingId === tool.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleDelete(tool.id)}
                    className="border border-red-400 bg-red-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-600"
                  >
                    정말 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="border border-line/20 px-2 py-1 text-[10px] text-ink/60"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(tool.id)}
                  className="border border-line/20 px-2 py-1 text-[10px] text-ink/60 hover:border-red-400 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {tools.length === 0 && <p className="px-4 py-6 text-center text-[12px] text-ink/40">아직 등록된 도구가 없습니다.</p>}
      </div>
    </AdminLayout>
  )
}
