import { useState } from 'react'
import { Link } from 'react-router-dom'
import KOIStarField from '../../components/decorative/KOIStarField'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import { STORY_CATEGORY_LABEL } from '../../constants/storyCategories'
import { getPublishedStories } from '../../data/repositories/storyRepository'
import type { StoryCategory } from '../../data/schema'

const CATEGORIES: StoryCategory[] = ['ORIGIN', 'COFFEE', 'ROASTING', 'BREWING', 'SENSORY', 'KOI', 'EDUCATION']

export default function StoriesIndexPage() {
  const stories = getPublishedStories()
  const [category, setCategory] = useState<'ALL' | StoryCategory>('ALL')

  const filtered = stories.filter((s) => category === 'ALL' || s.category === category)

  return (
    <div className="min-h-screen bg-warm-white">
      <SEO title="이야기" description="산지, 원두, 커피 교육에 관한 코이노커피의 이야기." />
      <PublicHeader />

      <main className="mx-auto max-w-[1000px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">STORIES</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold text-navy">이야기</h1>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {(['ALL', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                category === c ? 'border-navy bg-navy text-warm-white' : 'border-navy/20 text-navy/55 hover:border-navy/50'
              }`}
            >
              {c === 'ALL' ? '전체' : STORY_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 border border-navy/15 bg-white px-6 py-16 text-center text-[13px] text-navy/45">
            해당 카테고리의 이야기가 없습니다.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {filtered.map((story) => (
              <Link key={story.id} to={`/stories/${story.slug}`} className="group block">
                {story.coverImage ? (
                  <div
                    className="aspect-[3/2] w-full overflow-hidden"
                  >
                    <div
                      className="h-full w-full bg-navy/5 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${story.coverImage})` }}
                      role="img"
                      aria-label={story.title}
                    />
                  </div>
                ) : (
                  <div className="koi-night-sky relative flex aspect-[3/2] w-full items-end overflow-hidden p-4">
                    <KOIStarField />
                    <p className="relative text-[9px] font-semibold tracking-[0.3em] text-warm-white/30">KOINO COFFEE</p>
                  </div>
                )}
                <p className="mt-3 text-[10px] font-semibold tracking-[0.15em] text-navy/45">{STORY_CATEGORY_LABEL[story.category]}</p>
                <p className="mt-1 font-serif text-[18px] font-bold text-navy">{story.title}</p>
                <p className="mt-2 text-[12px] text-navy/55">{story.excerpt}</p>
                <p className="mt-3 text-[10px] text-navy/35">
                  {new Date(story.publishedDate).toLocaleDateString('ko-KR')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
