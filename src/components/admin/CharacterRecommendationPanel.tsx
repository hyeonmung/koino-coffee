import { CHARACTER_STYLE } from '../../constants/characterStyle'
import type { CharacterRecommendation } from '../../data/characterRecommend'
import { CUP_CHARACTERS, type CupCharacter } from '../../types'

interface CharacterRecommendationPanelProps {
  recommendation: CharacterRecommendation | null
  current: CupCharacter
  onApply: (character: CupCharacter) => void
}

/**
 * Shows the system's Character suggestion (from Flavor Notes + a small Sensory tie-break) as
 * a starting point — never a forced decision. The admin always makes the final call via the
 * CharacterSelector rendered right below this panel.
 */
export default function CharacterRecommendationPanel({ recommendation, current, onApply }: CharacterRecommendationPanelProps) {
  if (!recommendation) {
    return (
      <div className="border border-navy/15 bg-white px-4 py-3 text-[12px] text-navy/45">
        Flavor Notes를 입력하면 시스템이 어울리는 Character를 추천합니다. (03 SENSORY 탭까지 입력하면 더 정확해집니다.)
      </div>
    )
  }

  const { character, scores, confidence, matched } = recommendation
  const ranked = [...CUP_CHARACTERS].sort((a, b) => scores[b] - scores[a])
  const reasonNotes = [...new Set(matched.filter((m) => (m.weights[character] ?? 0) > 0).map((m) => m.note))]
  const isApplied = current === character
  const maxScore = Math.max(1, scores[character])

  return (
    <div className="border border-navy/20 bg-white p-4">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">시스템 추천</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[20px] font-bold" style={{ color: CHARACTER_STYLE[character].accent }}>
          {character}
        </span>
        <span className="text-[11px] text-navy/40">추천 적합도 {confidence}%</span>
      </div>

      {reasonNotes.length > 0 && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-navy/60">
          <span className="font-semibold text-navy/80">{reasonNotes.join(', ')}</span>이(가) {character} Flavor Family와 높은
          관련성을 가집니다.
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        {ranked.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-semibold text-navy/50">{c}</span>
            <div className="h-1.5 flex-1 bg-navy/10">
              <div
                className="h-full"
                style={{ width: `${Math.min(100, (Math.max(0, scores[c]) / maxScore) * 100)}%`, backgroundColor: CHARACTER_STYLE[c].accent }}
              />
            </div>
            <span className="w-7 shrink-0 text-right text-[10px] text-navy/40">{Math.round(scores[c] * 10) / 10}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        {!isApplied ? (
          <button
            type="button"
            onClick={() => onApply(character)}
            className="border border-navy bg-navy px-3 py-1.5 text-[11px] font-semibold text-warm-white hover:bg-navy-light"
          >
            추천대로 적용 ({character})
          </button>
        ) : (
          <p className="text-[11px] font-semibold text-navy/50">현재 선택과 일치합니다.</p>
        )}
      </div>

      <p className="mt-3 border-t border-navy/10 pt-2 text-[10px] leading-relaxed text-navy/35">
        참고용 추천입니다 — 과학적으로 확정된 값이 아닙니다. 최종 Character는 아래에서 직접 선택하세요.
      </p>
    </div>
  )
}
