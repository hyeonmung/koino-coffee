import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import DotScale from '../../components/DotScale'
import FlavorNotes from '../../components/FlavorNotes'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import QRCodeBlock from '../../components/QRCodeBlock'
import RadarChart from '../../components/RadarChart'
import RoastDirection from '../../components/RoastDirection'
import SEO from '../../components/SEO'
import { CHARACTER_INFO } from '../../constants/characters'
import { CHARACTER_STYLE } from '../../constants/characterStyle'
import { SENSORY_FIELDS } from '../../constants/sensory'
import { getBrewGuideById } from '../../data/repositories/brewGuideRepository'
import { getCoffeeBySlug } from '../../data/repositories/coffeeRepository'
import { slugifyFilename } from '../../utils/download'
import { SOCIAL_SIZE_PRESETS, exportNodeAsSizedPng } from '../../utils/pngExport'

const SPEC = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div>
      <p className="text-[9px] font-semibold tracking-[0.12em] text-navy/40">{label}</p>
      <p className="text-[13px] font-semibold whitespace-pre-line text-navy">{value}</p>
    </div>
  ) : null

export default function CoffeeChartDetailPage() {
  const { slug = '' } = useParams()
  const coffee = useMemo(() => getCoffeeBySlug(slug), [slug])
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<string | null>(null)

  if (!coffee || coffee.publishStatus !== 'published' || coffee.chartVisible === false) {
    return <Navigate to="/coffee-chart" replace />
  }

  const character = CHARACTER_INFO[coffee.character]
  const characterAccent = CHARACTER_STYLE[coffee.character].accent
  const guide = coffee.brewGuideIds[0] ? getBrewGuideById(coffee.brewGuideIds[0]) : undefined
  const hasAdvanced = coffee.roastData && Object.values(coffee.roastData).some(Boolean)
  const shareUrl = `${window.location.origin}${window.location.pathname}#/coffee-chart/${coffee.slug}`
  const slugBase = slugifyFilename(coffee.coffeeName)

  const handleExport = async (presetKey: string) => {
    const preset = SOCIAL_SIZE_PRESETS.find((p) => p.key === presetKey)
    if (!preset) return
    setBusy(presetKey)
    try {
      await exportNodeAsSizedPng(cardRef.current, `${slugBase}-chart-${preset.key}.png`, preset)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO
        title={`${coffee.coffeeName} 원두 차트`}
        description={`${coffee.country} · ${character.label} · ${coffee.notes.join(', ')}`}
        image={coffee.heroImage}
      />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <Link to="/coffee-chart" className="text-[11px] font-semibold text-navy/45 hover:text-navy">
          ← 원두 차트 목록
        </Link>

        <div ref={cardRef} className="mt-4 border border-navy/15 bg-white p-8">
          {/* HEADER */}
          <p className="text-[10px] font-semibold tracking-[0.35em] text-accent">KOINONIA CHART</p>
          <p className="mt-3 text-[12px] font-semibold tracking-[0.15em] text-navy/50">
            {coffee.country?.toUpperCase()}
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-bold leading-tight whitespace-pre-line text-navy">{coffee.coffeeName}</h1>
          {coffee.koreanName && <p className="whitespace-pre-line text-[13px] text-navy/50">{coffee.koreanName}</p>}
          <span className="mt-3 inline-block border border-navy bg-navy px-3 py-1 text-[11px] font-bold tracking-[0.15em] text-warm-white">
            {character.label}
          </span>

          {/* QUICK SPECS */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-navy/10 pt-5 sm:grid-cols-4">
            <SPEC label="가공 방식" value={coffee.process} />
            <SPEC label="로스팅" value={coffee.roastLevel} />
            <SPEC label="로스터" value={coffee.roaster} />
            <SPEC label="추천 디개싱" value={coffee.recommendedRest} />
          </div>

          {/* FLAVOR NOTES */}
          {coffee.notes.length > 0 && (
            <div className="mt-6 border-t border-navy/10 pt-5">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">FLAVOR NOTES</p>
              <FlavorNotes notes={coffee.notes} className="mt-2 block text-[17px] font-semibold" />
            </div>
          )}

          {/* SENSORY MAP */}
          <div className="mt-6 border-t border-navy/10 pt-5">
            <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">SENSORY MAP</p>
            <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
              <RadarChart
                sensory={coffee.sensory}
                size={200}
                accentColor={characterAccent}
                accentSoft={CHARACTER_STYLE[coffee.character].accentSoft}
              />
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1">
                {SENSORY_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold text-navy/55">
                      {field.labelKo} <span className="text-navy/30">{field.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <DotScale value={coffee.sensory[field.key]} />
                      <span className="w-3 text-right text-[12px] font-bold text-navy">
                        {coffee.sensory[field.key]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROAST */}
          <div className="mt-6 border-t border-navy/10 pt-5">
            <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">ROAST DIRECTION</p>
            <div className="mt-3">
              <RoastDirection roastLevel={coffee.roastLevel} />
            </div>
            {hasAdvanced && (
              <details className="mt-3">
                <summary className="cursor-pointer text-[11px] font-semibold text-navy/50 hover:text-navy">
                  상세 로스팅 데이터 · Advanced Roast Data
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <SPEC label="배치 · BATCH" value={coffee.roastData?.batch} />
                  <SPEC label="투입 온도 · CHARGE TEMP" value={coffee.roastData?.chargeTemp} />
                  <SPEC label="터닝포인트" value={coffee.roastData?.turningPoint} />
                  <SPEC label="옐로우 포인트" value={coffee.roastData?.yellow} />
                  <SPEC label="1차 크랙 · FIRST CRACK" value={coffee.roastData?.firstCrack} />
                  <SPEC label="배출 · DROP" value={coffee.roastData?.drop} />
                  <SPEC label="총 시간 · TOTAL TIME" value={coffee.roastData?.totalTime} />
                  <SPEC label="개발 시간 · DEV. TIME" value={coffee.roastData?.developmentTime} />
                  <SPEC label="개발 비율 · DEV. RATIO" value={coffee.roastData?.developmentRatio} />
                  <SPEC label="배출 온도 · DROP TEMP" value={coffee.roastData?.dropTemp} />
                  <SPEC label="로스터기 · MACHINE" value={coffee.roastData?.machine} />
                </div>
              </details>
            )}
          </div>

          {/* COMMENTS */}
          {(coffee.roasterComment || coffee.baristaComment) && (
            <div className="mt-6 space-y-4 border-t border-navy/10 pt-5">
              {coffee.roasterComment && (
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">
                    로스터의 생각 · ROASTER&apos;S COMMENT
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-navy/75">“{coffee.roasterComment}”</p>
                </div>
              )}
              {coffee.baristaComment && (
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">
                    바리스타의 생각 · BARISTA&apos;S COMMENT
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-navy/75">“{coffee.baristaComment}”</p>
                </div>
              )}
            </div>
          )}

          {/* RECIPE */}
          {guide && (
            <div className="mt-6 border-t border-navy/10 pt-5">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-navy/40">
                이 커피를 위한 추천 레시피 · {guide.equipment}
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <SPEC label="원두" value={guide.coffeeDose} />
                <SPEC label="물" value={guide.water} />
                <SPEC label="온도" value={guide.temperature} />
                <SPEC label="분쇄도" value={guide.grind} />
              </div>
              {guide.pourSteps.length > 0 && (
                <div className="mt-3 space-y-1">
                  {guide.pourSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] text-navy/65">
                      <span className="w-9 text-navy/40">{step.time}</span>
                      <span className="flex-1">{step.label}</span>
                      <span>{step.water}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QR */}
          <div className="mt-8 flex flex-col items-center border-t border-navy/10 pt-6">
            <QRCodeBlock url={shareUrl} filenameBase={`${slugBase}-chart`} size={100} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={`/coffees/${coffee.slug}`}
            className="border border-navy px-4 py-2.5 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
          >
            원두 이야기 자세히 보기
          </Link>
        </div>

        <div className="mt-8 border-t border-navy/15 pt-5">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-navy/40">
            원두 차트 이미지 만들기
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SOCIAL_SIZE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                disabled={busy !== null}
                onClick={() => handleExport(preset.key)}
                className="border border-navy/25 px-3 py-2 text-[11px] font-semibold text-navy hover:border-navy disabled:opacity-40"
              >
                {busy === preset.key ? '저장 중...' : preset.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
