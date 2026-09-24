import { useEffect, useRef, useState } from 'react'

/**
 * Fires `increment` once per `id` (guards React StrictMode's double-invoke in dev) and returns
 * the view count to display: `baseViews + 1` once the bump has actually landed server-side, so
 * this visit is reflected immediately without waiting for a reload. Errors are swallowed — a
 * failed view-count bump should never break the page.
 */
export default function useIncrementViewOnce(id: string | undefined, baseViews: number, increment: (id: string) => Promise<void>) {
  const firedFor = useRef<string | null>(null)
  const [bumped, setBumped] = useState(false)

  useEffect(() => {
    if (!id || firedFor.current === id) return
    firedFor.current = id
    setBumped(false)
    increment(id)
      .then(() => setBumped(true))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return bumped ? baseViews + 1 : baseViews
}
