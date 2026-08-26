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
