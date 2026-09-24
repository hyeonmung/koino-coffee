import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import CornerStar from '../../components/brewGuide/CornerStar'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { archive } from './brewGuide/tokens'

const ROAST_PARAMS = [
  { roast: 'LIGHT', temp: '94–96°C', ratio: '1:15', note: '라이트 로스트는 조직이 단단하고 밀도가 높아, 충분히 뜨거운 물이 있어야 향과 산미를 끌어낼 수 있습니다.' },
  { roast: 'MEDIUM', temp: '92–94°C', ratio: '1:16', note: '가장 무난한 기본값입니다. 대부분의 원두에서 균형 잡힌 결과를 냅니다.' },
  { roast: 'DARK', temp: '88–92°C', ratio: '1:17', note: '온도가 너무 높으면 쓴맛이 과해지기 쉽습니다. 비율도 조금 더 여유 있게 잡습니다.' },
]

type ExtractionZone = 'OVER' | 'BALANCED' | 'UNDER'

const ZONE_STYLE: Record<ExtractionZone, { bg: string; label: string }> = {
  OVER: { bg: '#1f1a0a', label: '과다 추출 (쓴맛)' },
  BALANCED: { bg: '#0b1f3a', label: '균형' },
  UNDER: { bg: '#fecd08', label: '과소 추출 (신맛)' },
}

const TEMP_BANDS = ['94–96°C', '92–94°C', '90–92°C', '88–90°C']
const GRIND_STEPS = ['가늘게', '중간 가늘게', '중간', '중간 굵게', '굵게']

/** Qualitative only — temperature × grind both push extraction the same direction (finer/hotter =
 * more extracted), so the zone is derived from their combined rank. No fabricated numeric scores:
 * the source's 10–95 "intensity" grid was that site's own invented index, not a measured value. */
function extractionZone(tempIndex: number, grindIndex: number): ExtractionZone {
  const sum = tempIndex + grindIndex
  if (sum <= 2) return 'OVER'
  if (sum >= 5) return 'UNDER'
  return 'BALANCED'
}

const GRIND_GUIDE_GRINDERS = ['Comandante C40', 'Timemore Chestnut C3S', 'Mahlkönig EK43', '매버릭']

/** Click/dial settings sourced from a third-party comparison chart (@brewing.note), not measured
 * in-house — attributed below rather than presented as KOINONIA's own data. */
const GRIND_GUIDE_ROWS: [string, string, string, string][] = [
  ['8~12', '5~7', '1.0~2.5', '25~45'],
  ['13~18', '8~10', '3.0~5.5', '50~75'],
  ['19~23', '11~13', '6.0~8.0', '80~95'],
  ['24~27', '14~16', '8.5~10.0', '100~115'],
  ['28~31', '17~19', '10.5~12.0', '116~130'],
  ['32~38', '20~23', '12.5~15.0', '135~160'],
]

const EQUIPMENT = [
  { label: '드리퍼', body: 'V60은 물 빠짐이 빠르고 변수에 민감해서, 작은 차이도 맛으로 바로 드러납니다. 칼리타 웨이브는 평평한 바닥 덕분에 더 일관된 결과가 나와 처음 시작하기 좋습니다.' },
  { label: '종이 필터', body: '드리퍼 전용 필터를 쓰는 게 기본입니다. 추출 전에 뜨거운 물로 한 번 헹구면 종이 냄새가 줄고, 드리퍼도 함께 예열됩니다.' },
  { label: '저울', body: '0.1g 단위로 잴 수 있는 저울을 권합니다. 어제와 같은 맛을 다시 내려면, 어제와 같은 조건을 그대로 재현할 수 있어야 합니다.' },
  { label: '그라인더', body: '원두는 추출 직전에 갈아야 향이 살아 있습니다. 버 그라인더는 입자 크기가 고르기 때문에 추출도 고르게 됩니다.' },
  { label: '구즈넥 케틀', body: '가는 주둥이로 물줄기를 조절할 수 있어야 원하는 지점에 정확히 물을 부을 수 있습니다. 온도 조절 기능이 있으면 더 편합니다.' },
]

