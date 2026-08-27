import { useState } from 'react'
import { Link } from 'react-router-dom'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { BUSINESS_POST_CATEGORIES, BUSINESS_POST_CATEGORY_LABEL } from '../../constants/businessPostCategories'
import { getPublishedBusinessPosts } from '../../data/repositories/businessPostRepository'
import type { BusinessPostCategory } from '../../data/schema'

export default function BusinessPage() {
  const posts = getPublishedBusinessPosts()
  const [category, setCategory] = useState<'ALL' | BusinessPostCategory>('ALL')

  const filtered = posts.filter((p) => category === 'ALL' || p.category === category)

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title="납품 · 교육" description="코이노니아의 원두 납품과 교육 소식을 안내합니다." />
      <PublicHeader />

      <main className="w-full min-w-0 flex-1 mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BUSINESS</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">납품 · 교육</h1>
        <p className="mt-2 max-w-[560px] text-[13px] text-navy/60">코이노니아의 원두 납품과 교육 소식을 안내합니다.</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {(['ALL', ...BUSINESS_POST_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                category === c ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
              }`}
            >
              {c === 'ALL' ? '전체' : BUSINESS_POST_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            해당 카테고리의 게시물이 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {filtered.map((post) => (
              <Link key={post.id} to={`/business/${post.slug}`} className="group block">
                {post.coverImage ? (
                  <div className="aspect-[3/2] w-full overflow-hidden">
                    <div
                      className="h-full w-full bg-navy/5 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                      role="img"
                      aria-label={post.title}
                    />
                  </div>
                ) : (
                  <div className="koi-night-sky relative flex aspect-[3/2] w-full items-end overflow-hidden p-4">
                    <KOIStarField />
                    <p className="relative text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">KOINONIA</p>
                  </div>
                )}
                <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] text-navy/45">
                  {post.isSystemPinned && <span className="text-accent">PIN ·</span>}
                  {BUSINESS_POST_CATEGORY_LABEL[post.category]}
                </p>
                <p className="mt-1 font-serif text-[18px] font-bold text-navy">{post.title}</p>
                <p className="mt-2 text-[12px] text-navy/55">{post.excerpt}</p>
                <p className="mt-3 text-[10px] text-navy/35">{new Date(post.publishedDate).toLocaleDateString('ko-KR')}</p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
