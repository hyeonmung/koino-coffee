import type { Coffee } from '../data/schema'

function won(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

interface CoffeePriceProps {
  coffee: Coffee
  className?: string
  /** 'sm' (default) fits the compact grid card; 'lg' is for the standalone detail page. */
  size?: 'sm' | 'lg'
}

const SIZE_CLASSES = {
  sm: { meta: 'text-[14px]', price: 'text-[22px]' },
  lg: { meta: 'text-[28px]', price: 'text-[44px]' },
}

/** "200g  20,000원(취소선)  18,000원" — shows the discount only when salePrice is set and actually lower. */
export default function CoffeePrice({ coffee, className = '', size = 'sm' }: CoffeePriceProps) {
  const { weightGrams, price, salePrice, roastDate } = coffee
  if (!price) return null

  const onSale = typeof salePrice === 'number' && salePrice > 0 && salePrice < price
  const { meta, price: priceClass } = SIZE_CLASSES[size]

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        {weightGrams && <span className={`${meta} text-ink/45`}>{weightGrams}g</span>}
        {onSale && <span className={`${meta} text-ink/35 line-through`}>{won(price)}</span>}
        <span className={`${priceClass} font-bold text-ink`}>{won(onSale ? (salePrice as number) : price)}</span>
      </div>
      {roastDate && <p className="mt-0.5 text-[10px] text-ink/35">제조일 {roastDate}</p>}
    </div>
  )
}
