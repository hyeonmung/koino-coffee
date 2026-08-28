import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import StoryBody from '../../components/StoryBody'
import { STORY_CATEGORY_LABEL } from '../../constants/storyCategories'
import { getStoryBySlug } from '../../data/repositories/storyRepository'

export default function StoryDetailPage() {
  const { slug = '' } = useParams()
  const story = useMemo(() => getStoryBySlug(slug), [slug])

  if (!story) return <Navigate to="/stories" replace />

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={story.seoTitle || story.title} description={story.seoDescription || story.excerpt} image={story.coverImage} />
      <PublicHeader />

      {story.coverImage && (
        <div
          className="aspect-[21/9] w-full bg-navy/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${story.coverImage})` }}
          role="img"
          aria-label={story.title}
        />
      )}

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">{STORY_CATEGORY_LABEL[story.category]}</p>
        <h1 className="mt-1 font-serif text-[28px] font-bold leading-tight text-navy">{story.title}</h1>
        <p className="mt-2 text-[11px] text-navy/40">{new Date(story.publishedDate).toLocaleDateString('ko-KR')}</p>

        <div className="mt-8 border-t border-navy/15 pt-8">
          <StoryBody body={story.body} />
        </div>

        {story.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-1.5">
            {story.tags.map((tag) => (
              <span key={tag} className="border border-navy/15 px-2 py-1 text-[10px] text-navy/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
