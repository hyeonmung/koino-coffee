import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CoffeeCard from '../../components/CoffeeCard'
import FlavorNotes from '../../components/FlavorNotes'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { getPublishedCoffees } from '../../data/repositories/coffeeRepository'
import { addVector, emptyVector, matchCoffeesFromVector, pickQuestionSet } from '../../data/tasteFinder'
import { TOPIC_LABEL, type PreferenceVector, type TasteFinderQuestion } from '../../data/tasteFinderQuestions'

const TOTAL_STEPS = 5

export default function TasteFinderPage() {
  // Only Published, currently-recommendable coffees — Archive/Draft never appear as a match.
  const coffees = useMemo(() => getPublishedCoffees().filter((c) => c.availability !== 'archive'), [])

  const [questions, setQuestions] = useState<TasteFinderQuestion[]>(() => pickQuestionSet())
  const [step, setStep] = useState(0)
  const [answerVectors, setAnswerVectors] = useState<(PreferenceVector | null)[]>(() => questions.map(() => null))
  const [showResults, setShowResults] = useState(false)

  const results = useMemo(() => {
    if (!showResults) return []
    const total = answerVectors.reduce<PreferenceVector>((acc, v) => (v ? addVector(acc, v) : acc), emptyVector())
    return matchCoffeesFromVector(total, coffees, 3)
  }, [showResults, answerVectors, coffees])

  const current = questions[step]
  const canAdvance = answerVectors[step] !== null

  const selectAnswer = (vector: PreferenceVector) => {
    setAnswerVectors((prev) => prev.map((v, i) => (i === step ? vector : v)))
  }

  const next = () => (step < TOTAL_STEPS - 1 ? setStep((s) => s + 1) : setShowResults(true))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const restart = () => {
    const nextQuestions = pickQuestionSet()
    setQuestions(nextQuestions)
    setAnswerVectors(nextQuestions.map(() => null))
    setStep(0)
    setShowResults(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="취향 찾기" description="몇 가지 질문으로 나에게 맞는 커피를 찾아보세요." />
      <PublicHeader />

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[640px] px-6 py-14">
        {!showResults ? (
          <>
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">FIND YOUR COFFEE</p>
            <h1 className="mt-1 text-center text-[26px] font-bold text-navy">좋아하는 맛에서 시작해보세요.</h1>
            <p className="mt-6 text-center text-[11px] font-semibold text-navy/40">
              {step + 1} / {TOTAL_STEPS} · {TOPIC_LABEL[current.topic]}
            </p>

            <div className="mt-4 border border-navy/15 bg-white p-8">
              <QuestionBlock title={current.question} helperText={current.helperText}>
                {current.options.map((opt) => (
                  <OptionButton
                    key={opt.label}
                    selected={answerVectors[step] === opt.vector}
                    onClick={() => selectAnswer(opt.vector)}
                  >
                    {opt.label}
                  </OptionButton>
                ))}
              </QuestionBlock>
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
                disabled={!canAdvance}
                className="border border-navy bg-navy px-6 py-2.5 text-[12px] font-semibold tracking-wide text-warm-white hover:bg-navy-light disabled:opacity-30"
              >
                {step === TOTAL_STEPS - 1 ? '결과 보기' : '다음'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-[10px] font-semibold tracking-[0.25em] text-accent">YOUR COFFEE</p>
            <h1 className="mt-1 text-center text-[26px] font-bold text-navy">추천 커피</h1>
            <p className="mx-auto mt-2 max-w-[420px] text-center text-[11px] text-navy/45">
              Match %는 과학적 정확도가 아니라 KOINO 프로파일을 기준으로 계산한 취향 유사도입니다.
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
                      <p className="text-[20px] font-bold text-navy">{match.score}%</p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                      <div>
                        <Link to={`/coffees/${match.coffee.slug}`} className="font-serif text-[17px] font-bold text-navy hover:underline">
                          {match.coffee.coffeeName}
                        </Link>
                        <FlavorNotes notes={match.coffee.notes} className="mt-1 block text-[12px] text-navy/55" />
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

function QuestionBlock({ title, helperText, children }: { title: string; helperText?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[18px] font-bold leading-snug text-navy">{title}</h2>
      {helperText && <p className="mt-2 text-[12px] leading-relaxed text-navy/50">{helperText}</p>}
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
