import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { checkCompleteness } from '../../data/completeness'
import { addDemoCoffees, getAllCoffees } from '../../data/repositories/coffeeRepository'
import { getAllStories } from '../../data/repositories/storyRepository'
import { getAllBrewGuides } from '../../data/repositories/brewGuideRepository'
import { getAllInquiries } from '../../data/repositories/inquiryRepository'
import { migrateLocalDataToSupabase, type MigrationReport } from '../../data/migrateToSupabase'

export default function AdminDashboardPage() {
  const [, forceRerender] = useState(0)
  const [migrating, setMigrating] = useState(false)
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null)
  const coffees = getAllCoffees()
  const published = coffees.filter((c) => c.publishStatus === 'published').length
  const draft = coffees.filter((c) => c.publishStatus === 'draft').length
  const archived = coffees.filter((c) => c.publishStatus === 'archived').length
  const incomplete = coffees.filter((c) => checkCompleteness(c).percent < 70).length
  const stories = getAllStories()
  const brewGuides = getAllBrewGuides()
  const inquiries = getAllInquiries()
  const newInquiries = inquiries.filter((i) => i.status === 'new').length
  const recentlyEdited = [...coffees].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)

  const handleAddDemo = async () => {
    await addDemoCoffees()
    forceRerender((n) => n + 1)
  }

  const handleMigrate = async () => {
    setMigrating(true)
    setMigrationReport(null)
    try {
      const report = await migrateLocalDataToSupabase()
      setMigrationReport(report)
      forceRerender((n) => n + 1)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <AdminLayout>
      <p className="text-[10px] font-semibold tracking-[0.25em] text-accent">DASHBOARD</p>
      <h1 className="mt-1 font-serif text-[24px] font-bold text-navy">운영 현황</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="전체 원두" value={coffees.length} to="/admin/coffees" />
        <StatCard label="공개 중" value={published} to="/admin/coffees" />
        <StatCard label="비공개" value={draft} to="/admin/coffees" />
        <StatCard label="지난 원두" value={archived} to="/admin/coffees" />
        <StatCard label="정보 보완 필요" value={incomplete} to="/admin/coffees" highlight={incomplete > 0} />
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

      <div className="mt-10 border border-accent bg-accent/10 p-6">
        <p className="text-[13px] font-semibold text-navy">이 브라우저의 데이터를 Supabase로 이전</p>
        <p className="mt-1 max-w-[560px] text-[12px] text-navy/60">
          지금까지 이 브라우저에만 저장되어 있던 원두 · 캐릭터 · 향미 · 브루 가이드 · 이야기 · About 페이지 · 사이트 설정 등을
          Supabase로 옮겨서, 어떤 기기·브라우저로 접속해도 동일하게 보이도록 만듭니다. 여러 번 눌러도 안전합니다(같은 항목은
          덮어쓸 뿐 중복 생성되지 않습니다).
        </p>
        <button
          type="button"
          onClick={handleMigrate}
          disabled={migrating}
          className="mt-3 border border-navy bg-navy px-4 py-2 text-[12px] font-semibold text-warm-white hover:bg-navy-light disabled:opacity-50"
        >
          {migrating ? '이전 중…' : '지금 이전하기'}
        </button>
        {migrationReport && (
          <div className="mt-4 border-t border-navy/15 pt-3 text-[12px] text-navy/70">
            {Object.entries(migrationReport.counts).map(([label, count]) => (
              <p key={label}>
                {label}: {count}건
              </p>
            ))}
            {migrationReport.errors.length > 0 && (
              <div className="mt-2 text-red-600">
                {migrationReport.errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 border border-navy/15 bg-white p-6">
        <p className="text-[13px] font-semibold text-navy">데모 데이터</p>
        <p className="mt-1 text-[12px] text-navy/55">
          5가지 Character를 모두 보여주는 8종의 샘플 원두를 추가합니다. 이미 등록된 원두는 건드리지 않습니다.
        </p>
        <button
          type="button"
          onClick={handleAddDemo}
          className="mt-3 border border-navy px-4 py-2 text-[12px] font-semibold text-navy hover:bg-navy hover:text-warm-white"
        >
          데모 원두 8종 추가
        </button>
      </div>

      <p className="mt-6 text-[11px] text-navy/40">
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
