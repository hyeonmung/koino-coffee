import { useState } from 'react'

const DEFAULT_CLASS =
  'border border-line/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-ink hover:border-line'

/**
 * Native share sheet on mobile (navigator.share); falls back to copying the URL to the
 * clipboard everywhere else, with a 2s "링크 복사됨" confirmation on the button itself.
 *
 * Deliberately shares `url` alone, no `text` — some share targets (e.g. iOS "복사") append
 * the `text` field to the URL when the person picks "copy", so what actually lands on their
 * clipboard is "excerpt\nurl" instead of a clean link. `title` alone doesn't get appended.
 */
export default function ShareButton({
  url,
  title,
  className = DEFAULT_CLASS,
}: {
  url: string
  title: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? '링크 복사됨' : '공유하기'}
    </button>
  )
}