const BREW_STEPS = [
  { n: '01', label: '준비', body: '필터를 헹구고 드리퍼를 예열합니다. 저울을 영점 맞춘 뒤 분쇄한 원두를 담습니다.' },
  { n: '02', label: '뜸들이기', body: '원두 무게의 2배 정도 물을 부어 전체를 적시고 30–45초 기다립니다. 신선한 원두일수록 크게 부풀어 오릅니다.' },
  { n: '03', label: '1차 주수', body: '중앙에서 시작해 바깥쪽으로 나선형을 그리며 물을 붓습니다. 필터 가장자리에 직접 닿지 않도록 합니다.' },
  { n: '04', label: '추가 주수', body: '레시피에 따라 2–4회 더 나눠 붓습니다. 물이 빠지는 동안 커피 베드가 평평하게 유지되는지 살핍니다.' },
  { n: '05', label: '마무리', body: '마지막 물을 붓고 완전히 빠질 때까지 기다립니다. 총 추출 시간은 보통 2분 30초에서 4분 사이입니다.' },
]

const TECHNIQUES = [
  { label: '펄스 푸어', body: '물을 여러 번 나눠 붓는 방식입니다. 각 푸어 사이에 드로우다운 시간이 생기면서 추출이 천천히 진행되어, 단맛과 바디감을 세밀하게 조절할 수 있습니다.' },
  { label: '컨티뉴어스 푸어', body: '뜸들이기 후 목표 물량까지 한 번에 붓는 방식입니다. 펄스 푸어보다 단순해서, 처음 핸드드립을 시작할 때 익히기 좋습니다.' },
  { label: '스월', body: '드리퍼를 손으로 잡고 가볍게 돌려 커피 베드를 평평하게 만드는 동작입니다. 너무 세게 돌리면 미분이 가라앉아 오히려 막힐 수 있습니다.' },
  { label: '스티어', body: '스푼으로 가볍게 저어 뜸들이기 때 뭉친 부분을 풀어주거나, 추출을 더 균일하게 만들 때 사용합니다.' },
]

const DIAGNOSIS = [
  { symptom: '시고 밍밍하다', cause: '추출이 부족한 경우입니다.', fix: '물 온도를 조금 높이거나, 분쇄를 곱게 하거나, 추출 시간을 늘려보세요.' },
  { symptom: '쓰고 텁텁하다', cause: '추출이 과한 경우입니다.', fix: '물 온도를 낮추거나, 분쇄를 굵게 하거나, 추출 시간을 줄여보세요.' },
  { symptom: '물이 너무 천천히 빠진다', cause: '분쇄가 너무 곱거나 원두량이 많을 수 있습니다.', fix: '분쇄도를 한 단계 굵게 조절해보세요.' },
  { symptom: '맛이 매번 다르다', cause: '조건이 매번 조금씩 달라지고 있을 가능성이 큽니다.', fix: '원두·분쇄도·온도·비율을 모두 고정한 뒤, 한 번에 하나씩만 바꿔가며 원인을 좁혀보세요.' },
]

