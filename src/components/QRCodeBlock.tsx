import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { downloadDataUrl, downloadTextFile } from '../utils/download'

interface QRCodeBlockProps {
  url: string
  filenameBase: string
  size?: number
}

export default function QRCodeBlock({ url, filenameBase, size = 140 }: QRCodeBlockProps) {
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setPngDataUrl(null)
    setSvgMarkup(null)
    QRCode.toDataURL(url, { width: size * 4, margin: 1, color: { dark: '#14213d', light: '#ffffff' } }).then(
      (data) => {
        if (!cancelled) setPngDataUrl(data)
      },
    )
    QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#14213d', light: '#ffffff' } }).then((svg) => {
      if (!cancelled) setSvgMarkup(svg)
    })
    return () => {
      cancelled = true
    }
  }, [url, size])

  return (
    <div className="flex flex-col items-center gap-2">
      {pngDataUrl ? (
        <img src={pngDataUrl} alt="QR code" width={size} height={size} />
      ) : (
        <div style={{ width: size, height: size }} className="bg-navy/10" />
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!pngDataUrl}
          onClick={() => pngDataUrl && downloadDataUrl(`${filenameBase}-qr.png`, pngDataUrl)}
          className="border border-navy/25 px-2 py-1 text-[10px] font-semibold text-navy/60 hover:border-navy hover:text-navy disabled:opacity-40"
        >
          PNG
        </button>
        <button
          type="button"
          disabled={!svgMarkup}
          onClick={() => svgMarkup && downloadTextFile(`${filenameBase}-qr.svg`, svgMarkup, 'image/svg+xml')}
          className="border border-navy/25 px-2 py-1 text-[10px] font-semibold text-navy/60 hover:border-navy hover:text-navy disabled:opacity-40"
        >
          SVG
        </button>
      </div>
    </div>
  )
}
