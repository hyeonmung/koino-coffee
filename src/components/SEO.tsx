import { Helmet } from 'react-helmet-async'
import { getSiteSettings } from '../data/repositories/siteSettingsRepository'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
}

/**
 * Client-side <head> tag management. Note: since this is a Vite SPA (not SSR), crawlers
 * that don't execute JavaScript will see the default index.html tags, not these. This is
 * a disclosed trade-off of staying on Vite instead of migrating to Next.js.
 */
export default function SEO({ title, description, image, noIndex }: SEOProps) {
  const settings = getSiteSettings()
  const resolvedTitle = title ? `${title} — ${settings.logoText}` : settings.seoDefaultTitle
  const resolvedDescription = description ?? settings.seoDefaultDescription
  const resolvedImage = image ?? settings.ogImage

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content="website" />
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
