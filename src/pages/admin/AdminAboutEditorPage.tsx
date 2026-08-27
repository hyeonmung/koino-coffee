import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import AboutBlockRenderer from '../../components/about/AboutBlockRenderer'
import {
  ABOUT_BACKGROUND_CLASS,
  ABOUT_BACKGROUND_LABEL,
  ABOUT_BLOCK_TYPE_LABEL,
  ABOUT_CAREER_CATEGORIES,
  ABOUT_IMAGE_RATIO_LABEL,
  ABOUT_LAYOUT_LABEL,
  ABOUT_SPACING_LABEL,
  ABOUT_TEXT_WIDTH_LABEL,
} from '../../constants/aboutBlocks'
import { FOCAL_POINT_LABEL, type ImageFocalPoint } from '../../constants/media'
import {
  deleteAboutBlock,
  getAllAboutBlocks,
  getAboutPageSettings,
  updateAboutPageSettings,
  upsertAboutBlock,
} from '../../data/repositories/aboutRepository'
import type {
  AboutBackgroundTheme,
  AboutBlock,
  AboutBlockType,
  AboutCareerCategory,
  AboutCareerItem,
  AboutHeroSettings,
  AboutImageRatio,
  AboutLayoutPreset,
  AboutSpacing,
  AboutTextAlign,
  AboutTextWidth,
  AboutVerticalAlign,
} from '../../data/schema'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'
const textareaClass = `${inputClass} min-h-[90px]`

const BLOCK_TYPES: AboutBlockType[] = [
  'BRAND',
  'PERSON',
  'CAREER_LIST',
  'IMAGE_TEXT',
  'IMAGE_FULL',
  'GALLERY',
  'QUOTE',
  'PHILOSOPHY',
  'FREE_TEXT',
  'CTA',
]
const LAYOUTS: AboutLayoutPreset[] = [
  'PHOTO_LEFT_TEXT_RIGHT',
  'TEXT_LEFT_PHOTO_RIGHT',
  'PHOTO_LARGE',
  'TEXT_LARGE',
  'PHOTO_FULL',
  'TEXT_FULL',
  'CUSTOM',
]
const BACKGROUNDS: AboutBackgroundTheme[] = ['PAPER', 'WHITE', 'NIGHT', 'SOFT']
const SPACINGS: AboutSpacing[] = ['TIGHT', 'NORMAL', 'WIDE']
const TEXT_WIDTHS: AboutTextWidth[] = ['NARROW', 'NORMAL', 'WIDE']
const RATIOS: AboutImageRatio[] = ['4:5', '3:4', '1:1', '3:2', '16:9', 'ORIGINAL']

function emptyBlock(type: AboutBlockType, order: number): AboutBlock {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    type,
    visible: false,
    order,
    layout: type === 'IMAGE_FULL' || type === 'GALLERY' ? 'PHOTO_FULL' : type === 'CTA' || type === 'QUOTE' || type === 'CAREER_LIST' ? 'TEXT_FULL' : 'PHOTO_LEFT_TEXT_RIGHT',
    verticalAlign: 'CENTER',
    textAlign: 'LEFT',
    background: 'PAPER',
    spacing: 'NORMAL',
    textWidth: 'NORMAL',
    mobileOrder: 'IMAGE_FIRST',
    galleryColumns: 3,
    createdAt: now,
    updatedAt: now,
  }
}

