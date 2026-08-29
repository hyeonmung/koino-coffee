import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

/**
 * `undefined` while the initial session check is in flight, `null` once confirmed logged out.
 * Shared by AdminGate and the public site's own login control (PublicHeader) — one Supabase
 * Auth session now covers both, so logging in from the public site unlocks /admin too.
 */
export function useSupabaseSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.subscription.unsubscribe()
  }, [])

  return session
}
