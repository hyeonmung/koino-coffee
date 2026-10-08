// Vercel Cron target (see vercel.json "crons"). Walks every image URL stored across the
// site's content tables, HEAD-requests each one, and emails a summary only when something
// is actually broken — silent on a clean run, same "best effort, never throws" spirit as
// the other api/*.ts notifiers in this project.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const NOTIFY_TO = 'hyeonnim98@naver.com'

interface ImageRef {
  table: string
  row: string
  field: string
  url: string
}

async function isReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true
    // Some hosts (e.g. certain CDNs) reject HEAD but serve GET fine — fall back once.
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(url, { method: 'GET' })
      return getRes.ok
    }
    return false
  } catch {
    return false
  }
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

  const refs: ImageRef[] = []
  const collect = (table: string, rows: { slug?: string; id?: string }[] | null, field: string, urls: (string | null | undefined)[]) => {
    rows?.forEach((row, i) => {
      const url = urls[i]
      if (url && !url.startsWith('data:')) refs.push({ table, row: row.slug ?? row.id ?? String(i), field, url })
    })
  }

  const [coffees, posts, columns, playlists, stories, slides, settings] = await Promise.all([
    supabase.from('coffees').select('slug, hero_image'),
    supabase.from('business_posts').select('slug, cover_image'),
    supabase.from('columns').select('slug, cover_image'),
    supabase.from('playlists').select('slug, cover_image'),
    supabase.from('stories').select('id, cover_image'),
    supabase.from('spotlight_slides').select('id, desktop_image, mobile_image'),
    supabase.from('site_settings').select('id, hero_image, og_image'),
  ])

  collect('coffees', coffees.data, 'hero_image', (coffees.data ?? []).map((r) => r.hero_image))
  collect('business_posts', posts.data, 'cover_image', (posts.data ?? []).map((r) => r.cover_image))
  collect('columns', columns.data, 'cover_image', (columns.data ?? []).map((r) => r.cover_image))
  collect('playlists', playlists.data, 'cover_image', (playlists.data ?? []).map((r) => r.cover_image))
  collect('stories', stories.data, 'cover_image', (stories.data ?? []).map((r) => r.cover_image))
  collect('spotlight_slides', slides.data, 'desktop_image', (slides.data ?? []).map((r) => r.desktop_image))
  collect('spotlight_slides', slides.data, 'mobile_image', (slides.data ?? []).map((r) => r.mobile_image))
  collect('site_settings', settings.data, 'hero_image', (settings.data ?? []).map((r) => r.hero_image))
  collect('site_settings', settings.data, 'og_image', (settings.data ?? []).map((r) => r.og_image))

  const broken: ImageRef[] = []
  for (const ref of refs) {
    // Sequential, not Promise.all — this runs on a daily cron, not a user-facing request,
    // so there's no latency pressure, and it avoids hammering whatever host serves the images.
    if (!(await isReachable(ref.url))) broken.push(ref)
  }

  if (broken.length === 0) {
    res.status(200).json({ ok: true, checked: refs.length, broken: 0 })
    return
  }

  if (!resendKey) {
    res.status(200).json({ ok: true, checked: refs.length, broken: broken.length, emailSkipped: true })
    return
  }

  const rows = broken.map((b) => `<tr><td>${b.table}</td><td>${b.row}</td><td>${b.field}</td><td style="word-break:break-all">${b.url}</td></tr>`).join('')
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'KOINONIA ROASTERS <onboarding@resend.dev>',
        to: [NOTIFY_TO],
        subject: `[코이노니아] 깨진 이미지 ${broken.length}건 발견`,
        html: `<h2>깨진 이미지 점검 결과</h2><table cellpadding="6" style="border-collapse:collapse"><tr><th>테이블</th><th>항목</th><th>필드</th><th>URL</th></tr>${rows}</table>`,
      }),
    })
  } catch (err) {
    console.error('[check-broken-images] email failed:', (err as Error).message)
  }

  res.status(200).json({ ok: true, checked: refs.length, broken: broken.length })
}
