import type { Coffee } from '../data/schema'

function won(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

interface CoffeePriceProps {
  coffee: Coffee
  className?: string
}

/** "200g  20,000원(취소선)  18,000원" — shows the discount only when salePrice is set and actually lower. */
export default function CoffeePrice({ coffee, className = '' }: CoffeePriceProps) {
  const { weightGrams, price, salePrice, roastDate } = coffee
  if (!price) return null

  const onSale = typeof salePrice === 'number' && salePrice > 0 && salePrice < price

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        {weightGrams && <span className="text-[12px] text-ink/45">{weightGrams}g</span>}
        {onSale && <span className="text-[12px] text-ink/35 line-through">{won(price)}</span>}
        <span className="text-[14px] font-bold text-ink">{won(onSale ? (salePrice as number) : price)}</span>
      </div>
      {roastDate && <p className="mt-0.5 text-[10px] text-ink/35">제조일 {roastDate}</p>}
    </div>
  )
}
