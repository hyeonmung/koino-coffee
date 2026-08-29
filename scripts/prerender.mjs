// Runs after `vite build`. This is a client-only SPA (createRoot, not hydrateRoot — see
// src/main.tsx), so writing extra static HTML into dist/<route>/index.html is completely
// safe: React wipes and replaces #root's children the moment it mounts, no hydration
// mismatch is possible. Vercel serves a static file over the SPA fallback rewrite whenever
// one exists at that exact path (see vercel.json), so real users still get the live app —
// crawlers and link-preview bots that don't execute JavaScript get correct per-page
// <title>/description/OG tags and a plain-text snapshot instead of the homepage's defaults.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const SITE_URL = 'https://koinoniaroasters.co.kr'
const BRAND = 'KOINONIA ROASTERS'
const DEFAULT_DESCRIPTION =
  '좋은 원두를 정직하게, 그 맛을 쉽게. 코이노니아 로스터스의 원두, 브루 가이드, 커피 이야기를 만나보세요.'

// Local `npm run build` doesn't auto-load .env.local the way Vite's dev/build client-side
// `import.meta.env` does — this is a plain Node script, so read it by hand. On Vercel the
// project's env vars are already in process.env at build time; this is a no-op there.
function loadLocalEnv() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
loadLocalEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[prerender] Supabase env vars missing — skipping. The SPA still works fine, just without prerendered per-page SEO tags.')
  process.exit(0)
}

const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// The DB stores uploaded images as base64 data: URIs (a separate, larger issue than this
// script — see the audit notes). Those aren't valid og:image values per the OG spec and
// would bloat every generated file, so fall back to the site default instead of using them.
function resolveImage(image) {
  return image && !image.startsWith('data:') ? image : `${SITE_URL}/og-image.png`
}

const pages = [] // { routePath } collected for the sitemap

