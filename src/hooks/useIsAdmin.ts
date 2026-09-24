import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

/**
 * `undefined` while the check is in flight, `false` once confirmed not-admin (or logged out).
 * Session alone is no longer enough to gate /admin — see migrations/2026-09-02-admin-role-separation.sql:
 * any signed-in visitor (including a Kakao/Naver customer) has *a* session now, but only emails
 * in `admin_emails` pass the `is_admin()` check.
 */
export default function useIsAdmin(session: Session | null | undefined): boolean | undefined {
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (session === undefined) return // still resolving the session itself
    if (!session) {
      setIsAdmin(false)
      return
    }
    let cancelled = false
    supabase.rpc('is_admin').then(({ data }) => {
      if (!cancelled) setIsAdmin(Boolean(data))
    })
    return () => {
      cancelled = true
    }
  }, [session])

  return isAdmin
}
