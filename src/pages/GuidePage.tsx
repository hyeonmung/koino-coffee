import { CHARACTER_INFO } from '../constants/characters'
import { CUP_CHARACTERS } from '../types'
import { SENSORY_FIELDS } from '../constants/sensory'
import GalleryHeader from '../components/GalleryHeader'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-warm-white pb-16">
      <GalleryHeader backTo="/" />

      <main className="mx-auto max-w-[860px] px-6 pt-10">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-accent">HOW TO READ</p>
        <h1 className="mt-2 font-serif text-[26px] font-bold leading-tight text-navy">
          원두 프로파일 읽는 법
        </h1>
        <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-navy/60">
          코이노커피는 원두마다 CUP CHARACTER와 6가지 관능(Sensory) 점수를 매겨 육각형 레이더 차트로
          표시합니다. 아래 기준을 참고하면 카드에 적힌 점수와 그래프의 의미를 더 정확히 이해할 수
          있습니다.
        </p>

        <section className="mt-12">
          <h2 className="font-serif text-[18px] font-bold text-navy">CUP CHARACTER</h2>
          <p className="mt-1 text-[12px] text-navy/50">
            원두가 가진 인상을 5가지 성격으로 분류한 것입니다. 우열이 아니라 스타일의 차이입니다.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CUP_CHARACTERS.map((key) => {
              const info = CHARACTER_INFO[key]
              return (
                <div key={key} className="border border-navy/15 bg-white p-5">
                  <span className="border border-navy bg-navy px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-warm-white">
                    {info.label}
                  </span>
                  <p className="mt-3 text-[12px] font-semibold text-navy/80">{info.flavors}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-navy/55">{info.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[18px] font-bold text-navy">SENSORY PROFILE (1~5점)</h2>
          <p className="mt-1 text-[12px] text-navy/50">
            산미·단맛·바디·여운·플레이버·접근성 6가지 항목을 1점(약함)부터 5점(강함)까지 평가합니다.
          </p>
          <div className="mt-5 space-y-6">
            {SENSORY_FIELDS.map((field) => (
              <div key={field.key} className="border border-navy/15 bg-white p-5">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[13px] font-bold tracking-wide text-navy">{field.label}</h3>
                  <span className="text-[11px] text-navy/45">{field.labelKo}</span>
                </div>
                <ol className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {field.criteria.map((text, i) => (
                    <li key={i} className="flex gap-2 text-[12px] leading-snug text-navy/70">
                      <span className="shrink-0 font-serif font-bold text-navy">{i + 1}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-navy/45">
            ACCESSIBILITY(접근성) 점수는 품질을 뜻하지 않습니다. 낮은 점수는 개성이 뚜렷해 호불호가
            갈릴 수 있다는 의미이며, 높은 점수는 누구나 편하게 즐기기 좋다는 뜻입니다.
          </p>
        </section>
      </main>
    </div>
  )
}
