export interface ParsedPlaylist {
  year: number
  month: number
  moodQuote: string
  tracks: string[]
  caption: string
}

/**
 * Parses the raw monthly "J&B" .txt file (see memory: koinonia-jazzy-bluesy-playlist) into the
 * fields the site needs. The file repeats the header + 20-track list inside the
 * `[인스타그램 캡션]` section (so the caption can be pasted whole into Instagram) — this strips
 * that repeat, since the site renders the track list as its own numbered block.
 */
export function parsePlaylistFile(raw: string): ParsedPlaylist {
  const text = raw.replace(/\r\n/g, '\n').trim()
  const [beforeCaption, afterMarkerRaw] = text.split(/\n\[인스타그램\s*캡션\]\n/)
  if (!afterMarkerRaw) throw new Error('[인스타그램 캡션] 구간을 찾을 수 없습니다.')

  const headerLines = beforeCaption
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const headerMatch = headerLines[0]?.match(/(\d{4})년\s*(\d{1,2})월/)
  if (!headerMatch) throw new Error('헤더 줄에서 "YYYY년 M월"을 찾을 수 없습니다.')
  const year = Number(headerMatch[1])
  const month = Number(headerMatch[2])

  const moodQuote = (headerLines[1] ?? '').replace(/^"|"$/g, '').trim()
  if (!moodQuote) throw new Error('무드 문구(따옴표 줄)를 찾을 수 없습니다.')

  const tracks = headerLines.slice(2).filter((l) => l.length > 0)
  if (tracks.length !== 20) throw new Error(`트랙이 20개가 아니라 ${tracks.length}개 찾았습니다.`)

  // The caption section repeats "Jazzy & Bluesy | ..." + the 20 tracks again — cut everything
  // from that repeated header onward, then re-append only the hashtag line that follows it.
  const afterMarker = afterMarkerRaw.trim()
  const repeatHeaderIdx = afterMarker.indexOf('Jazzy & Bluesy |')
  const prose = (repeatHeaderIdx === -1 ? afterMarker : afterMarker.slice(0, repeatHeaderIdx)).trim()
  const tail = repeatHeaderIdx === -1 ? '' : afterMarker.slice(repeatHeaderIdx)
  const hashtagLine = tail
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('#'))

  const caption = hashtagLine ? `${prose}\n\n${hashtagLine}` : prose

  return { year, month, moodQuote, tracks, caption }
}

export function playlistSlug(year: number, month: number): string {
  return `${String(year).slice(2)}${String(month).padStart(2, '0')}`
}

export function playlistTitle(year: number, month: number, moodQuote: string): string {
  return `${year}.${String(month).padStart(2, '0')} ${moodQuote}`
}
