import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { getFlavorDescriptors, getFlavorFamilies } from '../../data/repositories/flavorRepository'
import { EMPTY_ANSWERS, matchCoffees, type TasteFinderAnswers } from '../../data/tasteFinder'
import type { CupCharacter, SensoryScore } from '../../types'

const FEELING_OPTIONS: { label: string; value: CupCharacter }[] = [
  { label: '상큼하고 깔끔하게', value: 'CLEAR' },
  { label: '과일처럼 풍부하게', value: 'JUICY' },
  { label: '향긋하고 화사하게', value: 'ELEGANT' },
  { label: '고소하고 편안하게', value: 'CALM' },
  { label: '개성 있고 강렬하게', value: 'VIVID' },
]

const ACIDITY_OPTIONS: { label: string; value: SensoryScore | null }[] = [
  { label: '거의 없는 편', value: 1 },
  { label: '적당한 편', value: 3 },
  { label: '선명한 편', value: 5 },
  { label: '상관없음', value: null },
]

const BODY_OPTIONS: { label: string; value: SensoryScore }[] = [
  { label: '차처럼 가볍게', value: 2 },
  { label: '균형 있게', value: 3 },
  { label: '묵직하게', value: 4 },
]

const NOVELTY_OPTIONS: { label: string; value: SensoryScore }[] = [
  { label: '익숙한 커피가 좋아요', value: 5 },
  { label: '조금 새로운 것도 좋아요', value: 3 },
  { label: '독특할수록 좋아요', value: 1 },
]

const TOTAL_STEPS = 5

export default function TasteFinderPage() {
  const coffees = useMemo(() => getPublishedCoffees(), [])
  const descriptors = useMemo(() => getFlavorDescriptors(), [])
  const families = useMemo(() => getFlavorFamilies(), [])

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<TasteFinderAnswers>(EMPTY_ANSWERS)
  const [showResults, setShowResults] = useState(false)

  const results = useMemo(
    () => (showResults ? matchCoffees(answers, coffees, descriptors, 3) : []),
    [showResults, answers, coffees, descriptors],
  )

  const next = () => (step < TOTAL_STEPS - 1 ? setStep((s) => s + 1) : setShowResults(true))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const restart = () => {
    setAnswers(EMPTY_ANSWERS)
    setStep(0)
    setShowResults(false)
  }

  const toggleFamily = (id: string) => {
    setAnswers((prev) => ({
      ...prev,
      flavorFamilyIds: prev.flavorFamilyIds.includes(id)
        ? prev.flavorFamilyIds.filter((f) => f !== id)
        : [...prev.flavorFamilyIds, id],
    }))
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="Find Your Coffee" description="몇 가지 질문으로 나에게 맞는 커피를 찾아보세요." />
      <PublicHeader />

      <main className="mx-auto max-w-[640px] px-6 py-14">
        {!showResults ? (
          <>
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">FIND YOUR COFFEE</p>
            <h1 className="mt-1 text-center font-serif text-[26px] font-bold text-navy">좋아하는 맛에서 시작해보세요.</h1>
            <p className="mt-6 text-center text-[11px] font-semibold text-navy/40">
              {step + 1} / {TOTAL_STEPS}
            </p>

            <div className="mt-4 border border-navy/15 bg-white p-8">
              {step === 0 && (
                <QuestionBlock title="어떤 느낌의 커피가 좋나요?">
                  {FEELING_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={answers.feeling === opt.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, feeling: opt.value }))}
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </QuestionBlock>
              )}
              {step === 1 && (
                <QuestionBlock title="산미는?">
                  {ACIDITY_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.label}
                      selected={answers.acidityTarget === opt.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, acidityTarget: opt.value }))}
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </QuestionBlock>
              )}
              {step === 2 && (
                <QuestionBlock title="질감은?">
                  {BODY_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.label}
                      selected={answers.bodyTarget === opt.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, bodyTarget: opt.value }))}
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </QuestionBlock>
              )}
              {step === 3 && (
                <QuestionBlock title="좋아하는 향은? (복수 선택 가능)">
                  {families
                    .filter((f) => f.id !== 'family-other')
                    .map((family) => (
                      <OptionButton
                        key={family.id}
                        selected={answers.flavorFamilyIds.includes(family.id)}
                        onClick={() => toggleFamily(family.id)}
                      >
                        {family.nameKo ?? family.name}
                      </OptionButton>
                    ))}
                </QuestionBlock>
              )}
              {step === 4 && (
                <QuestionBlock title="새로운 향미에 대한 선호는?">
                  {NOVELTY_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.label}
                      selected={answers.noveltyTarget === opt.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, noveltyTarget: opt.value }))}
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </QuestionBlock>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="text-[12px] font-semibold text-navy/45 hover:text-navy disabled:opacity-0"
              >
                ← 이전
              </button>
              <button
                type="button"
                onClick={next}
                className="border border-navy bg-navy px-6 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light"
              >
                {step === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">YOUR COFFEE</p>
            <h1 className="mt-1 text-center font-serif text-[26px] font-bold text-navy">추천 커피</h1>
            <p className="mx-auto mt-2 max-w-[420px] text-center text-[11px] text-navy/45">
              Match %는 과학적 정확도가 아니라 KOI 프로파일을 기준으로 계산한 취향 유사도입니다.
            </p>

            {results.length === 0 ? (
              <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
                추천할 수 있는 원두가 아직 없습니다.
              </p>
            ) : (
              <div className="mt-10 space-y-6">
                {results.map((match, i) => (
                  <div key={match.coffee.id} className="border border-navy/15 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold tracking-[0.15em] text-accent">
                        {i === 0 ? '1위 추천' : `${i + 1}위`}
                      </p>
                      <p className="font-serif text-[20px] font-bold text-navy">{match.score}%</p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                      <div>
                        <Link to={`/coffees/${match.coffee.slug}`} className="font-serif text-[17px] font-bold text-navy hover:underline">
                          {match.coffee.coffeeName}
                        </Link>
                        <p className="mt-1 text-[12px] text-navy/55">{match.coffee.notes.join(' · ')}</p>
                        <ul className="mt-2 space-y-1">
                          {match.reasons.map((r) => (
                            <li key={r} className="text-[12px] text-navy/60">
                              · {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <CoffeeCard coffee={match.coffee} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <button type="button" onClick={restart} className="text-[12px] font-semibold text-navy/50 hover:text-navy">
                다시 하기
              </button>
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

function QuestionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-[18px] font-bold text-navy">{title}</h2>
      <div className="mt-5 flex flex-col gap-2">{children}</div>
    </div>
  )
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-3 text-left text-[13px] font-medium transition-colors ${
        selected ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy hover:border-navy/50'
      }`}
    >
      {children}
    </button>
  )
}
