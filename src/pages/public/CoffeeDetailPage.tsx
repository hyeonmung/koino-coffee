import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import CoffeeVisual from '../../components/CoffeeVisual'
import FlavorNotes from '../../components/FlavorNotes'
import FlavorSpectrumSpine from '../../components/FlavorSpectrumSpine'
import InfoTooltip from '../../components/InfoTooltip'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import QRCodeBlock from '../../components/QRCodeBlock'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import useIsDesktop from '../../hooks/useIsDesktop'
import { CHARACTER_INFO } from '../../constants/characters'
import { CHARACTER_STYLE } from '../../constants/characterStyle'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getCoffeeBySlug, getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getStoryById } from '../../data/repositories/storyRepository'
import { getSimilarCoffees } from '../../data/similarCoffees'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { formatCoffeeNumber } from '../../utils/coffeeNumber'
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

/**
 * 가공 방식 · PROCESS   워시드 · Washed — a spec row inside the shared SPEC_GRID_CLASS grid.
 * Every row's Value column starts at the exact same X position: the parent grid's first
 * (auto-width) column is sized once from the widest label across ALL rows, not per row.
 */
const SPEC_GRID_CLASS = 'grid grid-cols-[auto_1fr] items-baseline gap-x-6'
const SpecRow = ({ labelKo, labelEn, value }: { labelKo: string; labelEn: string; value?: string }) => {
  if (!value) return null
  return (
    <>
      <p className="border-b border-navy/10 py-3 text-[12px] font-semibold whitespace-nowrap text-navy/50">
        {labelKo} <span className="text-navy/30">· {labelEn}</span>
      </p>
      <p className="border-b border-navy/10 py-3 text-left text-[13px] font-semibold text-navy">{value}</p>
    </>
  )
}

