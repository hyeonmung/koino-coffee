import { Link } from 'react-router-dom'
import type { BrewGuide } from '../../data/schema'
import { archive, isSentinelValue } from '../../pages/public/brewGuide/tokens'
import BrewGuideFavoriteStar from './BrewGuideFavoriteStar'
import CornerStar from './CornerStar'
import RatingBadge from './RatingBadge'

interface BrewGuideCardProps {
  guide: BrewGuide
  categoryLabel?: (id?: string) => string | undefined
  /** Real flavor notes from a linked Coffee record — omitted entirely when there's no linked coffee, never invented. */
  flavorNotes?: string[]
  /** Real coffee identity ("Guatemala · 워시드" style) from a linked Coffee record — omitted when absent. */
  coffeeIdentity?: string
}

export default function BrewGuideCard({ guide, categoryLabel, flavorNotes, coffeeIdentity }: BrewGuideCardProps) {
  const kicker =
    guide.source === 'KOI' ? (categoryLabel?.(guide.categoryId) ?? '코이 레시피') : (guide.competitionType ?? '오픈 레시피')

  // `tips` already holds original, human-authored prose (either KOI's own note or our own verified-recipe
  // summary) — safe to surface as the card's short description; never fabricated for this purpose.
  const description = guide.tips?.split('\n').find((line) => line.trim().length > 0)

  const params = [
    guide.coffeeDose && { label: 'COFFEE', value: guide.coffeeDose },
    guide.ratio && { label: 'RATIO', value: guide.ratio },
    guide.temperature && !isSentinelValue(guide.temperature) && { label: 'TEMP', value: guide.temperature },
    guide.totalTime && !isSentinelValue(guide.totalTime) && { label: 'TIME', value: guide.totalTime },
  ].filter((p): p is { label: string; value: string } => Boolean(p))

  return (
    <Link
      to={`/brew-guide/${guide.slug}`}
      className={`group relative isolate flex h-full flex-col p-6 transition-all duration-200 hover:-translate-y-[3px]`}
    >
      <div className={`absolute inset-0 -z-10 border ${archive.accentBorder} ${archive.bgCard} ${archive.cornerNotch}`} />
      <CornerStar className="-left-3 -top-3" />
      <CornerStar className="-bottom-3 -right-3" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] ${archive.accentText}`}>{kicker}</p>
          <span className={`truncate text-[10px] uppercase tracking-[0.1em] ${archive.textMuted}`}>· {guide.equipment}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {guide.rating != null && <RatingBadge rating={guide.rating} />}
          <BrewGuideFavoriteStar slug={guide.slug} count={guide.favoriteCount} className={archive.textMuted} />
        </div>
      </div>

      <h3 className={`mt-3 whitespace-pre-line text-[19px] font-semibold leading-snug ${archive.textPrimary}`}>{guide.title}</h3>

      {(coffeeIdentity || guide.attribution?.creator) && (
        <p className={`mt-1 text-[12px] ${archive.blueText}`}>{coffeeIdentity ?? guide.attribution?.creator}</p>
      )}

      {flavorNotes && flavorNotes.length > 0 && (
        <p className={`mt-2.5 text-[12px] ${archive.textSecondary}`}>{flavorNotes.join(' · ')}</p>
      )}

      {description && <p className={`mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed ${archive.textMuted}`}>{description}</p>}

      <div className="mt-auto pt-5">
        {params.length > 0 && (
          <div className={`flex flex-wrap gap-x-4 gap-y-1 border-t ${archive.border} pt-4`}>
            {params.map((p) => (
              <div key={p.label}>
                <span className={`text-[9px] font-medium tracking-[0.1em] ${archive.textMuted}`}>{p.label} </span>
                <span className={`text-[12px] font-medium tabular-nums ${archive.textPrimary}`}>{p.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-[11px] font-medium ${archive.textMuted}`}>KOINONIA ROASTERS</span>
          <span className={`flex items-center gap-1 text-[11px] font-medium ${archive.accentText}`}>
            레시피 보기
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
