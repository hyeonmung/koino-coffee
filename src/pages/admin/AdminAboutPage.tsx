import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getSiteSettings, updateSiteSettings } from '../../data/repositories/siteSettingsRepository'
import type { SiteSettings, StorySection } from '../../data/schema'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(() => getSiteSettings())
  const [saved, setSaved] = useState(false)

  const patch = (p: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }))
    setSaved(false)
  }

  const updateSection = (index: number, p: Partial<StorySection>) => {
    const next = settings.aboutSections.map((s, i) => (i === index ? { ...s, ...p } : s))
    patch({ aboutSections: next })
  }

  const addSection = () => patch({ aboutSections: [...settings.aboutSections, { heading: '', body: '' }] })
  const removeSection = (index: number) => patch({ aboutSections: settings.aboutSections.filter((_, i) => i !== index) })

  const handleSave = () => {
    updateSiteSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">ABOUT</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">코이노커피 소개 관리</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[11px] text-navy/50">저장됨</span>}
          <button
            type="button"
            onClick={handleSave}
            className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
          >
            저장
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-[680px] space-y-6">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">인트로 문구</span>
          <textarea
            value={settings.aboutIntro}
            onChange={(e) => patch({ aboutIntro: e.target.value })}
            className={`${inputClass} min-h-[70px]`}
          />
        </label>

        <div className="space-y-4">
          {settings.aboutSections.map((section, i) => (
            <div key={i} className="border border-navy/15 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-navy/40">섹션 {i + 1}</span>
                <button type="button" onClick={() => removeSection(i)} className="text-[11px] text-navy/40 hover:text-red-500">
                  삭제
                </button>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  value={section.heading}
                  onChange={(e) => updateSection(i, { heading: e.target.value })}
                  className={inputClass}
                  placeholder="소제목 (예: 로스팅)"
                />
                <textarea
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="본문"
                />
                <input
                  value={section.image ?? ''}
                  onChange={(e) => updateSection(i, { image: e.target.value })}
                  className={inputClass}
                  placeholder="이미지 URL (선택)"
                />
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSection} className="border border-navy/25 px-4 py-2 text-[12px] font-semibold text-navy hover:border-navy">
          + 섹션 추가
        </button>
      </div>
    </AdminLayout>
  )
}
