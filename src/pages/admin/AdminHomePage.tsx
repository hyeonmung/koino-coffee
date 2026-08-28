import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import ImageUploadField from '../../components/admin/ImageUploadField'
import type { HomeSectionKey, SiteSettings } from '../../data/schema'
import { getSiteSettings, updateSiteSettings } from '../../data/repositories/siteSettingsRepository'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

const SECTIONS: { key: HomeSectionKey; label: string }[] = [
  { key: 'featuredCoffee', label: '02 · 지금 만날 수 있는 커피' },
  { key: 'tasteFinder', label: '03 · 나에게 맞는 커피 찾기' },
  { key: 'cupCharacter', label: '04 · KOINO CUP CHARACTER' },
  { key: 'sensoryMap', label: '05 · KOINO SENSORY MAP' },
  { key: 'coffeeChart', label: '06 · 원두 차트 미리보기' },
  { key: 'brewGuide', label: '07 · Brew Better' },
  { key: 'stories', label: '08 · 커피 이야기' },
  { key: 'about', label: '09 · KOINONIA 소개' },
  { key: 'business', label: '10 · 납품 · 교육 CTA' },
]

export default function AdminHomePage() {
  const [settings, setSettings] = useState<SiteSettings>(() => getSiteSettings())
  const [saved, setSaved] = useState(false)

  const patch = (p: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }))
    setSaved(false)
  }

  const toggleSection = (key: HomeSectionKey) => {
    patch({
      homeSectionVisibility: {
        ...settings.homeSectionVisibility,
        [key]: settings.homeSectionVisibility[key] === false ? true : false,
      },
    })
  }

  const handleSave = async () => {
    await updateSiteSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">HOME</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">홈 관리</h1>
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

      <div className="mt-8 max-w-[680px] space-y-8">
        <section className="border border-navy/15 bg-white p-6">
          <h2 className="mb-4 font-serif text-[15px] font-bold text-navy">01 · Hero</h2>
          <div className="space-y-3">
            <Field label="Hero 제목">
              <input value={settings.heroTitle} onChange={(e) => patch({ heroTitle: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Hero Subtitle (줄바꿈 가능)">
              <textarea
                value={settings.heroSubtitle}
                onChange={(e) => patch({ heroSubtitle: e.target.value })}
                className={`${inputClass} min-h-[70px]`}
              />
            </Field>
            <ImageUploadField label="Hero Image (선택)" value={settings.heroImage ?? ''} onChange={(url) => patch({ heroImage: url })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary CTA 문구">
                <input
                  value={settings.heroCtaPrimaryLabel}
                  onChange={(e) => patch({ heroCtaPrimaryLabel: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Primary CTA 링크">
                <input
                  value={settings.heroCtaPrimaryUrl}
                  onChange={(e) => patch({ heroCtaPrimaryUrl: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Secondary CTA 문구">
                <input
                  value={settings.heroCtaSecondaryLabel}
                  onChange={(e) => patch({ heroCtaSecondaryLabel: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Secondary CTA 링크">
                <input
                  value={settings.heroCtaSecondaryUrl}
                  onChange={(e) => patch({ heroCtaSecondaryUrl: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="border border-navy/15 bg-white p-6">
          <h2 className="mb-2 font-serif text-[15px] font-bold text-navy">Featured Coffee</h2>
          <p className="text-[12px] text-navy/55">
            홈 화면 "지금 만날 수 있는 커피"에 노출할 원두는{' '}
            <Link to="/admin/coffees" className="font-semibold text-navy underline">
              원두 관리
            </Link>
            에서 원두별 Featured ★ 표시로 지정합니다. 지정된 원두가 없으면 최근 원두가 자동으로
            노출됩니다.
          </p>
        </section>

        <section className="border border-navy/15 bg-white p-6">
          <h2 className="mb-4 font-serif text-[15px] font-bold text-navy">섹션 공개 / 숨김</h2>
          <div className="space-y-2">
            {SECTIONS.map((section) => (
              <label key={section.key} className="flex items-center gap-2 text-[12px] text-navy">
                <input
                  type="checkbox"
                  checked={settings.homeSectionVisibility[section.key] !== false}
                  onChange={() => toggleSection(section.key)}
                />
                {section.label}
              </label>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.1em] text-navy/60">{label}</span>
      {children}
    </label>
  )
}