export default function AdminAboutEditorPage() {
  const [blocks, setBlocks] = useState<AboutBlock[]>(() => getAllAboutBlocks())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingType, setAddingType] = useState<AboutBlockType | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [hero, setHero] = useState<AboutHeroSettings>(() => getAboutPageSettings().hero)
  const [heroSaved, setHeroSaved] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const refresh = () => setBlocks(getAllAboutBlocks())

  const move = (block: AboutBlock, direction: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === block.id)
    const target = blocks[idx + direction]
    if (!target) return
    upsertAboutBlock({ ...block, order: target.order })
    upsertAboutBlock({ ...target, order: block.order })
    refresh()
  }

  /** Drag-and-drop reorder — drop a block onto another row's position, everything between shifts accordingly. */
  const reorderTo = (fromId: string, toIndex: number) => {
    const fromIndex = blocks.findIndex((b) => b.id === fromId)
    if (fromIndex === -1 || fromIndex === toIndex) return
    const next = [...blocks]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    next.forEach((b, i) => {
      if (b.order !== i) upsertAboutBlock({ ...b, order: i })
    })
    refresh()
  }

  const toggleVisible = (block: AboutBlock) => {
    upsertAboutBlock({ ...block, visible: !block.visible, updatedAt: new Date().toISOString() })
    refresh()
  }

  const duplicate = (block: AboutBlock) => {
    const now = new Date().toISOString()
    const copy: AboutBlock = { ...block, id: crypto.randomUUID(), order: blocks.length, createdAt: now, updatedAt: now }
    upsertAboutBlock(copy)
    refresh()
    setExpandedId(copy.id)
  }

  const remove = (id: string) => {
    deleteAboutBlock(id)
    setConfirmingId(null)
    if (expandedId === id) setExpandedId(null)
    refresh()
  }

  const addBlock = (type: AboutBlockType) => {
    const next = emptyBlock(type, blocks.length)
    upsertAboutBlock(next)
    refresh()
    setExpandedId(next.id)
    setAddingType(null)
  }

  const saveHero = () => {
    updateAboutPageSettings({ hero })
    setHeroSaved(true)
    setTimeout(() => setHeroSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">ABOUT</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">코이노커피 소개 페이지 편집</h1>
      <p className="mt-2 max-w-[640px] text-[12px] text-navy/50">
        블록을 추가·삭제·순서 변경하며 자유롭게 페이지를 구성하세요. 왼쪽의 ⠿ 손잡이를 드래그해 순서를 바로 바꿀 수
        있고, 사진, 텍스트, 비율, 배경은 실시간 미리보기를 보면서 직접 조정할 수 있습니다. 단 폰트·자유 색상·절대
        위치 지정은 KOI 디자인 시스템 보호를 위해 제공하지 않습니다.
      </p>

      {/* HERO */}
      <div className="mt-8 border border-navy/15 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">브랜드 HERO</p>
          <div className="flex items-center gap-2">
            {heroSaved && <span className="text-[11px] text-navy/50">저장됨</span>}
            <button type="button" onClick={saveHero} className="border border-navy bg-navy px-3 py-1.5 text-[11px] font-semibold text-warm-white hover:bg-navy-light">
              저장
            </button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledField label="제목">
            <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className={inputClass} />
          </LabeledField>
          <LabeledField label="Subtitle">
            <input value={hero.subtitle ?? ''} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} className={inputClass} />
          </LabeledField>
          <LabeledField label="Hero 이미지 URL (Desktop)">
            <input value={hero.imageDesktop ?? ''} onChange={(e) => setHero({ ...hero, imageDesktop: e.target.value })} className={inputClass} placeholder="비워두면 KOI 브랜드 플레이스홀더" />
          </LabeledField>
          <LabeledField label="사진 위 어둡기">
            <PillGroup
              options={[
                { value: 'low', label: '낮음' },
                { value: 'medium', label: '보통' },
                { value: 'high', label: '높음' },
              ]}
              value={hero.overlay}
              onChange={(v) => setHero({ ...hero, overlay: v as AboutHeroSettings['overlay'] })}
            />
          </LabeledField>
          <LabeledField label="텍스트 위치 (Desktop)">
            <PillGroup
              options={[
                { value: 'LEFT', label: '왼쪽' },
                { value: 'CENTER', label: '가운데' },
                { value: 'RIGHT', label: '오른쪽' },
              ]}
              value={hero.textPositionDesktop}
              onChange={(v) => setHero({ ...hero, textPositionDesktop: v as AboutHeroSettings['textPositionDesktop'] })}
            />
          </LabeledField>
        </div>
      </div>

      {/* BLOCK LIST */}
      <div className="mt-8 space-y-2">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => setDragId(block.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragId) reorderTo(dragId, idx)
              setDragId(null)
            }}
            onDragEnd={() => setDragId(null)}
            className={`border border-navy/15 bg-white transition-opacity ${dragId === block.id ? 'opacity-30' : ''}`}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="shrink-0 cursor-grab select-none text-[15px] leading-none text-navy/30 hover:text-navy/60 active:cursor-grabbing" title="드래그하여 순서 변경">
                ⠿
              </span>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button type="button" onClick={() => move(block, -1)} disabled={idx === 0} className="text-[10px] text-navy/40 hover:text-navy disabled:opacity-20">▲</button>
                <button type="button" onClick={() => move(block, 1)} disabled={idx === blocks.length - 1} className="text-[10px] text-navy/40 hover:text-navy disabled:opacity-20">▼</button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-wide text-navy/40">{ABOUT_BLOCK_TYPE_LABEL[block.type]}</p>
                <p className="truncate text-[13px] font-semibold text-navy">
                  {block.title || block.personName || block.quote?.slice(0, 30) || '(제목 없음)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleVisible(block)}
                className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold ${block.visible ? 'border-accent/60 bg-accent/15 text-navy' : 'border-navy/20 text-navy/35'}`}
              >
                {block.visible ? '공개' : '숨김'}
              </button>
              <button type="button" onClick={() => setExpandedId(expandedId === block.id ? null : block.id)} className="shrink-0 border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy">
                {expandedId === block.id ? '닫기' : '편집'}
              </button>
              <button type="button" onClick={() => duplicate(block)} className="shrink-0 border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy">
                복제
              </button>
              {confirmingId === block.id ? (
                <button type="button" onClick={() => remove(block.id)} className="shrink-0 border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">
                  정말 삭제
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmingId(block.id)} className="shrink-0 border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500">
                  삭제
                </button>
              )}
            </div>

            {expandedId === block.id && (
              <BlockEditor
                block={block}
                onSaved={() => {
                  refresh()
                }}
              />
            )}
          </div>
        ))}
        {blocks.length === 0 && <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">등록된 블록이 없습니다.</p>}
      </div>

      {/* ADD BLOCK */}
      <div className="mt-6">
        {addingType === null ? (
          <button type="button" onClick={() => setAddingType('BRAND')} className="border border-navy/25 px-4 py-2.5 text-[12px] font-semibold text-navy hover:border-navy">
            + 섹션 추가
          </button>
        ) : (
          <div className="border border-navy/15 bg-white p-4">
            <p className="mb-2 text-[10px] font-semibold text-navy/40">추가할 블록 종류</p>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => addBlock(t)} className="border border-navy/20 px-3 py-1.5 text-[11px] font-semibold text-navy/70 hover:border-navy hover:text-navy">
                  {ABOUT_BLOCK_TYPE_LABEL[t]}
                </button>
              ))}
              <button type="button" onClick={() => setAddingType(null)} className="px-3 py-1.5 text-[11px] text-navy/40 hover:text-navy">
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}

function PillGroup<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`border px-2.5 py-1.5 text-[11px] font-semibold ${value === opt.value ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/60 hover:border-navy/50'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Visual background swatches (actual KOI theme colors) instead of a text pill — the one place a "seeing it" picker fits without opening up a free color picker. */
function BackgroundSwatchGroup({ value, onChange }: { value: AboutBackgroundTheme; onChange: (v: AboutBackgroundTheme) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BACKGROUNDS.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => onChange(b)}
          className={`flex flex-col items-center gap-1 border p-1.5 ${value === b ? 'border-navy' : 'border-transparent hover:border-navy/20'}`}
        >
          <span className={`block h-9 w-14 border border-navy/10 ${ABOUT_BACKGROUND_CLASS[b]}`} />
          <span className="text-[9px] font-semibold text-navy/60">{ABOUT_BACKGROUND_LABEL[b]}</span>
        </button>
      ))}
    </div>
  )
}

