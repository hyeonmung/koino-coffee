import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import CoffeePrice from '../../components/CoffeePrice'
import CoffeeVisual from '../../components/CoffeeVisual'
import FavoriteStar from '../../components/FavoriteStar'
import FlavorNotes from '../../components/FlavorNotes'
import FlavorSpectrumSpine from '../../components/FlavorSpectrumSpine'
import InfoTooltip from '../../components/InfoTooltip'
import Pagination from '../../components/Pagination'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import QRCodeBlock from '../../components/QRCodeBlock'
import RadarChart from '../../components/RadarChart'
import SEO from '../../components/SEO'
import CopyLinkButton from '../../components/CopyLinkButton'
import ShareButton from '../../components/ShareButton'
import useIsDesktop from '../../hooks/useIsDesktop'
import { useTheme } from '../../hooks/useTheme'
import { CHARACTER_INFO } from '../../constants/characters'
import { getCharacterStyle } from '../../constants/characterStyle'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getPublishedBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getCoffeeBySlug, getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors } from '../../data/repositories/flavorRepository'
import { getSimilarCoffees } from '../../data/similarCoffees'
import { getSiteSettings } from '../../data/repositories/siteSettingsRepository'
import { formatCoffeeNumber } from '../../utils/coffeeNumber'
import { slugifyFilename } from '../../utils/download'
import { exportNodeAsPng } from '../../utils/pngExport'

const AVAILABILITY_LABEL: Record<string, string> = {
  available: 'Available',
  limited: 'Limited Release',
  archive: 'Past Coffee',
  sold_out: '품절',
  restocking: '재입고 예정',
}

const FieldRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.15em] text-ink/40">{label}</p>
      <p className="text-[16px] font-semibold text-ink">{value}</p>
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
      <p className="border-b border-line/10 py-3 text-[12px] font-semibold whitespace-nowrap text-ink/50">
        {labelKo} <span className="text-ink/30">· {labelEn}</span>
      </p>
      <p className="border-b border-line/10 py-3 text-left text-[13px] font-semibold whitespace-pre-line text-ink">{value}</p>
    </>
  )
}

