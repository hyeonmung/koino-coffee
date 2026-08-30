import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { STORY_CATEGORY_LABEL } from '../../constants/storyCategories'
import { deleteStory, getAllStories } from '../../data/repositories/storyRepository'
import type { Story } from '../../data/schema'

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>(() => getAllStories())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const remove = async (id: string) => {
    await deleteStory(id)
    setConfirmingId(null)
    setStories(getAllStories())
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.25em] text-accent font-kicker">STORIES</p>
          <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">이야기 관리</h1>
        </div>
        <Link to="/admin/stories/new" className="border border-navy bg-navy px-4 py-2.5 text-[12px] font-semibold text-warm-white hover:bg-navy-light">
          + 새 스토리
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {stories.map((story) => (
          <div key={story.id} className="flex items-center justify-between border border-navy/15 bg-white px-4 py-3">
            <div>
              <p className="text-[13px] font-semibold text-navy">{story.title}</p>
              <p className="text-[11px] text-navy/45">
                {STORY_CATEGORY_LABEL[story.category]} · {story.publishStatus === 'published' ? '공개' : '비공개'}
              </p>
            </div>
            <div className="flex gap-1.5">
              <Link to={`/admin/stories/${story.id}`} className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-navy hover:text-navy">
                수정
              </Link>
              {confirmingId === story.id ? (
                <button type="button" onClick={() => remove(story.id)} className="border border-red-400 bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">
                  정말 삭제
                </button>
              ) : (
                <button type="button" onClick={() => setConfirmingId(story.id)} className="border border-navy/20 px-2.5 py-1.5 text-[11px] text-navy/60 hover:border-red-400 hover:text-red-500">
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
        {stories.length === 0 && <p className="border border-navy/15 bg-white px-4 py-10 text-center text-[13px] text-navy/40">등록된 스토리가 없습니다.</p>}
      </div>
    </AdminLayout>
  )
}
