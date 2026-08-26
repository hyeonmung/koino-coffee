import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CoffeeGalleryCard from '../components/CoffeeGalleryCard'
import GalleryHeader from '../components/GalleryHeader'
import type { CoffeeProfile } from '../types'
import { groupCoffeesByCountry, slugToCountryKey } from '../utils/countryGrouping'
import { loadCoffees } from '../utils/storage'

export default function GalleryCountryPage() {
  const { countrySlug = '' } = useParams()
  const [coffees, setCoffees] = useState<CoffeeProfile[]>([])

  useEffect(() => {
    setCoffees(loadCoffees().filter((c) => !c.isSample))
  }, [])

  const groups = groupCoffeesByCountry(coffees)
  const key = slugToCountryKey(countrySlug)
  const group = groups.find((g) => g.key === key)

  if (!group) {
    return (
      <div className="min-h-screen bg-warm-white pb-16">
        <GalleryHeader backTo="/" />
        <main className="mx-auto max-w-[1240px] px-6 pt-16 text-center">
          <p className="text-[13px] text-navy/50">해당 산지 카테고리를 찾을 수 없습니다.</p>
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

  return (
    <div className="min-h-screen bg-warm-white pb-16">
      <GalleryHeader backTo="/" />

      <main className="mx-auto max-w-[1240px] px-6 pt-10">
        <div className="flex items-center gap-3">
          <span className="text-[36px] leading-none">{group.flag}</span>
          <div>
            <h1 className="font-serif text-[24px] font-bold leading-tight text-navy">
              {group.labelKo ?? group.labelEn}
            </h1>
            <p className="text-[12px] tracking-wide text-navy/45">
              {group.labelEn} · {group.coffees.length}종의 원두
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.coffees.map((coffee) => (
            <CoffeeGalleryCard key={coffee.id} coffee={coffee} to={`/gallery/${group.slug}/${coffee.id}`} />
          ))}
        </div>
      </main>
    </div>
  )
}
