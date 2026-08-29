import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PublicFooter from '../../components/PublicFooter'
import PublicHeader from '../../components/PublicHeader'
import SEO from '../../components/SEO'
import StoryBody from '../../components/StoryBody'
import WholesaleOrderForm from '../../components/WholesaleOrderForm'
import { BUSINESS_POST_CATEGORY_LABEL } from '../../constants/businessPostCategories'
import { getBusinessPostBySlug } from '../../data/repositories/businessPostRepository'

export default function BusinessPostDetailPage() {
  const { slug = '' } = useParams()
  const post = useMemo(() => getBusinessPostBySlug(slug), [slug])

  if (!post) return <Navigate to="/business" replace />

  return (
    <div className="flex min-h-screen flex-col bg-warm-white">
      <SEO title={post.seoTitle || post.title} description={post.seoDescription || post.excerpt} image={post.coverImage} />
      <PublicHeader />

      {post.coverImage && (
        <div
          className="aspect-[21/9] w-full bg-navy/5 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverImage})` }}
          role="img"
          aria-label={post.title}
        />
      )}

      <main className="w-full min-w-0 lg:flex-1 mx-auto max-w-[720px] px-6 py-10">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">{BUSINESS_POST_CATEGORY_LABEL[post.category]}</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight whitespace-pre-line text-navy">{post.title}</h1>
        <p className="mt-2 text-[11px] text-navy/40">{new Date(post.publishedDate).toLocaleDateString('ko-KR')}</p>

        <div className="mt-8 border-t border-navy/15 pt-8">
          <StoryBody body={post.body} />
        </div>

        {post.relatedLinks.length > 0 && (
          <div className="mt-8 flex flex-col gap-2 border-t border-navy/15 pt-6">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">문의하기</p>
            {post.relatedLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
                className="inline-block w-fit border border-navy px-4 py-2 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}

        {post.category === 'WHOLESALE' && (
          <section className="mt-10 border-t border-navy/15 pt-8">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">ORDER</p>
            <h2 className="mt-1 text-[20px] font-bold text-navy">원두 납품 신청</h2>
            <p className="mt-2 text-[12px] text-navy/55">아래 정보를 남겨주시면 확인 후 순차적으로 안내드리겠습니다.</p>
            <div className="mt-5">
              <WholesaleOrderForm />
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
