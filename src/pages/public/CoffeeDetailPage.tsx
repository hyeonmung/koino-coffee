import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import CoffeeVisual from '../../components/CoffeeVisual'
import FlavorNotes from '../../components/FlavorNotes'
import InfoTooltip from '../../components/InfoTooltip'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import QRCodeBlock from '../../components/QRCodeBlock'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { FLAVOR_FAMILY_COLOR } from '../../constants/flavorColors'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getCoffeeBySlug, getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import { getStoryById } from '../../data/repositories/storyRepository'
import { groupNotesByFamily } from '../../data/flavorMatch'
import { getSimilarCoffees } from '../../data/similarCoffees'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { slugifyFilename } from '../../utils/download'
import { exportNodeAsPng } from '../../utils/pngExport'

const AVAILABILITY_LABEL: Record<string, string> = {
  available: 'Available',
  limited: 'Limited Release',
  archive: 'Past Coffee',
}

const FieldRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">{label}</p>
      <p className="text-[13px] text-navy">{value}</p>
    </div>
  )
}

export default function CoffeeDetailPage() {
  const { slug = '' } = useParams()
  const coffee = useMemo(() => getCoffeeBySlug(slug), [slug])
  const allCoffees = useMemo(() => getPublishedCoffees(), [])
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const families = useMemo(() => getFlavorFamilies(), [])
  const brewGuides = useMemo(() => getPublishedBrewGuides(), [])
  const settings = useMemo(() => getSiteSettings(), [])
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const chartRef = useRef<HTMLDivElement>(null)

  if (!coffee) {
    return <Navigate to="/coffees" replace />
  }

  const character = CHARACTER_INFO[coffee.character]
  const flavorGroups = groupNotesByFamily(coffee.notes, descriptors, families)
  const linkedGuides = brewGuides.filter((g) => coffee.brewGuideIds.includes(g.id))
  const linkedStory = coffee.storyId ? getStoryById(coffee.storyId) : undefined
  const similar = getSimilarCoffees(coffee, allCoffees, 3)

  const shareUrl = `${window.location.origin}${window.location.pathname}#/coffees/${coffee.slug}`
  const slugBase = slugifyFilename(coffee.coffeeName)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: coffee.coffeeName, text: `${coffee.country} · ${character.label}`, url: shareUrl })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportRadar = async () => {
    setBusy('radar')
    try {
      await exportNodeAsPng(chartRef.current, `${slugBase}-radar.png`, true)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO
        title={coffee.seoTitle || coffee.coffeeName}
        description={coffee.seoDescription || `${coffee.country} · ${character.label} · ${coffee.notes.join(', ')}`}
        image={coffee.heroImage}
      />
      <PublicHeader />

      <main className="mx-auto max-w-[860px] px-6 py-10">
        {/* SECTION 1 — HERO */}
        <CoffeeVisual coffee={coffee} aspect="aspect-[16/9]" showIdentity className="mb-8" />
        <p className="text-[11px] font-semibold tracking-[0.25em] text-navy/50">{coffee.country}</p>
        <h1 className="mt-1 font-serif text-[30px] font-bold leading-tight text-navy sm:text-[38px]">
          {coffee.coffeeName}
        </h1>
        {coffee.koreanName && <p className="mt-0.5 text-[14px] text-navy/45">{coffee.koreanName}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="border border-navy bg-navy px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-warm-white">
            {character.label}
          </span>
          {coffee.availability !== 'available' && (
            <span className="border border-accent/60 bg-accent/15 px-2 py-1 text-[10px] font-semibold text-navy/70">
              {AVAILABILITY_LABEL[coffee.availability]}
            </span>
          )}
        </div>
        <FlavorNotes notes={coffee.notes} className="mt-3 block text-[14px] text-navy/75" />

        <div className="mt-6 flex flex-wrap gap-2">
          {coffee.purchaseUrl && (
            <a
              href={coffee.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-navy bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
            >
              원두 구매
            </a>
          )}
          <Link
            to="/coffees"
            className="border border-navy/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy"
          >
            비슷한 커피 찾기
          </Link>
          {coffee.chartVisible !== false && (
            <Link
              to={`/coffee-chart/${coffee.slug}`}
              className="border border-navy/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy"
            >
              원두 차트로 한눈에 보기
            </Link>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="border border-navy/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy"
          >
            {copied ? '링크 복사됨' : '공유하기'}
          </button>
        </div>

        {/* SECTION 2 — CUP CHARACTER */}
        <section className="mt-14 border-t border-navy/15 pt-10">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">CUP CHARACTER</p>
          <h2 className="mt-1 font-serif text-[26px] font-bold text-navy">{character.label}</h2>
          <p className="mt-1 text-[13px] text-navy/60">{character.description}</p>
          <p className="mt-1 text-[12px] text-navy/45">{character.flavors}</p>
          {coffee.characterReason && (
            <div className="mt-4 border border-navy/15 bg-white p-4">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">WHY {character.label}?</p>
              <p className="mt-1 text-[13px] leading-relaxed text-navy/70">{coffee.characterReason}</p>
            </div>
          )}
        </section>

        {/* SECTION 3 — SENSORY MAP */}
        <section className="mt-14 border-t border-navy/15 pt-10">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">KOINO SENSORY MAP</p>
          <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">Sensory Profile</h2>
          <div className="mt-6">
            <RadarChart ref={chartRef} sensory={coffee.sensory} size={280} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-navy/15 pt-4 sm:grid-cols-3">
            {SENSORY_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-navy/60">
                  {field.label}
                  <InfoTooltip title={field.label} criteria={field.criteria} />
                </span>
                <span className="font-serif text-[13px] font-semibold text-navy">{coffee.sensory[field.key]}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-navy/40">
            수치는 품질 순위가 아니라 각 감각 특성의 상대적인 정도를 나타냅니다.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={handleExportRadar}
            className="mt-3 border border-navy/25 px-4 py-2 text-[11px] font-semibold text-navy/60 hover:border-navy hover:text-navy disabled:opacity-40"
          >
            {busy === 'radar' ? '저장 중...' : '레이더 차트 PNG 저장'}
          </button>
        </section>

        {/* SECTION 4 — FLAVOR */}
        {flavorGroups.length > 0 && (
          <section className="mt-14 border-t border-navy/15 pt-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">FLAVOR</p>
            <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">Flavor Notes</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {flavorGroups.map((group) => (
                <div key={group.family.id}>
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">
                    {group.family.name.toUpperCase()}
                  </p>
                  <p
                    className="mt-1 text-[13px] font-medium text-navy"
                    style={FLAVOR_FAMILY_COLOR[group.family.id] ? { color: FLAVOR_FAMILY_COLOR[group.family.id] } : undefined}
                  >
                    {group.notes.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5 — ORIGIN */}
        <section className="mt-14 border-t border-navy/15 pt-10">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">ORIGIN</p>
          <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">산지 정보</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            <FieldRow label="COUNTRY" value={coffee.country} />
            <FieldRow label="REGION" value={coffee.region} />
            <FieldRow label="SUBREGION" value={coffee.subregion} />
            <FieldRow label="PRODUCER" value={coffee.producer} />
            <FieldRow label="FARM / STATION" value={coffee.farmOrStation} />
            <FieldRow label="ALTITUDE" value={coffee.altitude} />
            <FieldRow label="VARIETY" value={coffee.variety} />
            <FieldRow label="HARVEST" value={coffee.harvest} />
            <FieldRow label="LOT" value={coffee.lot} />
            <FieldRow label="GRADE" value={coffee.grade} />
          </div>
        </section>

        {/* SECTION 6 — PROCESS */}
        {coffee.process && (
          <section className="mt-14 border-t border-navy/15 pt-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">PROCESS</p>
            <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">{coffee.process}</h2>
            {coffee.processDescription && (
              <p className="mt-2 text-[13px] leading-relaxed text-navy/65">{coffee.processDescription}</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <FieldRow label="FERMENTATION" value={coffee.fermentation} />
              <FieldRow label="DRYING" value={coffee.drying} />
              <FieldRow label="TEMPERATURE" value={coffee.processTemperature} />
              <FieldRow label="DURATION" value={coffee.processDuration} />
            </div>
          </section>
        )}

        {/* SECTION 7 — ROAST */}
        <section className="mt-14 border-t border-navy/15 pt-10">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">ROAST</p>
          <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">로스팅 정보</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            <FieldRow label="ROAST TYPE" value={coffee.roastType} />
            <FieldRow label="ROAST LEVEL" value={coffee.roastLevel} />
            <FieldRow label="ROAST DIRECTION" value={coffee.roastDirection} />
            <FieldRow label="RECOMMENDED REST" value={coffee.recommendedRest} />
          </div>
        </section>

        {/* SECTION 8 — BREW GUIDE */}
        {linkedGuides.length > 0 && (
          <section className="mt-14 border-t border-navy/15 pt-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BREW GUIDE</p>
            <h2 className="mt-1 font-serif text-[22px] font-bold text-navy">추천 레시피</h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {linkedGuides.map((guide) => (
                <Link key={guide.id} to={`/brew-guide/${guide.slug}`} className="border border-navy/15 p-5 hover:border-navy">
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/45">{guide.equipment}</p>
                  <p className="mt-1 font-serif text-[16px] font-bold text-navy">{guide.title}</p>
                  <p className="mt-2 text-[11px] text-navy/55">
                    {guide.coffeeDose} · {guide.water} · {guide.temperature} · {guide.grind}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 9 — FOR YOU */}
        <section className="mt-14 border-t border-navy/15 pt-10">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">FOR YOU</p>
          {coffee.recommendedFor && (
            <p className="mt-1 text-[13px] leading-relaxed text-navy/70">
              <span className="font-semibold text-navy">Recommended for</span> — {coffee.recommendedFor}
            </p>
          )}
          {similar.length > 0 && (
            <>
              <h2 className="mt-6 font-serif text-[18px] font-bold text-navy">Similar Coffees</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similar.map((c) => (
                  <CoffeeCard key={c.id} coffee={c} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* SECTION 10 — TRACE / STORY */}
        {linkedStory && (
          <section className="mt-14 border-t border-navy/15 pt-10">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">STORY</p>
            <Link to={`/stories/${linkedStory.slug}`} className="mt-2 block border border-navy/15 p-5 hover:border-navy">
              <p className="font-serif text-[16px] font-bold text-navy">{linkedStory.title}</p>
              <p className="mt-1 text-[12px] text-navy/55">{linkedStory.excerpt}</p>
            </Link>
          </section>
        )}

        {/* QR */}
        <section className="mt-14 border-t border-navy/15 pt-10 text-center">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">SCAN & SHARE</p>
          <div className="mt-4 flex justify-center">
            <QRCodeBlock url={shareUrl} filenameBase={slugBase} />
          </div>
        </section>

        {/* SECTION 11 — PROFILE META */}
        <p className="mt-14 border-t border-navy/15 pt-6 text-center text-[10px] text-navy/35">
          Profile Updated {new Date(coffee.updatedAt).toLocaleDateString('ko-KR')} · v{coffee.profileVersion} · Roasted
          by {settings.brandName}
        </p>
      </main>

      <PublicFooter />
    </div>
  )
}
