import { useEffect, useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import BrewingTimeline from '../../components/brewGuide/BrewingTimeline'
import CoffeeCard from '../../components/CoffeeCard'
import CopyLinkButton from '../../components/CopyLinkButton'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import ShareButton from '../../components/ShareButton'
import { getBrewGuideBySlug } from '../../data/repositories/brewGuideRepository'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { addRecentlyViewedBrewGuide } from '../../utils/recentlyViewedBrewGuides'
import { archive, isSentinelValue } from './brewGuide/tokens'
import { getEquipmentChecklist } from './brewGuide/equipmentChecklist'
import CornerStar from '../../components/brewGuide/CornerStar'
import BrewGuideFavoriteStar from '../../components/brewGuide/BrewGuideFavoriteStar'
import RatingBadge from '../../components/brewGuide/RatingBadge'

export default function BrewGuideDetailPage() {
  const { slug = '' } = useParams()
  const guide = useMemo(() => getBrewGuideBySlug(slug), [slug])
  const coffees = useMemo(() => getPublishedCoffees(), [])

  useEffect(() => {
    if (guide) addRecentlyViewedBrewGuide(guide.slug)
  }, [guide])

  if (!guide) return <Navigate to="/brew-guide" replace />

  const linkedCoffee = coffees.find((c) => c.brewGuideIds.includes(guide.id))
  const recommended = coffees.filter((c) => c.brewGuideIds.includes(guide.id)).slice(0, 3)
  const isKoi = guide.source === 'KOI'

  const params = [
    { label: 'COFFEE', value: guide.coffeeDose },
    { label: 'WATER', value: guide.water },
    { label: 'RATIO', value: guide.ratio },
    { label: 'TEMP', value: guide.temperature },
    { label: 'TIME', value: guide.totalTime },
  ].filter((p) => p.value && !isSentinelValue(p.value))

  return (
    <div className={`flex min-h-screen flex-col ${archive.bgMain}`}>
      <SEO title={guide.title} description={`${guide.equipment} 추출 레시피 — ${guide.coffeeDose}, ${guide.ratio}`} />
      <PublicHeader />

      <main className="mx-auto w-full min-w-0 max-w-[760px] flex-1 px-6 pt-14 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] font-semibold tracking-[0.25em] ${archive.accentText}`}>
              {isKoi ? '코이 레시피' : (guide.competitionType ?? '오픈 레시피')}
            </p>
            <h1 className={`mt-2 whitespace-pre-line text-[28px] font-semibold ${archive.textPrimary} sm:text-[32px]`}>{guide.title}</h1>
            {linkedCoffee && (
              <p className={`mt-2 text-[13px] ${archive.blueText}`}>{[linkedCoffee.country, linkedCoffee.process].filter(Boolean).join(' · ')}</p>
            )}
            {linkedCoffee && linkedCoffee.notes.length > 0 && (
              <p className={`mt-1 text-[13px] ${archive.textSecondary}`}>{linkedCoffee.notes.join(' · ')}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {guide.rating != null && <RatingBadge rating={guide.rating} />}
            <BrewGuideFavoriteStar slug={guide.slug} count={guide.favoriteCount} size={20} className={archive.textMuted} />
            <ShareButton
              url={`${window.location.origin}/brew-guide/${guide.slug}`}
              title={guide.title}
              className={`rounded-full border ${archive.border} px-3 py-1.5 text-[11px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary}`}
            />
            <CopyLinkButton
              url={`${window.location.origin}/brew-guide/${guide.slug}`}
              className={`rounded-full border ${archive.border} px-3 py-1.5 text-[11px] font-medium ${archive.textSecondary} ${archive.hoverTextPrimary}`}
            />
          </div>
        </div>

        {!isKoi && guide.attribution && (
          <div className={`mt-6 border-y ${archive.border} py-3 text-[12px] ${archive.textSecondary}`}>
            {guide.attribution.creator && (
              <p>
                <span className={`text-[14px] font-semibold ${archive.textPrimary}`}>{guide.attribution.creator}</span>님이 직접 공개한 레시피입니다.
                {guide.attribution.verified && <span className={`ml-1.5 text-[9px] font-bold tracking-[0.1em] ${archive.accentText}`}>· 출처 확인됨</span>}
                {(guide.competitionType || guide.equipment) && (
                  <span className={archive.textMuted}> ({[guide.competitionType, guide.equipment].filter(Boolean).join(' · ')})</span>
                )}
              </p>
            )}
            {guide.attribution.title && <p className={`mt-0.5 ${archive.textMuted}`}>「{guide.attribution.title}」</p>}
            {guide.attribution.url && (
              <a href={guide.attribution.url} target="_blank" rel="noreferrer" className={`mt-1 inline-block ${archive.accentText} hover:underline`}>
                원문 보기{guide.attribution.sourceTimestamp ? ` (${guide.attribution.sourceTimestamp})` : ''} →
              </a>
            )}
            {guide.verificationNote && <p className={`mt-2 text-[11px] ${archive.textMuted}`}>※ {guide.verificationNote}</p>}
          </div>
        )}

        {params.length > 0 && (
          <div className={`relative isolate mt-8 grid grid-cols-3 gap-y-5 px-4 py-6 sm:grid-cols-5`}>
            <div className={`absolute inset-0 -z-10 border ${archive.accentBorder} ${archive.bgCard} ${archive.cornerNotch}`} />
            <CornerStar className="-left-3 -top-3" />
            <CornerStar className="-bottom-3 -right-3" />
            {params.map((p) => (
              <div key={p.label} className="text-center">
                <p className={`text-[9px] font-medium tracking-[0.1em] ${archive.textMuted}`}>{p.label}</p>
                <p className={`mt-1.5 text-[16px] font-semibold tabular-nums ${archive.textPrimary}`}>{p.value}</p>
              </div>
            ))}
          </div>
        )}

        <section className="mt-10">
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>EQUIPMENT</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {getEquipmentChecklist(guide.equipment).map((item) => (
              <span key={item} className={`rounded-full border ${archive.border} px-3 py-1.5 text-[12px] ${archive.textSecondary}`}>
                {item}
              </span>
            ))}
          </div>
        </section>

        {guide.pourSteps.length > 0 && (
          <section className="mt-12">
            <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>BREWING TIMELINE</p>
            <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>추출 순서</h2>
            <div className="mt-5">
              <BrewingTimeline steps={guide.pourSteps} />
            </div>
          </section>
        )}

        {guide.tips && (
          <section className={`mt-10 border-t ${archive.border} pt-8`}>
            <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>{isKoi ? 'KOINONIA NOTE' : '브루어 노트'}</p>
            <p className={`mt-2 whitespace-pre-line text-[13.5px] leading-relaxed ${archive.textSecondary}`}>{guide.tips}</p>
          </section>
        )}

        {guide.commonProblems && (
          <section className="mt-10">
            <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>{isKoi ? 'ADJUST YOUR CUP' : '맛이 다르게 느껴진다면'}</p>
            {isKoi && <p className={`mt-1 text-[12px] ${archive.textMuted}`}>내 취향에 맞게 조절하기</p>}
            <p className={`mt-2 whitespace-pre-line text-[13.5px] leading-relaxed ${archive.textSecondary}`}>{guide.commonProblems}</p>
          </section>
        )}

        {recommended.length > 0 && (
          <section className={`mt-12 border-t ${archive.border} pt-8`}>
            <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>추천 원두</p>
            {/* CoffeeCard reads the site's theme-toggle tokens (text-ink, bg-surface), which this page's
                fixed-dark archive background bypasses. Giving it the current theme's own canvas color
                (light or dark, whichever the toggle is set to) keeps ink/canvas correctly paired instead
                of hardcoding one and breaking contrast in the other theme. */}
            <div className="mt-5 rounded-2xl p-5" style={{ backgroundColor: 'var(--color-canvas)' }}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommended.map((c) => (
                  <CoffeeCard key={c.id} coffee={c} />
                ))}
              </div>
            </div>
          </section>
        )}

        {(guide.koiFeedbackCoffee || guide.koiFeedbackNote) && (
          <section className={`mt-12 border-t ${archive.border} pt-8`}>
            <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>코이의 피드백</p>
            <p className={`mt-1 text-[12px] ${archive.textMuted}`}>직접 내려보고 남긴 기록입니다</p>
            {guide.koiFeedbackCoffee && (
              <p className={`mt-3 text-[13px] ${archive.blueText}`}>사용한 원두 · {guide.koiFeedbackCoffee}</p>
            )}
            {guide.koiFeedbackNote && (
              <p className={`mt-2 whitespace-pre-line text-[13.5px] leading-relaxed ${archive.textSecondary}`}>{guide.koiFeedbackNote}</p>
            )}
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
