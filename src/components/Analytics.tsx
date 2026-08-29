import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * GA4's own page_view (fired by the gtag snippet in index.html) only covers the very first
 * load — this is a client-routed SPA, so every later navigation is a history change, not a
 * real page load, and needs its own page_view sent by hand.
 */
export default function Analytics() {
  const location = useLocation()

  useEffect(() => {
    window.gtag?.('event', 'page_view', {
      page_path: location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    })
  }, [location.pathname])

  return null
}
