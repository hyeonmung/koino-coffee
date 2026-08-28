import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll to the top on every route change — HashRouter doesn't do this on its own. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
