// Vercel serverless function. Step 2 of the Naver login bridge: exchange the auth code for a
// Naver profile, then hand off to Supabase Auth via admin.generateLink — this both
// creates-if-missing the auth.users row (profiles.handle_new_user trigger fills in the rest)
// and returns a one-time verify link. Redirecting the browser to that link lets Supabase's own
// /auth/v1/verify endpoint issue a real session, landing back on /auth/callback with the
// session tokens in the URL hash — same mechanism the Kakao path uses, so both converge there.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://koinoniaroasters.co.kr'

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))
  return match?.slice(name.length + 1)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fail = (reason: string) => {
    res.writeHead(302, { Location: `${SITE_URL}/?authError=${encodeURIComponent(reason)}` })
    res.end()
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (!clientId || !clientSecret || !serviceRoleKey || !supabaseUrl) {
    return fail('naver-not-configured')
  }

  const { code, state } = req.query
  const cookieValue = parseCookie(req.headers.cookie, 'naver_oauth_state')
  const [cookieState, encodedRedirect] = cookieValue?.split('.') ?? []
  if (!code || typeof code !== 'string' || !cookieState || cookieState !== state) {
    return fail('state-mismatch')
  }
  const redirectTo = encodedRedirect ? decodeURIComponent(encodedRedirect) : '/'

  try {
    const tokenRes = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}`,
    )
    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) return fail('token-exchange-failed')

    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profileData = (await profileRes.json()) as {
      response?: { id: string; email?: string; nickname?: string; profile_image?: string }
    }
    const profile = profileData.response
    if (!profile) return fail('profile-fetch-failed')

    // Naver login can be configured to not require the user to share their email — fall back to
    // a synthetic, stable address tied to their Naver id so a Supabase account can still be created.
    const email = profile.email || `naver_${profile.id}@users.noreply.koinoniaroasters.co.kr`

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        data: { name: profile.nickname, avatar_url: profile.profile_image, provider: 'naver', naver_id: profile.id },
        redirectTo: `${SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error || !data.properties?.action_link) {
      console.error('[naver callback] generateLink failed:', error)
      return fail('supabase-link-failed')
    }

    res.setHeader('Set-Cookie', 'naver_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')
    res.writeHead(302, { Location: data.properties.action_link })
    res.end()
  } catch (err) {
    console.error('[naver callback] failed:', err)
    fail('unexpected-error')
  }
}
