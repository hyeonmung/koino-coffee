import { useState } from 'react'

const DEFAULT_CLASS =
  'border border-line/25 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-ink hover:border-line'

/**
 * Always copies the URL straight to the clipboard — no native share sheet, no `text` field
 * that some share targets would append to it (see ShareButton). Sits next to ShareButton as
 * the "just give me the plain link" option.
 */
export default function CopyLinkButton({ url, className = DEFAULT_CLASS }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {copied ? '링크 복사됨' : '링크 복사'}
    </button>
  )
}