export default function CoffeeDetailPage() {
  const { slug = '' } = useParams()
  const coffee = useMemo(() => getCoffeeBySlug(slug), [slug])
  const allCoffees = useMemo(() => getPublishedCoffees(), [])
  const brewGuides = useMemo(() => getPublishedBrewGuides(), [])
  const settings = useMemo(() => getSiteSettings(), [])
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const isDesktop = useIsDesktop()

  const chartRef = useRef<HTMLDivElement>(null)

  if (!coffee) {
    return <Navigate to="/coffees" replace />
  }

  const character = CHARACTER_INFO[coffee.character]
  const characterAccent = CHARACTER_STYLE[coffee.character].accent
  const characterAccentSoft = CHARACTER_STYLE[coffee.character].accentSoft
  const linkedGuides = brewGuides.filter((g) => coffee.brewGuideIds.includes(g.id))
  const recipe = linkedGuides[0]
  const linkedStory = coffee.storyId ? getStoryById(coffee.storyId) : undefined
  const similar = getSimilarCoffees(coffee, allCoffees, 3)
  const number = formatCoffeeNumber(coffee.coffeeNumber)

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

  const originFields = [
    { labelKo: '지역', labelEn: 'REGION', value: coffee.region },
    { labelKo: '세부 지역', labelEn: 'SUBREGION', value: coffee.subregion },
    { labelKo: '생산자', labelEn: 'PRODUCER', value: coffee.producer },
    { labelKo: '농장 · 가공소', labelEn: 'FARM / STATION', value: coffee.farmOrStation },
    { labelKo: '고도', labelEn: 'ALTITUDE', value: coffee.altitude },
    { labelKo: '수확 시기', labelEn: 'HARVEST', value: coffee.harvest },
    { labelKo: '로트', labelEn: 'LOT', value: coffee.lot },
    { labelKo: '등급', labelEn: 'GRADE', value: coffee.grade },
  ].filter((f) => f.value)

  const processFields = [
    { labelKo: '발효', labelEn: 'FERMENTATION', value: coffee.fermentation },
    { labelKo: '건조', labelEn: 'DRYING', value: coffee.drying },
    { labelKo: '온도', labelEn: 'TEMPERATURE', value: coffee.processTemperature },
    { labelKo: '기간', labelEn: 'DURATION', value: coffee.processDuration },
  ].filter((f) => f.value)

  // ——— Always visible, on every breakpoint: hero visual, identity, CTAs, spec rows, flavor notes. ———
  const headerBlock = (
    <>
      <CoffeeVisual coffee={coffee} aspect="aspect-[3/1]" showIdentity className="mb-8" />

      <div className="flex flex-wrap items-baseline gap-2 text-[11px] font-semibold tracking-[0.25em] text-navy/45">
        {number && <span className="text-accent">{number}</span>}
        <span>{coffee.country}</span>
      </div>
      <div className="mt-1 flex items-stretch gap-4">
        <FlavorSpectrumSpine notes={coffee.notes} size="lg" />
        <div className="min-w-0">
          <h1 className="font-serif text-[32px] font-bold leading-tight text-navy sm:text-[42px]">{coffee.coffeeName}</h1>
          {coffee.koreanName && <p className="mt-0.5 text-[15px] text-navy/45">{coffee.koreanName}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="border border-navy bg-navy px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-warm-white">
          {character.label}
        </span>
        {coffee.availability !== 'available' && (
          <span className="border border-accent/60 bg-accent/15 px-2 py-1 text-[10px] font-semibold text-navy/70">
            {AVAILABILITY_LABEL[coffee.availability]}
          </span>
        )}
      </div>
      <FlavorNotes notes={coffee.notes} className="mt-3 block text-[15px] font-medium text-navy/80" />
      {coffee.characterReason && (
        <p className="mt-3 max-w-[640px] text-[13px] leading-relaxed text-navy/55">{coffee.characterReason}</p>
      )}

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
        <Link to="/coffees" className="border border-navy/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy">
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

      <div className={`mt-8 border-t border-navy/15 ${SPEC_GRID_CLASS}`}>
        <SpecRow labelKo="가공 방식" labelEn="PROCESS" value={coffee.process} />
        <SpecRow labelKo="로스팅" labelEn="ROAST" value={coffee.roastLevel} />
        <SpecRow labelKo="로스터" labelEn="ROASTER" value={coffee.roaster} />
        <SpecRow labelKo="추천 디개싱" labelEn="REST" value={coffee.recommendedRest} />
        <SpecRow labelKo="품종" labelEn="VARIETY" value={coffee.variety} />
        <SpecRow labelKo="산지" labelEn="REGION" value={coffee.region} />
      </div>

      {coffee.notes.length > 0 && (
        <section className="mt-10 border-t border-navy/15 pt-8">
          <h2 className="font-serif text-[18px] font-bold text-navy">플레이버 노트</h2>
          <FlavorNotes notes={coffee.notes} className="mt-3 block text-[18px] font-medium leading-relaxed" />
        </section>
      )}
    </>
  )

  // ——— Below the header, content is grouped by topic. Desktop keeps the existing side-by-side
  // / stacked sections (unchanged); on mobile these are shown one at a time behind a tab bar. ———

  const originProcessRoastContent = (originFields.length > 0 || coffee.processDescription || processFields.length > 0 || coffee.roastType || coffee.roastDirection) && (
    <>
      {originFields.length > 0 && (
        <div>
          <h2 className="font-serif text-[18px] font-bold text-navy">산지 정보</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {originFields.map((f) => (
              <FieldRow key={f.labelEn} label={`${f.labelKo} · ${f.labelEn}`} value={f.value} />
            ))}
          </div>
        </div>
      )}

      {(coffee.processDescription || processFields.length > 0) && (
        <div className={originFields.length > 0 ? 'mt-10' : ''}>
          <h2 className="font-serif text-[18px] font-bold text-navy">가공 방식</h2>
          {coffee.processDescription && <p className="mt-2 text-[13px] leading-relaxed text-navy/65">{coffee.processDescription}</p>}
          {processFields.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              {processFields.map((f) => (
                <FieldRow key={f.labelEn} label={`${f.labelKo} · ${f.labelEn}`} value={f.value} />
              ))}
            </div>
          )}
        </div>
      )}

      {(coffee.roastType || coffee.roastDirection) && (
        <div className={originFields.length > 0 || coffee.processDescription || processFields.length > 0 ? 'mt-10' : ''}>
          <h2 className="font-serif text-[18px] font-bold text-navy">로스팅 이야기</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            <FieldRow label="로스팅 타입 · ROAST TYPE" value={coffee.roastType} />
            <FieldRow label="로스팅 방향 · ROAST DIRECTION" value={coffee.roastDirection} />
          </div>
        </div>
      )}
    </>
  )

  const sensoryContent = (
    <>
      <h2 className="font-serif text-[18px] font-bold text-navy">센서리 프로파일</h2>
      <div className="mt-4 flex justify-center">
        <RadarChart ref={chartRef} sensory={coffee.sensory} size={280} accentColor={characterAccent} accentSoft={characterAccentSoft} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-navy/15 pt-4">
        {SENSORY_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-navy/60">
              {field.labelKo}
              <InfoTooltip title={field.labelKo} criteria={field.criteria} />
            </span>
            <span className="font-serif text-[13px] font-semibold text-navy">{coffee.sensory[field.key]}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-navy/40">수치는 품질 순위가 아니라 각 감각 특성의 상대적인 정도를 나타냅니다.</p>
      <button
        type="button"
        disabled={busy !== null}
        onClick={handleExportRadar}
        className="mt-3 border border-navy/25 px-4 py-2 text-[11px] font-semibold text-navy/60 hover:border-navy hover:text-navy disabled:opacity-40"
      >
        {busy === 'radar' ? '저장 중...' : '레이더 차트 PNG 저장'}
      </button>
    </>
  )

  const commentsContent = (coffee.roasterComment || coffee.baristaComment) && (
    <div className={`grid grid-cols-1 gap-8 ${coffee.roasterComment && coffee.baristaComment ? 'sm:grid-cols-2' : ''}`}>
      {coffee.roasterComment && (
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">로스터의 생각 · ROASTER&apos;S COMMENT</p>
          <p className="mt-2 text-[14px] leading-relaxed text-navy/75">&ldquo;{coffee.roasterComment}&rdquo;</p>
        </div>
      )}
      {coffee.baristaComment && (
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">바리스타의 생각 · BARISTA&apos;S COMMENT</p>
          <p className="mt-2 text-[14px] leading-relaxed text-navy/75">&ldquo;{coffee.baristaComment}&rdquo;</p>
        </div>
      )}
    </div>
  )

  const recipeContent = recipe && (
    <>
      <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">{recipe.equipment}</p>
      <h2 className="mt-1 font-serif text-[20px] font-bold text-navy">이 커피를 위한 추천 레시피</h2>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FieldRow label="원두" value={recipe.coffeeDose} />
        <FieldRow label="물" value={recipe.water} />
        <FieldRow label="온도" value={recipe.temperature} />
        <FieldRow label="분쇄도" value={recipe.grind} />
      </div>

      {recipe.pourSteps.length > 0 && (
        <>
          {/* Desktop: horizontal timeline */}
          <div className="mt-8 hidden sm:block">
            <div className="relative flex items-start justify-between border-t border-navy/20 pt-3">
              {recipe.pourSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / recipe.pourSteps.length}%` }}>
                  <span className="-mt-[19px] mb-2 h-2 w-2 rounded-full bg-navy" />
                  <p className="text-[11px] font-semibold text-navy">{step.time}</p>
                  <p className="mt-0.5 text-[10px] text-navy/50">{step.label}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-navy/70">{step.water}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile: compact vertical steps */}
          <div className="mt-6 space-y-2 sm:hidden">
            {recipe.pourSteps.map((step, i) => (
              <div key={i} className="flex items-center justify-between border-b border-navy/10 pb-2">
                <span className="text-[12px] text-navy/60">{step.label}</span>
                <span className="text-[12px] font-semibold text-navy">
                  {step.time} · {step.water}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Link to={`/brew-guide/${recipe.slug}`} className="mt-5 inline-block text-[12px] font-semibold text-navy/60 hover:text-navy">
        전체 브루 가이드 보기 →
      </Link>
    </>
  )

  const storyContent = linkedStory && (
    <>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">STORY</p>
      <Link to={`/stories/${linkedStory.slug}`} className="mt-2 block border border-navy/15 p-5 hover:border-navy">
        <p className="font-serif text-[16px] font-bold text-navy">{linkedStory.title}</p>
        <p className="mt-1 text-[12px] text-navy/55">{linkedStory.excerpt}</p>
      </Link>
    </>
  )

  const forYouContent = (coffee.recommendedFor || similar.length > 0) && (
    <>
      {coffee.recommendedFor && (
        <p className="text-[13px] leading-relaxed text-navy/70">
          <span className="font-semibold text-navy">추천 대상</span> — {coffee.recommendedFor}
        </p>
      )}
      {similar.length > 0 && (
        <>
          <h2 className={`font-serif text-[18px] font-bold text-navy ${coffee.recommendedFor ? 'mt-4' : ''}`}>비슷한 커피</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {similar.map((c) => (
              <CoffeeCard key={c.id} coffee={c} />
            ))}
          </div>
        </>
      )}
    </>
  )

  const qrContent = (
    <div className="text-center">
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">SCAN & SHARE</p>
      <div className="mt-4 flex justify-center">
        <QRCodeBlock url={shareUrl} filenameBase={slugBase} />
      </div>
    </div>
  )

  type MobileTab = { id: string; label: string; content: React.ReactNode }
  const rawMobileTabs: (MobileTab | null)[] = [
    originProcessRoastContent ? { id: 'origin', label: '산지 · 가공 · 로스팅', content: originProcessRoastContent } : null,
    { id: 'sensory', label: '센서리', content: sensoryContent },
    commentsContent ? { id: 'comments', label: '코멘트', content: commentsContent } : null,
    recipeContent ? { id: 'recipe', label: '레시피', content: recipeContent } : null,
    storyContent ? { id: 'story', label: '이야기', content: storyContent } : null,
    forYouContent ? { id: 'foryou', label: '추천 커피', content: forYouContent } : null,
    { id: 'share', label: '공유', content: qrContent },
  ]
  const mobileTabs = rawMobileTabs.filter((t): t is MobileTab => t !== null)
  const [selectedMobileTab, setSelectedMobileTab] = useState<string | null>(null)
  const activeMobileTab = mobileTabs.some((t) => t.id === selectedMobileTab) ? selectedMobileTab : mobileTabs[0]?.id

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO
        title={coffee.seoTitle || coffee.coffeeName}
        description={coffee.seoDescription || `${coffee.country} · ${character.label} · ${coffee.notes.join(', ')}`}
        image={coffee.heroImage}
      />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1">
        <div className="mx-auto max-w-[1240px] px-6 py-10">
          {headerBlock}

          {isDesktop ? (
            <>
              {/* MAIN ANALYSIS — LEFT: Origin/Process/Roast, RIGHT: Sensory Radar */}
              <div className="mt-10 grid grid-cols-1 gap-10 border-t border-navy/15 pt-10 lg:grid-cols-12">
                <div className="lg:col-span-7">{originProcessRoastContent}</div>
                <div className="lg:col-span-5">{sensoryContent}</div>
              </div>

              {commentsContent && <section className="mt-10 border-t border-navy/15 pt-10">{commentsContent}</section>}
              {recipeContent && <section className="mt-10 border-t border-navy/15 pt-10">{recipeContent}</section>}
              {storyContent && <section className="mt-10 border-t border-navy/15 pt-10">{storyContent}</section>}
              {forYouContent && <section className="mt-10 border-t border-navy/15 pt-10">{forYouContent}</section>}
              <section className="mt-10 border-t border-navy/15 pt-10">{qrContent}</section>
            </>
          ) : (
            mobileTabs.length > 0 && (
              <div className="mt-10 border-t border-navy/15 pt-6">
                <div className="-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-4">
                  {mobileTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedMobileTab(tab.id)}
                      className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        activeMobileTab === tab.id ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div>{mobileTabs.find((t) => t.id === activeMobileTab)?.content}</div>
              </div>
            )
          )}

          {/* PROFILE META */}
          <p className="mt-10 border-t border-navy/15 pt-6 text-center text-[10px] text-navy/35">
            Profile Updated {new Date(coffee.updatedAt).toLocaleDateString('ko-KR')} · v{coffee.profileVersion} · Roasted
            by {settings.brandName}
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
