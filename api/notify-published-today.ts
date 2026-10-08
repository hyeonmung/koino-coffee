// Vercel Cron target (see vercel.json "crons"), fired once daily after the 06:00–07:59 KST
// publish window closes. Columns and playlists go live purely by scheduled_at passing — no
// write happens at that moment, so nothing else in this project notices when it occurs. This
// emails a one-line summary of whatever actually went live "today" (KST calendar date), or
// stays silent if nothing was scheduled for today.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const NOTIFY_TO = 'hyeonnim98@naver.com'
const SITE_URL = 'https://koinoniaroasters.co.kr'

function todayKST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  const resendKey = process.env.RESEND_API_KEY
  if (!supabaseUrl || !supabaseKey) {
    res.status(200).json({ skipped: true })
    return
  }
  const supabase = createClient(supabaseUrl, supabaseKey)
  const today = todayKST()

  const [{ data: columns }, { data: playlists }] = await Promise.all([
    supabase.from('columns').select('slug, title, scheduled_at, publish_status').eq('publish_status', 'published'),
    supabase.from('playlists').select('slug, title, scheduled_at, publish_status').eq('publish_status', 'published'),
  ])

  const isToday = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today
  const publishedColumns = (columns ?? []).filter((c) => isToday(c.scheduled_at))
  const publishedPlaylists = (playlists ?? []).filter((p) => isToday(p.scheduled_at))

  const total = publishedColumns.length + publishedPlaylists.length
  if (total === 0) {
    res.status(200).json({ ok: true, published: 0 })
    return
  }

  if (!resendKey) {
    res.status(200).json({ ok: true, published: total, emailSkipped: true })
    return
  }

  const rows = [
    ...publishedColumns.map((c) => `<li>더코이맥 — <a href="${SITE_URL}/thekoimag/${c.slug}">${c.title}</a></li>`),
    ...publishedPlaylists.map((p) => `<li>J&B — <a href="${SITE_URL}/jb/${p.slug}">${p.title?.replace('\n', ' ')}</a></li>`),
  ].join('')

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'KOINONIA ROASTERS <onboarding@resend.dev>',
        to: [NOTIFY_TO],
        subject: `[코이노니아] 오늘 ${total}건 예약발행 완료`,
        html: `<h2>오늘 발행된 글</h2><ul>${rows}</ul>`,
      }),
    })
  } catch (err) {
    console.error('[notify-published-today] email failed:', (err as Error).message)
  }

  res.status(200).json({ ok: true, published: total })
}
