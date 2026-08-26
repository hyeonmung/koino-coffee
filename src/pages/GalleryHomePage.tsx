import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GalleryHeader from '../components/GalleryHeader'
import type { CoffeeProfile } from '../types'
import { groupCoffeesByCountry } from '../utils/countryGrouping'
import { loadCoffees } from '../utils/storage'

export default function GalleryHomePage() {
  const [coffees, setCoffees] = useState<CoffeeProfile[]>([])

  useEffect(() => {
    setCoffees(loadCoffees().filter((c) => !c.isSample))
  }, [])

  const groups = groupCoffeesByCountry(coffees)

  return (
    <div className="min-h-screen bg-warm-white pb-16">
      <GalleryHeader />

      <main className="mx-auto max-w-[1240px] px-6 pt-10">
        <div className="max-w-[640px]">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-accent">ORIGIN COLLECTION</p>
          <h1 className="mt-2 font-serif text-[28px] font-bold leading-tight text-navy">
            산지별 원두 컬렉션
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-navy/60">
            국가를 선택하면 코이노커피가 취급하는 원두의 관능 프로파일과 육각형 레이더 차트를 확인할 수
            있습니다.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="mt-12 border border-navy/15 bg-white px-6 py-16 text-center">
            <p className="text-[13px] text-navy/50">아직 등록된 원두가 없습니다.</p>
            <Link
              to="/admin"
              className="mt-4 inline-block border border-navy px-4 py-2 text-[12px] font-semibold tracking-wide text-navy hover:bg-navy hover:text-warm-white"
            >
              원두 등록하러 가기
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {groups.map((group) => (
              <Link
                key={group.key}
                to={`/gallery/${group.slug}`}
                className="group border border-navy/15 bg-white px-5 py-6 transition-colors hover:border-navy"
              >
                <span className="text-[28px] leading-none">{group.flag}</span>
                <p className="mt-3 font-serif text-[16px] font-bold leading-tight text-navy">
                  {group.labelKo ?? group.labelEn}
                </p>
                <p className="text-[11px] tracking-wide text-navy/45">{group.labelEn}</p>
                <p className="mt-3 text-[11px] font-semibold tracking-wide text-navy/50 group-hover:text-accent">
                  {group.coffees.length}종의 원두
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
