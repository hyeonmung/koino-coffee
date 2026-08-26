import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getSiteSettings, updateSiteSettings } from '../../data/repositories/siteSettingsRepository'
import type { SiteSettings } from '../../data/schema'

const inputClass =
  'w-full border border-navy/25 bg-white px-2.5 py-2 text-[13px] text-navy outline-none placeholder:text-navy/30 focus:border-navy'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(() => getSiteSettings())
  const [saved, setSaved] = useState(false)

  const patch = (p: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }))
    setSaved(false)
  }

  const handleSave = () => {
    updateSiteSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">SITE SETTINGS</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">사이트 설정</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[11px] text-navy/50">저장됨</span>}
          <button type="button" onClick={handleSave} className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light">
            저장
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-[680px] space-y-8">
        <SettingsSection title="브랜드">
          <Field label="Brand Name">
            <input value={settings.brandName} onChange={(e) => patch({ brandName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Logo Text">
            <input value={settings.logoText} onChange={(e) => patch({ logoText: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>

        <SettingsSection title="홈페이지 Hero">
          <Field label="Hero Title">
            <input value={settings.heroTitle} onChange={(e) => patch({ heroTitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Hero Subtitle">
            <input value={settings.heroSubtitle} onChange={(e) => patch({ heroSubtitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Hero Image URL">
            <input value={settings.heroImage ?? ''} onChange={(e) => patch({ heroImage: e.target.value })} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary CTA Label">
              <input value={settings.heroCtaPrimaryLabel} onChange={(e) => patch({ heroCtaPrimaryLabel: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Primary CTA URL">
              <input value={settings.heroCtaPrimaryUrl} onChange={(e) => patch({ heroCtaPrimaryUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Secondary CTA Label">
              <input value={settings.heroCtaSecondaryLabel} onChange={(e) => patch({ heroCtaSecondaryLabel: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Secondary CTA URL">
              <input value={settings.heroCtaSecondaryUrl} onChange={(e) => patch({ heroCtaSecondaryUrl: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection title="연락처 · 링크">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input value={settings.phone ?? ''} onChange={(e) => patch({ phone: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Address">
              <input value={settings.address ?? ''} onChange={(e) => patch({ address: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Instagram URL">
              <input value={settings.instagramUrl ?? ''} onChange={(e) => patch({ instagramUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Naver URL">
              <input value={settings.naverUrl ?? ''} onChange={(e) => patch({ naverUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Purchase URL">
              <input value={settings.purchaseUrl ?? ''} onChange={(e) => patch({ purchaseUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Wholesale URL">
              <input value={settings.wholesaleUrl ?? ''} onChange={(e) => patch({ wholesaleUrl: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Footer Note">
            <input value={settings.footerNote ?? ''} onChange={(e) => patch({ footerNote: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>

        <SettingsSection title="SEO 기본값">
          <Field label="Default SEO Title">
            <input value={settings.seoDefaultTitle} onChange={(e) => patch({ seoDefaultTitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Default SEO Description">
            <textarea
              value={settings.seoDefaultDescription}
              onChange={(e) => patch({ seoDefaultDescription: e.target.value })}
              className={`${inputClass} min-h-[70px]`}
            />
          </Field>
          <Field label="OG Image URL">
            <input value={settings.ogImage ?? ''} onChange={(e) => patch({ ogImage: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>
      </div>
    </AdminLayout>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-navy/15 bg-white p-6">
      <h2 className="mb-4 font-serif text-[15px] font-bold text-navy">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
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