function BlockEditor({ block, onSaved }: { block: AboutBlock; onSaved: () => void }) {
  const [draft, setDraft] = useState<AboutBlock>(block)
  const [preview, setPreview] = useState<'desktop' | 'mobile'>('desktop')
  const [saved, setSaved] = useState(false)

  const patch = (p: Partial<AboutBlock>) => {
    setDraft((prev) => ({ ...prev, ...p }))
    setSaved(false)
  }

  const save = () => {
    upsertAboutBlock({ ...draft, updatedAt: new Date().toISOString() })
    setSaved(true)
    onSaved()
    setTimeout(() => setSaved(false), 2000)
  }

  const hasImage = draft.type !== 'CAREER_LIST' && draft.type !== 'CTA' && draft.type !== 'GALLERY'
  const isSplitLayout = !['PHOTO_FULL', 'TEXT_FULL'].includes(draft.layout)

  const updateCareer = (id: string, p: Partial<AboutCareerItem>) => {
    patch({ careers: (draft.careers ?? []).map((c) => (c.id === id ? { ...c, ...p } : c)) })
  }
  const addCareer = () => {
    const careers = draft.careers ?? []
    patch({
      careers: [
        ...careers,
        { id: crypto.randomUUID(), year: '', organization: '', detail: '', category: '경력' as AboutCareerCategory, visible: true, featured: false, order: careers.length },
      ],
    })
  }
  const removeCareer = (id: string) => patch({ careers: (draft.careers ?? []).filter((c) => c.id !== id) })

  const updateGalleryImage = (i: number, url: string, caption: string) => {
    const images = [...(draft.galleryImages ?? [])]
    images[i] = { url, caption }
    patch({ galleryImages: images })
  }
  const addGalleryImage = () => patch({ galleryImages: [...(draft.galleryImages ?? []), { url: '', caption: '' }] })
  const removeGalleryImage = (i: number) => patch({ galleryImages: (draft.galleryImages ?? []).filter((_, idx) => idx !== i) })

  return (
    <div className="grid grid-cols-1 gap-6 border-t border-navy/10 p-5 lg:grid-cols-2">
      {/* FIELDS */}
      <div className="space-y-4">
        {draft.type === 'PERSON' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <LabeledField label="이름">
                <input value={draft.personName ?? ''} onChange={(e) => patch({ personName: e.target.value })} className={inputClass} />
              </LabeledField>
              <LabeledField label="영문 이름">
                <input value={draft.personEnglishName ?? ''} onChange={(e) => patch({ personEnglishName: e.target.value })} className={inputClass} />
              </LabeledField>
              <LabeledField label="직책">
                <input value={draft.personRole ?? ''} onChange={(e) => patch({ personRole: e.target.value })} className={inputClass} placeholder="대표 · 로스터" />
              </LabeledField>
              <LabeledField label="영문 직책">
                <input value={draft.personEnglishRole ?? ''} onChange={(e) => patch({ personEnglishRole: e.target.value })} className={inputClass} placeholder="Founder / Roaster" />
              </LabeledField>
            </div>
            <LabeledField label="한 줄 소개">
              <input value={draft.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} className={inputClass} />
            </LabeledField>
            <LabeledField label="상세 소개 (빈 줄로 문단 구분, ## 로 소제목)">
              <textarea value={draft.body ?? ''} onChange={(e) => patch({ body: e.target.value })} className={textareaClass} />
            </LabeledField>
          </>
        ) : draft.type === 'CAREER_LIST' || draft.type === 'CTA' || draft.type === 'QUOTE' ? (
          <>
            {draft.type !== 'QUOTE' && (
              <LabeledField label="제목">
                <input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
              </LabeledField>
            )}
            {draft.type === 'QUOTE' && (
              <>
                <LabeledField label="인용문">
                  <textarea value={draft.quote ?? ''} onChange={(e) => patch({ quote: e.target.value })} className={textareaClass} />
                </LabeledField>
                <LabeledField label="캡션 (선택, 예: 대표 이름)">
                  <input value={draft.caption ?? ''} onChange={(e) => patch({ caption: e.target.value })} className={inputClass} />
                </LabeledField>
              </>
            )}
            {draft.type === 'CTA' && (
              <>
                <LabeledField label="본문 (선택)">
                  <textarea value={draft.body ?? ''} onChange={(e) => patch({ body: e.target.value })} className={textareaClass} />
                </LabeledField>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledField label="버튼 문구">
                    <input value={draft.ctaLabel ?? ''} onChange={(e) => patch({ ctaLabel: e.target.value })} className={inputClass} />
                  </LabeledField>
                  <LabeledField label="이동 링크">
                    <input value={draft.ctaUrl ?? ''} onChange={(e) => patch({ ctaUrl: e.target.value })} className={inputClass} placeholder="/coffees" />
                  </LabeledField>
                </div>
              </>
            )}
          </>
        ) : draft.type === 'IMAGE_FULL' ? (
          <LabeledField label="캡션 (선택)">
            <input value={draft.caption ?? ''} onChange={(e) => patch({ caption: e.target.value })} className={inputClass} />
          </LabeledField>
        ) : draft.type === 'GALLERY' ? (
          <div>
            <span className="mb-2 block text-[10px] font-semibold text-navy/60">사진 목록</span>
            <PillGroup
              options={[
                { value: '2', label: '2단' },
                { value: '3', label: '3단' },
              ]}
              value={String(draft.galleryColumns ?? 3)}
              onChange={(v) => patch({ galleryColumns: Number(v) as 2 | 3 })}
            />
            <div className="mt-3 space-y-2">
              {(draft.galleryImages ?? []).map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input value={img.url} onChange={(e) => updateGalleryImage(i, e.target.value, img.caption ?? '')} className={inputClass} placeholder="이미지 URL" />
                  <input value={img.caption ?? ''} onChange={(e) => updateGalleryImage(i, img.url, e.target.value)} className={inputClass} placeholder="캡션 (선택)" />
                  <button type="button" onClick={() => removeGalleryImage(i)} className="shrink-0 text-navy/40 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addGalleryImage} className="mt-2 text-[11px] font-semibold text-navy/50 hover:text-navy">+ 사진 추가</button>
          </div>
        ) : (
          <>
            <LabeledField label="제목">
              <input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} className={inputClass} />
            </LabeledField>
            <LabeledField label="부제목 (선택)">
              <input value={draft.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} className={inputClass} />
            </LabeledField>
            <LabeledField label="본문 (빈 줄로 문단 구분, ## 로 소제목)">
              <textarea value={draft.body ?? ''} onChange={(e) => patch({ body: e.target.value })} className={textareaClass} />
            </LabeledField>
            <LabeledField label="인용문 (선택)">
              <input value={draft.quote ?? ''} onChange={(e) => patch({ quote: e.target.value })} className={inputClass} />
            </LabeledField>
            <div className="grid grid-cols-2 gap-3">
              <LabeledField label="CTA 버튼 문구 (선택)">
                <input value={draft.ctaLabel ?? ''} onChange={(e) => patch({ ctaLabel: e.target.value })} className={inputClass} />
              </LabeledField>
              <LabeledField label="CTA 링크 (선택)">
                <input value={draft.ctaUrl ?? ''} onChange={(e) => patch({ ctaUrl: e.target.value })} className={inputClass} />
              </LabeledField>
            </div>
          </>
        )}

        {draft.type === 'PERSON' || draft.type === 'CAREER_LIST' ? (
          <div>
            <span className="mb-2 block text-[10px] font-semibold text-navy/60">경력</span>
            <div className="space-y-2">
              {(draft.careers ?? []).map((c) => (
                <div key={c.id} className="border border-navy/10 p-2.5">
                  <div className="flex gap-2">
                    <input value={c.year} onChange={(e) => updateCareer(c.id, { year: e.target.value })} className={`${inputClass} w-20`} placeholder="2024" />
                    <input value={c.organization} onChange={(e) => updateCareer(c.id, { organization: e.target.value })} className={inputClass} placeholder="기관 · 대회 · 활동" />
                    <button type="button" onClick={() => removeCareer(c.id)} className="shrink-0 text-navy/40 hover:text-red-500">×</button>
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    <input value={c.detail} onChange={(e) => updateCareer(c.id, { detail: e.target.value })} className={inputClass} placeholder="내용 (예: 1위, Judge)" />
                    <select value={c.category} onChange={(e) => updateCareer(c.id, { category: e.target.value as AboutCareerCategory })} className={`${inputClass} w-24`}>
                      {ABOUT_CAREER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <label className="flex shrink-0 items-center gap-1 text-[11px] text-navy/60">
                      <input type="checkbox" checked={c.featured} onChange={(e) => updateCareer(c.id, { featured: e.target.checked })} />
                      주요 경력
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCareer} className="mt-2 text-[11px] font-semibold text-navy/50 hover:text-navy">+ 경력 추가</button>
          </div>
        ) : null}

        {hasImage && (
          <div className="border-t border-navy/10 pt-4">
            <LabeledField label="사진 URL">
              <input value={draft.image ?? ''} onChange={(e) => patch({ image: e.target.value })} className={inputClass} placeholder="비워두면 KOI 브랜드 플레이스홀더" />
            </LabeledField>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <LabeledField label="이미지 비율">
                <select value={draft.imageRatio ?? '4:5'} onChange={(e) => patch({ imageRatio: e.target.value as AboutImageRatio })} className={inputClass}>
                  {RATIOS.map((r) => (
                    <option key={r} value={r}>{ABOUT_IMAGE_RATIO_LABEL[r]}</option>
                  ))}
                </select>
              </LabeledField>
              <LabeledField label="사진 위치 (Focal Point)">
                <select value={draft.imageFocalPoint ?? 'center'} onChange={(e) => patch({ imageFocalPoint: e.target.value as ImageFocalPoint })} className={inputClass}>
                  {(Object.keys(FOCAL_POINT_LABEL) as ImageFocalPoint[]).map((f) => (
                    <option key={f} value={f}>{FOCAL_POINT_LABEL[f]}</option>
                  ))}
                </select>
              </LabeledField>
            </div>
          </div>
        )}

        <div className="border-t border-navy/10 pt-4">
          <span className="mb-2 block text-[10px] font-semibold text-navy/60">레이아웃</span>
          <PillGroup options={LAYOUTS.map((l) => ({ value: l, label: ABOUT_LAYOUT_LABEL[l] }))} value={draft.layout} onChange={(v) => patch({ layout: v })} />

          {draft.layout === 'CUSTOM' && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LabeledField label={`사진 : 텍스트 비율 — 사진 ${draft.customImageCols ?? 6} / 텍스트 ${12 - (draft.customImageCols ?? 6)}`}>
                <input
                  type="range"
                  min={4}
                  max={8}
                  step={1}
                  value={draft.customImageCols ?? 6}
                  onChange={(e) => patch({ customImageCols: Number(e.target.value) })}
                  className="w-full accent-navy"
                />
              </LabeledField>
              <LabeledField label="사진 위치">
                <PillGroup
                  options={[{ value: 'LEFT', label: '왼쪽' }, { value: 'RIGHT', label: '오른쪽' }]}
                  value={draft.customImageSide ?? 'LEFT'}
                  onChange={(v) => patch({ customImageSide: v as 'LEFT' | 'RIGHT' })}
                />
              </LabeledField>
            </div>
          )}

          {isSplitLayout && (
            <div className="mt-3">
              <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">세로 정렬</span>
              <PillGroup
                options={[{ value: 'TOP', label: '상단' }, { value: 'CENTER', label: '중앙' }, { value: 'BOTTOM', label: '하단' }]}
                value={draft.verticalAlign}
                onChange={(v) => patch({ verticalAlign: v as AboutVerticalAlign })}
              />
            </div>
          )}

          <div className="mt-3">
            <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">텍스트 정렬</span>
            <PillGroup
              options={[{ value: 'LEFT', label: '왼쪽' }, { value: 'CENTER', label: '가운데' }, { value: 'RIGHT', label: '오른쪽' }]}
              value={draft.textAlign}
              onChange={(v) => patch({ textAlign: v as AboutTextAlign })}
            />
          </div>

          <div className="mt-3">
            <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">텍스트 폭</span>
            <PillGroup options={TEXT_WIDTHS.map((w) => ({ value: w, label: ABOUT_TEXT_WIDTH_LABEL[w] }))} value={draft.textWidth} onChange={(v) => patch({ textWidth: v })} />
          </div>

          <div className="mt-3">
            <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">배경</span>
            <BackgroundSwatchGroup value={draft.background} onChange={(v) => patch({ background: v })} />
          </div>

          <div className="mt-3">
            <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">간격</span>
            <PillGroup options={SPACINGS.map((s) => ({ value: s, label: ABOUT_SPACING_LABEL[s] }))} value={draft.spacing} onChange={(v) => patch({ spacing: v })} />
          </div>

          {hasImage && isSplitLayout && (
            <div className="mt-3">
              <span className="mb-1.5 block text-[10px] font-semibold text-navy/60">모바일 순서</span>
              <PillGroup
                options={[{ value: 'IMAGE_FIRST', label: '이미지 먼저' }, { value: 'TEXT_FIRST', label: '텍스트 먼저' }]}
                value={draft.mobileOrder}
                onChange={(v) => patch({ mobileOrder: v as AboutBlock['mobileOrder'] })}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-navy/10 pt-4">
          {saved && <span className="text-[11px] text-navy/50">저장됨</span>}
          <button type="button" onClick={save} className="border border-navy bg-navy px-4 py-2 text-[12px] font-semibold text-warm-white hover:bg-navy-light">
            블록 저장
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-navy/40">LIVE PREVIEW</span>
          <PillGroup
            options={[{ value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }]}
            value={preview}
            onChange={setPreview}
          />
        </div>
        <div className={`overflow-hidden border border-navy/15 ${preview === 'mobile' ? 'mx-auto max-w-[390px]' : ''}`}>
          <AboutBlockRenderer block={draft} isMobile={preview === 'mobile'} />
        </div>
      </div>
    </div>
  )
}