export default function BrewingKnowledgePage() {
  return (
    <div className={`flex min-h-screen flex-col ${archive.bgMain}`}>
      <SEO
        title="브루잉 가이드"
        description="도구 선택부터 물 온도·비율, 단계별 추출, 자주 하는 실수까지 — 코이노니아 로스터스가 정리한 핸드드립 기본기."
      />
      <PublicHeader />

      <main className="mx-auto w-full min-w-0 max-w-[760px] flex-1 px-6 py-14">
        <p className={`text-[10px] font-semibold tracking-[0.3em] ${archive.accentText}`}>BREWING KNOWLEDGE</p>
        <h1 className={`mt-3 text-[28px] font-semibold leading-snug ${archive.textPrimary} sm:text-[34px]`}>
          레시피는 시작점일 뿐,
          <br />맛을 만드는 건 변수를 이해하는 일입니다.
        </h1>
        <p className={`mt-4 max-w-[560px] text-[14px] leading-relaxed ${archive.textSecondary}`}>
          같은 원두인데 어제와 오늘 맛이 다르다면, 온도나 물줄기처럼 작은 무언가가 달랐던 겁니다. 이 페이지는 정답을 알려주기보다,
          핸드드립을 이루는 변수들이 각각 맛에 어떤 영향을 주는지 정리했습니다. 직접 내려보고, 기록하면서 자신만의 기준을 만들어가세요.
        </p>

        {/* PARAMETERS */}
        <section className="mt-14">
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>PARAMETERS</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>로스팅 단계별 물 온도와 비율</h2>
          <p className={`mt-2 text-[13px] leading-relaxed ${archive.textSecondary}`}>
            물 온도가 높을수록, 분쇄가 고울수록 추출은 빨라집니다. 아래는 로스팅 단계별 출발점이며, 정답이 아니라 취향에 맞게
            조절해가는 기준선입니다.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ROAST_PARAMS.map((r) => (
              <div key={r.roast} className="relative isolate border-t border-[rgba(255,255,255,0.12)] pt-4">
                <p className={`text-[11px] font-semibold tracking-[0.15em] ${archive.accentText}`}>{r.roast}</p>
                <p className={`mt-2 text-[20px] font-semibold tabular-nums ${archive.textPrimary}`}>{r.temp}</p>
                <p className={`mt-1 text-[13px] tabular-nums ${archive.blueText}`}>{r.ratio}</p>
                <p className={`mt-2 text-[12px] leading-relaxed ${archive.textMuted}`}>{r.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EXTRACTION INTENSITY */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>EXTRACTION INTENSITY</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>온도와 분쇄도의 관계</h2>
          <p className={`mt-2 text-[13px] leading-relaxed ${archive.textSecondary}`}>
            물이 뜨거울수록, 분쇄가 고울수록 커피와 물이 만나는 면적과 시간이 늘어 더 많이 추출됩니다. 정확한 수치보다는
            방향을 보는 도구입니다 — 지금 내 레시피가 과다 쪽인지 과소 쪽인지 가늠해보고, 반대 방향으로 한 칸만 옮겨보세요.
          </p>

          <div className="mt-6 overflow-x-auto">
            <div className="inline-grid min-w-full grid-cols-[auto_repeat(5,1fr)] gap-1">
              <div />
              {GRIND_STEPS.map((g) => (
                <p key={g} className={`px-1 pb-2 text-center text-[10px] font-medium ${archive.textMuted}`}>
                  {g}
                </p>
              ))}
              {TEMP_BANDS.map((temp, ti) => (
                <Fragment key={temp}>
                  <p className={`flex items-center pr-3 text-[11px] tabular-nums ${archive.textMuted}`}>{temp}</p>
                  {GRIND_STEPS.map((_, gi) => (
                    <div
                      key={`${ti}-${gi}`}
                      className="h-11 min-w-[64px] rounded-md"
                      style={{ backgroundColor: ZONE_STYLE[extractionZone(ti, gi)].bg }}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {(Object.keys(ZONE_STYLE) as ExtractionZone[]).map((zone) => (
              <div key={zone} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: ZONE_STYLE[zone].bg }} />
                <span className={`text-[11.5px] ${archive.textSecondary}`}>{ZONE_STYLE[zone].label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* GRIND SIZE GUIDE */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>GRIND SIZE GUIDE</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>분쇄도 통합 정리표</h2>
          <p className={`mt-2 text-[13px] leading-relaxed ${archive.textSecondary}`}>
            그라인더마다 클릭·다이얼 표기가 달라 같은 "가늘게"도 숫자가 다릅니다. 쓰던 그라인더의 설정값을 표에서 찾아,
            다른 그라인더로 바꿀 때 같은 굵기 대역을 그대로 옮겨보세요.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-center">
              <thead>
                <tr className={`border-b ${archive.border}`}>
                  {GRIND_GUIDE_GRINDERS.map((g) => (
                    <th key={g} className={`px-2 pb-3 text-[12px] font-semibold ${archive.textPrimary}`}>
                      {g}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${archive.divide}`}>
                {GRIND_GUIDE_ROWS.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-2 py-3 text-[14px] font-semibold tabular-nums ${archive.textPrimary}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`mt-3 text-[11px] ${archive.textMuted}`}>출처 · @brewing.note 인스타그램</p>
        </section>

        {/* EQUIPMENT */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>EQUIPMENT</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>필요한 도구</h2>
          <div className="mt-6 space-y-6">
            {EQUIPMENT.map((e, i) => (
              <div key={e.label} className="flex gap-4">
                <p className={`w-6 shrink-0 text-[12px] font-semibold tabular-nums ${archive.textMuted}`}>{String(i + 1).padStart(2, '0')}</p>
                <div>
                  <p className={`text-[14px] font-semibold ${archive.textPrimary}`}>{e.label}</p>
                  <p className={`mt-1 text-[13px] leading-relaxed ${archive.textSecondary}`}>{e.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BREW PROCESS */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>BREW PROCESS</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>추출 5단계</h2>
          <ol className={`mt-6 border-l ${archive.border}`}>
            {BREW_STEPS.map((s) => (
              <li key={s.n} className="relative pb-7 pl-6 last:pb-0">
                <span
                  className="absolute -left-[5px] top-1 h-[9px] w-[9px] rounded-full"
                  style={{ backgroundColor: archive.accent }}
                  aria-hidden
                />
                <p className={`text-[11px] font-semibold tracking-[0.1em] ${archive.textMuted}`}>{s.n}</p>
                <p className={`mt-0.5 text-[14px] font-semibold ${archive.textPrimary}`}>{s.label}</p>
                <p className={`mt-1 text-[13px] leading-relaxed ${archive.textSecondary}`}>{s.body}</p>
              </li>
            ))}
          </ol>
          <p className={`mt-6 text-[12px] ${archive.textMuted}`}>총 추출 시간은 보통 2:30 ~ 4:00 사이입니다.</p>
        </section>

        {/* TECHNIQUES */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>TECHNIQUES</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>추출 기법</h2>
          <p className={`mt-2 text-[13px] leading-relaxed ${archive.textSecondary}`}>
            아래 기법을 조합하면 같은 원두로도 다른 스타일의 맛을 만들 수 있습니다.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {TECHNIQUES.map((t) => (
              <div key={t.label} className={`rounded-2xl border ${archive.border} ${archive.bgCard} p-5`}>
                <p className={`text-[13.5px] font-semibold ${archive.textPrimary}`}>{t.label}</p>
                <p className={`mt-1.5 text-[12.5px] leading-relaxed ${archive.textSecondary}`}>{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DIAGNOSIS */}
        <section className={`mt-14 border-t ${archive.border} pt-10`}>
          <p className={`text-[10px] font-semibold tracking-[0.2em] ${archive.accentText}`}>DIAGNOSIS</p>
          <h2 className={`mt-1 text-[19px] font-semibold ${archive.textPrimary}`}>맛이 이상할 때</h2>
          <div className={`mt-6 divide-y ${archive.divide} border-t border-b ${archive.border}`}>
            {DIAGNOSIS.map((d) => (
              <div key={d.symptom} className="py-5">
                <p className={`text-[14px] font-semibold ${archive.textPrimary}`}>{d.symptom}</p>
                <p className={`mt-1 text-[12.5px] ${archive.textMuted}`}>{d.cause}</p>
                <p className={`mt-1.5 text-[13px] leading-relaxed ${archive.textSecondary}`}>{d.fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative isolate mt-14 p-8 text-center sm:p-12">
          <div className={`absolute inset-0 -z-10 border ${archive.accentBorder} ${archive.bgCard} ${archive.cornerNotch}`} />
          <CornerStar className="-left-3 -top-3" />
          <CornerStar className="-bottom-3 -right-3" />
          <p className={`text-[18px] font-semibold leading-snug ${archive.textPrimary} sm:text-[21px]`}>
            원리를 이해했다면,
            <br />이제 레시피로 직접 확인해보세요.
          </p>
          <Link to="/brew-guide" className={`mt-5 inline-block text-[12px] font-semibold ${archive.accentText}`}>
            브루잉 레시피 보러 가기 →
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
