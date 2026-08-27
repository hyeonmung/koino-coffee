import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { BUSINESS_POST_CATEGORY_LABEL } from '../../constants/businessPostCategories'
import { deleteBusinessPost, getAllBusinessPosts } from '../../data/repositories/businessPostRepository'
import type { BusinessPost } from '../../data/schema'

export default function AdminBusinessPostsPage() {
  const [posts, setPosts] = useState<BusinessPost[]>(() => getAllBusinessPosts())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)

  const remove = (post: BusinessPost) => {
    const ok = deleteBusinessPost(post.id)
    if (!ok) {
      setBlockedMessage(`"${post.title}"은(는) 항상 첫 번째로 고정되는 시스템 게시물이라 삭제할 수 없습니다. 내용은 수정할 수 있습니다.`)
      setConfirmingId(null)
      return
    }
    setConfirmingId(null)
    setPosts(getAllBusinessPosts())
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">BUSINESS</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">납품 · 교육 게시물 관리</h1>
          <p className="mt-2 max-w-[560px] text-[12px] text-navy/50">
            "원두 납품 문의" 게시물은 항상 목록 최상단에 고정되며 삭제할 수 없습니다 — 내용은 자유롭게 수정하세요.
          </p>
        </div>
        <Link
          to="/admin/business/new"
          className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light"
        >
          + 새 게시물
        </Link>
      </div>

      {blockedMessage && (
        <p className="mt-4 border border-red-300 bg-red-50 px-3 py-2 text-[12px] text-red-600">{blockedMessage}</p>
      )}

      <div className="mt-6 space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between border border-navy/15 bg-white px-4 py-3">
            <div>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-navy">
                {post.isSystemPinned && <span className="text-[10px] font-bold text-accent">PIN</span>}
                {post.title}
              </p>
              <p className="text-[11px] text-navy/45">
                {BUSINESS_POST_CATEGORY_LABEL[post.category]} · {post.publishStatus === 'published' ? '공개' : '초안'}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Link
                to={`/admin/business/${post.id}`}
                className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy"
              >
                수정
              </Link>
              {post.isSystemPinned ? (
                <span className="border border-navy/10 px-2.5 py-1.5 text-[11px] text-navy/25">삭제 불가</span>
              ) : confirmingId === post.id ? (
                <button
                  type="button"
                  onClick={() => remove(post)}
                  className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
                >
                  정말 삭제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingId(post.id)}
                  className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">등록된 게시물이 없습니다.</p>
        )}
      </div>
    </AdminLayout>
  )
}
