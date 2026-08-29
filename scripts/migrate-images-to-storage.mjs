// One-time cleanup: moves every image currently stored as a base64 data: URI directly in
// a database column over to the "images" Supabase Storage bucket, and rewrites that column
// to the resulting public URL instead. Run this AFTER migrations/2026-08-29-admin-auth-and-
// cleanup.sql has been applied (that's what creates the bucket + its policies).
//
// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... node scripts/migrate-images-to-storage.mjs
//
// Credentials are read from the environment on purpose — never hardcode them here, this
// file is committed to the repo. Safe to re-run: rows without a data: URI are skipped.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[migrate-images] missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('[migrate-images] set ADMIN_EMAIL and ADMIN_PASSWORD env vars (the admin login you sign into /admin with)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function dataUrlToBuffer(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/s)
  if (!match) return null
  const [, mime, base64] = match
  return { buffer: Buffer.from(base64, 'base64'), mime, ext: mime === 'image/png' ? 'png' : 'jpg' }
}

async function migrateField(table, idColumn, imageColumn) {
  const { data: rows, error } = await supabase.from(table).select(`${idColumn}, ${imageColumn}`)
  if (error) {
    console.error(`[migrate-images] failed to read ${table}.${imageColumn}:`, error.message)
    return
  }

  for (const row of rows ?? []) {
    const value = row[imageColumn]
    if (typeof value !== 'string' || !value.startsWith('data:')) continue

    const decoded = dataUrlToBuffer(value)
    if (!decoded) {
      console.warn(`[migrate-images] ${table}.${imageColumn} (${row[idColumn]}): couldn't parse data URI, skipped`)
      continue
    }

    const objectPath = `${table}-${imageColumn}-${row[idColumn]}-${Date.now()}.${decoded.ext}`
    const { error: uploadError } = await supabase.storage.from('images').upload(objectPath, decoded.buffer, {
      contentType: decoded.mime,
      upsert: true,
    })
    if (uploadError) {
      console.error(`[migrate-images] upload failed for ${table}.${imageColumn} (${row[idColumn]}):`, uploadError.message)
      continue
    }

    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(objectPath)
    const { error: updateError } = await supabase
      .from(table)
      .update({ [imageColumn]: publicUrlData.publicUrl })
      .eq(idColumn, row[idColumn])
    if (updateError) {
      console.error(`[migrate-images] DB update failed for ${table}.${imageColumn} (${row[idColumn]}):`, updateError.message)
      continue
    }

    console.log(`[migrate-images] ${table}.${imageColumn} (${row[idColumn]}): ${Math.round(decoded.buffer.length / 1024)}KB -> ${publicUrlData.publicUrl}`)
  }
}

async function run() {
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  if (signInError) {
    console.error('[migrate-images] sign-in failed:', signInError.message)
    process.exit(1)
  }

  await migrateField('coffees', 'id', 'hero_image')
  await migrateField('stories', 'id', 'cover_image')
  await migrateField('business_posts', 'id', 'cover_image')
  await migrateField('brew_guides', 'id', 'hero_image')
  await migrateField('characters', 'key', 'image')
  await migrateField('about_blocks', 'id', 'image')
  await migrateField('about_page_settings', 'id', 'hero_image_desktop')
  await migrateField('about_page_settings', 'id', 'hero_image_mobile')
  await migrateField('site_settings', 'id', 'hero_image')
  await migrateField('site_settings', 'id', 'og_image')

  console.log('[migrate-images] done')
}

run()
