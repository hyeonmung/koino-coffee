interface DotScaleProps {
  value: number
  max?: number
}

export default function DotScale({ value, max = 5 }: DotScaleProps) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${value} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-[7px] w-[7px] rounded-full ${i < value ? 'bg-navy' : 'bg-navy/15'}`}
        />
      ))}
    </span>
  )
}