export default function CoffeeDetailPage() {
  const { slug = '' } = useParams()
  const coffee = useMemo(() => getCoffeeBySlug(slug), [slug])
  const allCoffees = useMemo(() => getPublishedCoffees(), [])
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const brewGuides = useMemo(() => getPublishedBrewGuides(), [])
  const settings = useMemo(() => getSiteSettings(), [])
  const [busy, setBusy] = useState<string | null>(null)
  const [mobilePage, setMobilePage] = useState(1)
  const isDesktop = useIsDesktop()
  const { resolved } = useTheme()

  // Navigating from one coffee's detail page straight to another (same route, new slug)
  // doesn't remount this component, so without this the mobile tab pager would keep
  // whatever page index the previous coffee was showing.
  useEffect(() => {
    setMobilePage(1)
  }, [slug])

  const chartRef = useRef<HTMLDivElement>(null)

  if (!coffee) {
    return <Navigate to="/coffees" replace />
  }

  const character = CHARACTER_INFO[coffee.character]
  const characterAccent = getCharacterStyle(coffee.character, resolved === 'dark').accent
  const characterAccentSoft = getCharacterStyle(coffee.character, resolved === 'dark').accentSoft
  const linkedGuides = brewGuides.filter((g) => coffee.brewGuideIds.includes(g.id))
  const recipe = linkedGuides[0]
  const similar = getSimilarCoffees(coffee, allCoffees, descriptors, 3)
  const number = formatCoffeeNumber(coffee.coffeeNumber)

  const shareUrl = `${window.location.origin}/coffees/${coffee.slug}`
  const slugBase = slugifyFilename(coffee.coffeeName)

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
      <CoffeeVisual coffee={coffee} showIdentity className="mb-8" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2 text-[11px] font-semibold tracking-[0.25em] text-ink/45">
          {number && (
            <span
              className="text-[56px] font-bold italic tracking-tight text-accent"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {number}
            </span>
          )}
          <span>{coffee.country}</span>
        </div>
        <FavoriteStar slug={coffee.slug} count={coffee.favoriteCount} size={22} className="text-ink/30" />
      </div>
      <div className="mt-1 flex items-stretch gap-4">
        <FlavorSpectrumSpine notes={coffee.notes} size="lg" />
        <div className="min-w-0">
          <h1 className="font-serif text-[32px] font-bold leading-tight whitespace-pre-line text-ink sm:text-[42px]">{coffee.coffeeName}</h1>
          {coffee.koreanName && (
            <p
              className={`mt-0.5 whitespace-pre-line ${
                resolved === 'dark' ? 'text-[30px] font-semibold text-accent' : 'text-[15px] text-ink/45'
              }`}
            >
              {coffee.koreanName}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="border border-line bg-navy px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-warm-white">
          {character.label}
        </span>
        {coffee.availability !== 'available' && (
          <span className="border border-accent/60 bg-accent/15 px-2 py-1 text-[10px] font-semibold text-ink/70">
            {AVAILABILITY_LABEL[coffee.availability]}
          </span>
        )}
        {coffee.badges?.map((b) => (
          <span key={b} className="border border-accent/50 px-2 py-1 text-[10px] font-bold tracking-[0.05em] text-accent">
            {b}
          </span>
        ))}
        {coffee.isDecaf && (
          <span className="border border-line/25 px-2 py-1 text-[10px] font-bold tracking-[0.05em] text-ink/60">DECAF</span>
        )}
      </div>
      <FlavorNotes notes={coffee.notes} className="mt-3 block text-[15px] font-medium text-ink/80" />
      {coffee.characterReason && (
        <p className="mt-3 max-w-[640px] whitespace-pre-line text-[13px] leading-relaxed text-ink/55">{coffee.characterReason}</p>
      )}

      <CoffeePrice coffee={coffee} className="mt-4" size="lg" />
      {coffee.bestBeforeDate && <p className="mt-1 text-[10px] text-ink/35">소비기한 {coffee.bestBeforeDate}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {coffee.purchaseUrl && (
          <a
            href={coffee.purchaseUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-line bg-navy px-5 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
          >
            원두 구매
          </a>
        )}
        <Link to="/coffees" className="border border-line/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-ink hover:border-line">
          비슷한 커피 찾기
        </Link>
        <ShareButton url={shareUrl} title={coffee.coffeeName} />
        <CopyLinkButton url={shareUrl} />
      </div>

      <div className={`mt-8 border-t border-line/15 ${SPEC_GRID_CLASS}`}>
        <SpecRow labelKo="가공 방식" labelEn="PROCESS" value={coffee.process} />
        <SpecRow labelKo="로스팅" labelEn="ROAST" value={coffee.roastLevel} />
        <SpecRow labelKo="로스터" labelEn="ROASTER" value={coffee.roaster} />
        <SpecRow labelKo="추천 디개싱" labelEn="REST" value={coffee.recommendedRest} />
        <SpecRow labelKo="품종" labelEn="VARIETY" value={coffee.variety} />
        <SpecRow labelKo="산지" labelEn="REGION" value={coffee.region} />
      </div>

      {coffee.notes.length > 0 && (
        <section className="mt-10 border-t border-line/15 pt-8">
          <h2 className="text-[18px] font-bold text-ink">플레이버 노트</h2>
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
          <h2 className="text-[18px] font-bold text-ink">산지 정보</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {originFields.map((f) => (
              <FieldRow key={f.labelEn} label={`${f.labelKo} · ${f.labelEn}`} value={f.value} />
            ))}
          </div>
        </div>
      )}

      {(coffee.processDescription || processFields.length > 0) && (
        <div className={originFields.length > 0 ? 'mt-10' : ''}>
          <h2 className="text-[18px] font-bold text-ink">가공 방식</h2>
          {coffee.processDescription && <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink/65">{coffee.processDescription}</p>}
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
          <h2 className="text-[18px] font-bold text-ink">로스팅 이야기</h2>
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
      <h2 className="text-[18px] font-bold text-ink">센서리 프로파일</h2>
      <div className="mt-4 flex justify-center">
        <RadarChart ref={chartRef} sensory={coffee.sensory} size={280} accentColor={characterAccent} accentSoft={characterAccentSoft} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line/15 pt-4">
        {SENSORY_FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-ink/60">
              {field.labelKo}
              <InfoTooltip title={field.labelKo} criteria={field.criteria} />
            </span>
            <span className="text-[13px] font-semibold text-ink">{coffee.sensory[field.key]}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-ink/40">수치는 품질 순위가 아니라 각 감각 특성의 상대적인 정도를 나타냅니다.</p>
      <button
        type="button"
        disabled={busy !== null}
        onClick={handleExportRadar}
        className="mt-3 border border-line/25 px-4 py-2 text-[11px] font-semibold text-ink/60 hover:border-line hover:text-ink disabled:opacity-40"
      >
        {busy === 'radar' ? '저장 중...' : '레이더 차트 PNG 저장'}
      </button>
    </>
  )

  const commentsContent = (coffee.roasterComment || coffee.baristaComment) && (
    <div className={`grid grid-cols-1 gap-8 ${coffee.roasterComment && coffee.baristaComment ? 'sm:grid-cols-2' : ''}`}>
      {coffee.roasterComment && (
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-ink/40">로스터의 생각 · ROASTER&apos;S COMMENT</p>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/75">&ldquo;{coffee.roasterComment}&rdquo;</p>
        </div>
      )}
      {coffee.baristaComment && (
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-ink/40">바리스타의 생각 · BARISTA&apos;S COMMENT</p>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/75">&ldquo;{coffee.baristaComment}&rdquo;</p>
        </div>
      )}
    </div>
  )

  const recipeContent = recipe && (
    <>
      <p className="text-[10px] font-semibold tracking-[0.15em] text-ink/40">{recipe.equipment}</p>
      <h2 className="mt-1 text-[20px] font-bold text-ink">이 커피를 위한 추천 레시피</h2>

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
            <div className="relative flex items-start justify-between border-t border-line/20 pt-3">
              {recipe.pourSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / recipe.pourSteps.length}%` }}>
                  <span className="-mt-[19px] mb-2 h-2 w-2 rounded-full bg-navy" />
                  <p className="text-[11px] font-semibold text-ink">{step.time}</p>
                  <p className="mt-0.5 text-[10px] text-ink/50">{step.label}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink/70">{step.water}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile: compact vertical steps */}
          <div className="mt-6 space-y-2 sm:hidden">
            {recipe.pourSteps.map((step, i) => (
              <div key={i} className="flex items-center justify-between border-b border-line/10 pb-2">
                <span className="text-[12px] text-ink/60">{step.label}</span>
                <span className="text-[12px] font-semibold text-ink">
                  {step.time} · {step.water}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <Link to={`/brew-guide/${recipe.slug}`} className="mt-5 inline-block text-[12px] font-semibold text-ink/60 hover:text-ink">
        전체 브루잉 레시피 보기 →
      </Link>
    </>
  )

  const forYouContent = (coffee.recommendedFor || similar.length > 0) && (
    <>
      {coffee.recommendedFor && (
        <p className="text-[13px] leading-relaxed text-ink/70">
          <span className="font-semibold text-ink">추천 대상</span> — <span className="whitespace-pre-line">{coffee.recommendedFor}</span>
        </p>
      )}
      {similar.length > 0 && (
        <>
          <h2 className={`text-[18px] font-bold text-ink ${coffee.recommendedFor ? 'mt-4' : ''}`}>비슷한 커피</h2>
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
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">SCAN & SHARE</p>
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
    forYouContent ? { id: 'foryou', label: '추천 커피', content: forYouContent } : null,
    { id: 'share', label: '공유', content: qrContent },
  ]
  // Only sections this coffee actually has data for get a page — so the page count grows
  // or shrinks on its own as an admin fills in more fields (recipe, story, comments...).
  const mobileTabs = rawMobileTabs.filter((t): t is MobileTab => t !== null)
  const mobileTotalPages = Math.max(1, mobileTabs.length)
  const mobileCurrentPage = Math.min(mobilePage, mobileTotalPages)
  const activeMobileTab = mobileTabs[mobileCurrentPage - 1]

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
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
              <div className="mt-10 grid grid-cols-1 gap-10 border-t border-line/15 pt-10 lg:grid-cols-12">
                <div className="lg:col-span-7">{originProcessRoastContent}</div>
                <div className="lg:col-span-5">{sensoryContent}</div>
              </div>

              {commentsContent && <section className="mt-10 border-t border-line/15 pt-10">{commentsContent}</section>}
              {recipeContent && <section className="mt-10 border-t border-line/15 pt-10">{recipeContent}</section>}
              {forYouContent && <section className="mt-10 border-t border-line/15 pt-10">{forYouContent}</section>}
              <section className="mt-10 border-t border-line/15 pt-10">{qrContent}</section>
            </>
          ) : (
            mobileTabs.length > 0 && (
              <div className="mt-10 border-t border-line/15 pt-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-accent font-kicker">
                  {mobileCurrentPage} / {mobileTotalPages} · {activeMobileTab?.label}
                </p>
                <div className="mt-4">{activeMobileTab?.content}</div>
                <Pagination page={mobileCurrentPage} totalPages={mobileTotalPages} onChange={setMobilePage} scrollToTop={false} />
              </div>
            )
          )}

          {/* PROFILE META */}
          <p className="mt-10 border-t border-line/15 pt-6 text-center text-[10px] text-ink/35">
            Profile Updated {new Date(coffee.updatedAt).toLocaleDateString('ko-KR')} · v{coffee.profileVersion} · Roasted
            by {settings.brandName}
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
