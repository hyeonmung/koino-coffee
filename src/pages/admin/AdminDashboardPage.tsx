import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllCoffees } from '../../data/repositories/coffeeRepository'
import { getAllStories } from '../../data/repositories/storyRepository'
import { getAllBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getAllInquiries } from '../../data/repositories/inquiryRepository'

export default function AdminDashboardPage() {
  const coffees = getAllCoffees()
  const published = coffees.filter((c) => c.publishStatus === 'published').length
  const draft = coffees.filter((c) => c.publishStatus === 'draft').length
  const archived = coffees.filter((c) => c.publishStatus === 'archived').length
  const stories = getAllStories()
  const brewGuides = getAllBrewGuides()
  const inquiries = getAllInquiries()
  const newInquiries = inquiries.filter((i) => i.status === 'new').length
  const recentlyEdited = [...coffees].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">DASHBOARD</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">운영 현황</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="전체 원두" value={coffees.length} to="/admin/coffees" />
        <StatCard label="공개 중" value={published} to="/admin/coffees" />
        <StatCard label="비공개" value={draft} to="/admin/coffees" />
        <StatCard label="지난 원두" value={archived} to="/admin/coffees" />
        <StatCard label="새 문의" value={newInquiries} to="/admin/inquiries" highlight={newInquiries > 0} />
      </div>

      {recentlyEdited.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-navy/40">최근 수정</p>
          <div className="mt-2 divide-y divide-navy/10 border border-navy/15 bg-white">
            {recentlyEdited.map((c) => (
              <Link
                key={c.id}
                to={`/admin/coffees/${c.id}`}
                className="flex items-center justify-between px-4 py-2.5 text-[12px] hover:bg-warm-white"
              >
                <span className="font-semibold text-navy">{c.coffeeName}</span>
                <span className="text-navy/40">{new Date(c.updatedAt).toLocaleDateString('ko-KR')}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink to="/admin/coffees/new" label="+ 새 원두 등록" />
        <QuickLink to="/admin/stories/new" label="+ 새 스토리 작성" />
        <QuickLink to="/admin/brew-guides/new" label="+ 새 브루 가이드" />
      </div>

      <p className="mt-8 text-[11px] text-navy/40">
        Stories {stories.length}건 · Brew Guide {brewGuides.length}건
      </p>
    </AdminLayout>
  )
}

function StatCard({ label, value, to, highlight }: { label: string; value: number; to: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className={`border p-4 hover:border-navy ${highlight ? 'border-accent bg-accent/10' : 'border-navy/15 bg-white'}`}
    >
      <p className="text-[10px] font-semibold tracking-wide text-navy/45">{label}</p>
      <p className="mt-1 font-serif text-[26px] font-bold text-navy">{value}</p>
    </Link>
  )
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="border border-navy/15 bg-white p-4 text-center text-[12px] font-semibold text-navy hover:border-navy">
      {label}
    </Link>
  )
}
