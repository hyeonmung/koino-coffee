import { useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

export function useProfile(userId: string | undefined) {
  const [nickname, setNicknameState] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNicknameState(null)
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setNicknameState((data?.nickname as string | null) ?? null)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const setNickname = async (value: string) => {
    if (!userId) return
    const { error } = await supabase.from('profiles').update({ nickname: value }).eq('id', userId)
    if (!error) setNicknameState(value)
  }

  return { nickname, setNickname }
}
