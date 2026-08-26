import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAllCharacters, updateCharacter } from '../../data/repositories/characterRepository'
import type { Character } from '../../data/schema'

const inputClass = 'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none focus:border-navy'

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>(() => getAllCharacters())
  const [savedKey, setSavedKey] = useState<string | null>(null)

  const patch = (key: Character['key'], p: Partial<Character>) => {
    setCharacters((prev) => prev.map((c) => (c.key === key ? { ...c, ...p } : c)))
  }

  const save = (character: Character) => {
    updateCharacter(character.key, {
      description: character.description,
      flavors: character.flavors,
      heroCopy: character.heroCopy,
      image: character.image,
      order: character.order,
    })
    setSavedKey(character.key)
    setTimeout(() => setSavedKey(null), 2000)
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">CHARACTER</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">캐릭터 관리</h1>
      <p className="mt-2 text-[12px] text-navy/50">
        5가지 Character는 고정되어 있으며 삭제할 수 없습니다. 설명, 대표 향미, 소개 문구, 이미지, 정렬
        순서만 수정할 수 있습니다.
      </p>

      <div className="mt-8 space-y-4">
        {characters
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((character) => (
            <div key={character.key} className="border border-navy/15 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="border border-navy bg-navy px-3 py-1.5 text-[12px] font-bold tracking-[0.15em] text-warm-white">
                  {character.label}
                </span>
                <div className="flex items-center gap-2">
                  {savedKey === character.key && <span className="text-[11px] text-navy/50">저장됨</span>}
                  <button
                    type="button"
                    onClick={() => save(character)}
                    className="border border-navy px-3 py-1.5 text-[11px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
                  >
                    저장
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">대표 향미</span>
                  <input
                    value={character.flavors}
                    onChange={(e) => patch(character.key, { flavors: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">정렬 순서</span>
                  <input
                    type="number"
                    value={character.order}
                    onChange={(e) => patch(character.key, { order: Number(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">짧은 설명</span>
                  <input
                    value={character.description}
                    onChange={(e) => patch(character.key, { description: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">소개 문구 (Character 상세 페이지)</span>
                  <textarea
                    value={character.heroCopy}
                    onChange={(e) => patch(character.key, { heroCopy: e.target.value })}
                    className={`${inputClass} min-h-[70px]`}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold text-navy/60">이미지 URL (선택)</span>
                  <input
                    value={character.image ?? ''}
                    onChange={(e) => patch(character.key, { image: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </label>
              </div>
            </div>
          ))}
      </div>
    </AdminLayout>
  )
}
