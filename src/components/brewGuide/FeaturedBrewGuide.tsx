import { Link } from 'react-router-dom'
import type { BrewGuide } from '../../data/schema'
import { archive, isSentinelValue } from '../../pages/public/brewGuide/tokens'
import BrewingTimeline from './BrewingTimeline'

interface FeaturedBrewGuideProps {
  guide: BrewGuide
  flavorNotes?: string[]
  coffeeIdentity?: string
}

const PARAM_LABELS: { key: keyof BrewGuide; label: string }[] = [
  { key: 'coffeeDose', label: 'COFFEE' },
  { key: 'water', label: 'WATER' },
  { key: 'ratio', label: 'RATIO' },
  { key: 'temperature', label: 'TEMP' },
  { key: 'totalTime', label: 'FINISH' },
]

export default function FeaturedBrewGuide({ guide, flavorNotes, coffeeIdentity }: FeaturedBrewGuideProps) {
  const params = PARAM_LABELS.map((p) => ({ ...p, value: guide[p.key] as string })).filter(
    (p) => p.value && !isSentinelValue(p.value),
  )

  return (
    <section>
      <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>FEATURED BREW</p>
      <div className={`mt-4 rounded-[20px] border ${archive.border} ${archive.bgCard} p-6 sm:p-10`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="lg:w-[38%]">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${archive.textMuted}`}>{guide.equipment} BREWING GUIDE</p>
            <h2 className={`mt-2 whitespace-pre-line text-[26px] font-semibold leading-snug ${archive.textPrimary} sm:text-[30px]`}>
              {guide.title}
            </h2>
            {coffeeIdentity && <p className={`mt-2 text-[13px] ${archive.blueText}`}>{coffeeIdentity}</p>}
            {flavorNotes && flavorNotes.length > 0 && (
              <p className={`mt-1.5 text-[13px] ${archive.textSecondary}`}>{flavorNotes.join(' · ')}</p>
            )}

            {params.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-y-4">
                {params.map((p) => (
                  <div key={p.label}>
                    <p className={`text-[9px] font-medium tracking-[0.1em] ${archive.textMuted}`}>{p.label}</p>
                    <p title={p.value} className={`mt-1 line-clamp-2 text-[15px] font-semibold tabular-nums ${archive.textPrimary}`}>
                      {p.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to={`/brew-guide/${guide.slug}`}
              className={`mt-8 inline-flex items-center gap-1.5 text-[12px] font-semibold ${archive.accentText}`}
            >
              레시피 자세히 보기 →
            </Link>
          </div>

          <div className={`border-t ${archive.border} pt-8 lg:w-[62%] lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0`}>
            <BrewingTimeline steps={guide.pourSteps} totalTime={guide.totalTime} />
          </div>
        </div>
      </div>
    </section>
  )
}