function renderPage(routePath, { title, description, image }) {
  const fullTitle = title ? `${title} — ${BRAND}` : `${BRAND} 공식사이트`
  const desc = description || DEFAULT_DESCRIPTION
  const img = resolveImage(image)
  const url = `${SITE_URL}${routePath}`

  let html = template
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
  html = html.replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`)
  html = html.replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta property="og:image" content=".*?"\s*\/>/, `<meta property="og:image" content="${escapeHtml(img)}" />`)
  html = html.replace(/<meta property="og:url" content=".*?"\s*\/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
  html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`)
  html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(desc)}" />`)
  html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(img)}" />`)
  html = html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`)
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><div style="padding:48px 24px;font-family:sans-serif;color:#1b2340"><p style="font-size:11px;letter-spacing:.15em;opacity:.5">${BRAND}</p><h1 style="font-size:22px;font-weight:700;margin-top:8px">${escapeHtml(title || BRAND)}</h1><p style="margin-top:8px;opacity:.7;max-width:560px;line-height:1.6">${escapeHtml(desc)}</p></div></div>`,
  )

  // "<route>/index.html": Vercel's static file serving resolves a directory path straight
  // to its index.html with no extra config needed, and — unlike the flat "<route>.html" +
  // cleanUrls approach — doesn't fight with the vercel.json catch-all rewrite that serves
  // the SPA shell for every other route (verified live; cleanUrls broke that fallback).
  const outDir = path.join(distDir, routePath.replace(/^\//, ''))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
  pages.push(routePath)
}

const STATIC_PAGES = [
  ['/coffees', { title: '원두', description: '산지, 향미, 프로세스로 코이노니아 원두를 탐색하세요.' }],
  ['/coffee-chart', { title: '원두 차트', description: '코이노니아 원두의 핵심 정보를 한눈에 비교해보세요.' }],
  ['/characters', { title: 'KOINO CUP CHARACTER', description: '코이노니아의 5가지 CUP CHARACTER를 소개합니다.' }],
  ['/discover', { title: '취향 찾기', description: '몇 가지 질문으로 나에게 맞는 커피를 찾아보세요.' }],
  ['/compare', { title: '원두 비교', description: '최대 3개의 원두를 나란히 비교해보세요.' }],
  ['/dictionary', { title: '커피 사전', description: '향미, 센서리, 가공, 품종 등 궁금한 커피 단어를 검색해보세요.' }],
  ['/brew-guide', { title: '브루 가이드', description: '장비별 KOINO 원두 추출 레시피.' }],
  ['/stories', { title: '뉴스&이야기', description: '공지, 소식, 산지, 원두, 커피 교육에 관한 코이노니아의 뉴스와 이야기.' }],
  ['/business', { title: '납품 · 교육', description: '코이노니아의 원두 납품과 교육 소식을 안내합니다.' }],
  ['/about-sensory-map', { title: 'KOINO SENSORY MAP 알아보기', description: 'KOINO SENSORY MAP이 원두를 설명하는 방식을 소개합니다.' }],
]

async function run() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  renderPage('/', {}) // matches the default tags already baked into dist/index.html — keeps output consistent
  for (const [routePath, meta] of STATIC_PAGES) renderPage(routePath, meta)

  const [{ data: coffees, error: coffeesErr }, { data: stories, error: storiesErr }, { data: guides, error: guidesErr }, { data: posts, error: postsErr }, { data: characters, error: charsErr }] =
    await Promise.all([
      supabase.from('coffees').select('slug, coffee_name, country, notes, character, hero_image, seo_title, seo_description, publish_status'),
      supabase.from('stories').select('slug, title, excerpt, cover_image, seo_title, seo_description, publish_status'),
      supabase.from('brew_guides').select('slug, title, equipment, coffee_dose, ratio, publish_status'),
      supabase.from('business_posts').select('slug, title, excerpt, cover_image, seo_title, seo_description, publish_status'),
      supabase.from('characters').select('key, label, description'),
    ])

  for (const [name, err] of [['coffees', coffeesErr], ['stories', storiesErr], ['brew_guides', guidesErr], ['business_posts', postsErr], ['characters', charsErr]]) {
    if (err) console.warn(`[prerender] failed to fetch ${name}:`, err.message)
  }

  const charLabelOf = (key) => characters?.find((c) => c.key === key)?.label ?? key

  // Slugs can contain Korean (e.g. story/brew-guide titles auto-slugified as-is) — encode
  // them so the on-disk directory name is plain ASCII and matches exactly what a browser
  // actually requests over HTTP (browsers percent-encode non-ASCII URL segments).
  for (const c of coffees ?? []) {
    if (c.publish_status !== 'published') continue
    const slug = encodeURIComponent(c.slug)
    renderPage(`/coffees/${slug}`, {
      title: c.seo_title || c.coffee_name,
      description: c.seo_description || `${c.country} · ${charLabelOf(c.character)} · ${(c.notes ?? []).join(', ')}`,
      image: c.hero_image,
    })
    renderPage(`/coffee-chart/${slug}`, {
      title: `${c.coffee_name} 원두 차트`,
      description: `${c.country} · ${charLabelOf(c.character)} · ${(c.notes ?? []).join(', ')}`,
      image: c.hero_image,
    })
  }

  for (const s of stories ?? []) {
    if (s.publish_status !== 'published') continue
    renderPage(`/stories/${encodeURIComponent(s.slug)}`, { title: s.seo_title || s.title, description: s.seo_description || s.excerpt, image: s.cover_image })
  }

  for (const g of guides ?? []) {
    if (g.publish_status !== 'published') continue
    renderPage(`/brew-guide/${encodeURIComponent(g.slug)}`, { title: g.title, description: `${g.equipment} 추출 레시피 — ${g.coffee_dose}, ${g.ratio}` })
  }

  for (const p of posts ?? []) {
    if (p.publish_status !== 'published') continue
    renderPage(`/business/${encodeURIComponent(p.slug)}`, { title: p.seo_title || p.title, description: p.seo_description || p.excerpt, image: p.cover_image })
  }

  for (const c of characters ?? []) {
    renderPage(`/characters/${c.key.toLowerCase()}`, { title: c.label, description: c.description })
  }

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n') +
    '\n</urlset>\n'
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)

  console.log(`[prerender] wrote ${pages.length} static HTML snapshots + sitemap.xml`)
}

run().catch((err) => {
  // Never fail the whole deploy over this — the SPA fallback (vercel.json rewrite) works
  // correctly with zero prerendered pages, just without the per-page SEO improvement.
  console.error('[prerender] failed, continuing without prerendered pages:', err)
})
