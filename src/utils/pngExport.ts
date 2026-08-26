import { toPng } from 'html-to-image'
import { downloadDataUrl } from './download'

export async function exportNodeAsPng(
  node: HTMLElement | null,
  filename: string,
  transparent: boolean,
): Promise<void> {
  if (!node) return
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    ...(transparent ? {} : { backgroundColor: '#ffffff' }),
  })
  downloadDataUrl(filename, dataUrl)
}

export interface SocialSizePreset {
  key: string
  label: string
  width: number
  height: number
}

// px at ~150dpi for print sizes, standard px for social platforms.
export const SOCIAL_SIZE_PRESETS: SocialSizePreset[] = [
  { key: 'square', label: 'Square', width: 1080, height: 1080 },
  { key: 'portrait', label: 'Instagram 4:5', width: 1080, height: 1350 },
  { key: 'story', label: 'Story 9:16', width: 1080, height: 1920 },
  { key: 'a5', label: 'A5', width: 1240, height: 1754 },
  { key: 'a4', label: 'A4', width: 1754, height: 2480 },
]

/**
 * Captures a node, then composites it centered (contain-fit) onto a canvas of
 * the requested social/print size, with brand-colored letterboxing — rather
 * than trying to reflow the card into every aspect ratio.
 */
export async function exportNodeAsSizedPng(
  node: HTMLElement | null,
  filename: string,
  preset: SocialSizePreset,
  background = '#faf8f4',
): Promise<void> {
  if (!node) return

  const cardDataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true, backgroundColor: '#ffffff' })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = cardDataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = preset.width
  canvas.height = preset.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const padding = Math.round(Math.min(preset.width, preset.height) * 0.08)
  const maxWidth = canvas.width - padding * 2
  const maxHeight = canvas.height - padding * 2
  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  const x = (canvas.width - drawWidth) / 2
  const y = (canvas.height - drawHeight) / 2

  ctx.drawImage(img, x, y, drawWidth, drawHeight)

  downloadDataUrl(filename, canvas.toDataURL('image/png'))
}
