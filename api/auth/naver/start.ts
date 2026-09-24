// Vercel serverless function. Step 1 of the Naver login bridge — Supabase has no native Naver
// OAuth provider (unlike Kakao, which goes straight through supabase.auth.signInWithOAuth), so
// this hand-rolls the redirect leg: send the browser to Naver's consent screen with a CSRF
// state token stashed in a short-lived cookie for callback.ts to verify.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'crypto'

const SITE_URL = 'https://koinoniaroasters.co.kr'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.NAVER_CLIENT_ID
  if (!clientId) {
    res.status(500).send('네이버 로그인이 아직 설정되지 않았습니다 (NAVER_CLIENT_ID 누락).')
    return
  }

  const state = randomBytes(16).toString('hex')
  const requested = typeof req.query.redirectTo === 'string' ? req.query.redirectTo : '/'
  // Only ever an internal path — reject anything that could redirect off-site (absolute URLs, protocol-relative "//host").
  const redirectTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'

  // State carries the post-login redirect path too, so callback.ts doesn't need its own cookie for that.
  const stateCookie = `${state}.${encodeURIComponent(redirectTo)}`
  res.setHeader('Set-Cookie', `naver_oauth_state=${stateCookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`)

  const authorizeUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', `${SITE_URL}/api/auth/naver/callback`)
  authorizeUrl.searchParams.set('state', state)

  res.writeHead(302, { Location: authorizeUrl.toString() })
  res.end()
}
