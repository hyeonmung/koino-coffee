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
          <div className="flex items-center gap-3 border border-navy/15 bg-white p-3">
            <img src="/brand/koi-logo.png" alt="KOI COFFEE 공식 로고" className="h-12 w-12" />
            <p className="text-[11px] leading-relaxed text-navy/50">
              현재 적용된 공식 로고입니다. Header · Footer · Favicon에 자동으로 사용됩니다.
              <br />
              로고 이미지 자체는 코드 수정이 필요합니다 — 개발자에게 새 파일을 전달해주세요.
            </p>
          </div>
          <Field label="브랜드명 (작은 표기, 예: 코이노니아)">
            <input value={settings.brandName} onChange={(e) => patch({ brandName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="로고 표기 (예: KOINONIA)">
            <input value={settings.logoText} onChange={(e) => patch({ logoText: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>

        <SettingsSection title="연락처 · 링크">
          <div className="grid grid-cols-2 gap-3">
            <Field label="전화번호">
              <input value={settings.phone ?? ''} onChange={(e) => patch({ phone: e.target.value })} className={inputClass} />
            </Field>
            <Field label="주소">
              <input value={settings.address ?? ''} onChange={(e) => patch({ address: e.target.value })} className={inputClass} />
            </Field>
            <Field label="운영시간">
              <input
                value={settings.businessHours ?? ''}
                onChange={(e) => patch({ businessHours: e.target.value })}
                className={inputClass}
                placeholder="매일 10:00 - 20:00"
              />
            </Field>
            <Field label="Instagram URL">
              <input value={settings.instagramUrl ?? ''} onChange={(e) => patch({ instagramUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Naver URL">
              <input value={settings.naverUrl ?? ''} onChange={(e) => patch({ naverUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="온라인 구매 URL">
              <input value={settings.purchaseUrl ?? ''} onChange={(e) => patch({ purchaseUrl: e.target.value })} className={inputClass} />
            </Field>
            <Field label="납품 · 교육 페이지 URL">
              <input value={settings.businessUrl ?? ''} onChange={(e) => patch({ businessUrl: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="사업자 정보 (상호 · 대표자 · 사업자등록번호 등)">
            <textarea
              value={settings.businessRegistrationInfo ?? ''}
              onChange={(e) => patch({ businessRegistrationInfo: e.target.value })}
              className={`${inputClass} min-h-[60px]`}
              placeholder="상호: 코이노니아 | 대표: OOO | 사업자등록번호: 000-00-00000"
            />
          </Field>
          <Field label="Footer 저작권 문구">
            <input value={settings.footerNote ?? ''} onChange={(e) => patch({ footerNote: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>

        <SettingsSection title="SEO 기본값">
          <Field label="기본 SEO 제목">
            <input value={settings.seoDefaultTitle} onChange={(e) => patch({ seoDefaultTitle: e.target.value })} className={inputClass} />
          </Field>
          <Field label="기본 SEO 설명">
            <textarea
              value={settings.seoDefaultDescription}
              onChange={(e) => patch({ seoDefaultDescription: e.target.value })}
              className={`${inputClass} min-h-[70px]`}
            />
          </Field>
          <Field label="OG 이미지 URL">
            <input value={settings.ogImage ?? ''} onChange={(e) => patch({ ogImage: e.target.value })} className={inputClass} />
          </Field>
        </SettingsSection>

        <p className="text-[11px] text-navy/40">
          홈페이지 Hero 문구는{' '}
          <a href="#/admin/home" className="underline">
            홈 관리
          </a>
          에서, 코이노니아 소개는{' '}
          <a href="#/admin/about" className="underline">
            코이노니아
          </a>{' '}
          메뉴에서, 납품·교육 서비스 소개는{' '}
          <a href="#/admin/business" className="underline">
            납품 · 교육
          </a>{' '}
          메뉴에서 관리합니다.
        </p>
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
