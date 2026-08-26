import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CoffeePreview from '../components/CoffeePreview'
import GalleryHeader from '../components/GalleryHeader'
import type { CoffeeProfile } from '../types'
import { slugifyFilename } from '../utils/download'
import { exportNodeAsPng } from '../utils/pngExport'
import { loadCoffees } from '../utils/storage'

export default function GalleryDetailPage() {
  const { countrySlug = '', id = '' } = useParams()
  const [coffees, setCoffees] = useState<CoffeeProfile[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCoffees(loadCoffees())
  }, [])

  const coffee = coffees.find((c) => c.id === id)
  const slug = useMemo(() => slugifyFilename(coffee?.coffeeName ?? 'coffee'), [coffee?.coffeeName])

  if (coffees.length > 0 && !coffee) {
    return (
      <div className="min-h-screen bg-warm-white pb-16">
        <GalleryHeader backTo={`/gallery/${countrySlug}`} />
        <main className="mx-auto max-w-[1240px] px-6 pt-16 text-center">
          <p className="text-[13px] text-navy/50">해당 원두를 찾을 수 없습니다.</p>
          <Link
            to="/"
            className="mt-4 inline-block border border-navy px-4 py-2 text-[12px] font-semibold tracking-wide text-navy hover:bg-navy hover:text-warm-white"
          >
            전체 산지로 이동
          </Link>
        </main>
      </div>
    )
  }

  if (!coffee) return null

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white pb-16">
      <GalleryHeader backTo={`/gallery/${countrySlug}`} backLabel="산지로 돌아가기" />

      <main className="mx-auto max-w-[560px] px-6 pt-10">
        <CoffeePreview coffee={coffee} ref={cardRef} chartRef={chartRef} />

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('chart', () => exportNodeAsPng(chartRef.current, `${slug}-radar.png`, true))}
            className="border border-navy/25 px-2.5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy hover:bg-navy hover:text-warm-white disabled:opacity-40"
          >
            {busy === 'chart' ? '저장 중...' : '레이더 차트 PNG'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('card', () => exportNodeAsPng(cardRef.current, `${slug}-profile.png`, false))}
            className="border border-navy/25 px-2.5 py-2.5 text-[12px] font-semibold tracking-wide text-navy hover:border-navy hover:bg-navy hover:text-warm-white disabled:opacity-40"
          >
            {busy === 'card' ? '저장 중...' : '카드 전체 PNG'}
          </button>
        </div>
      </main>
    </div>
  )
}
