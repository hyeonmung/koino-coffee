import { CUP_CHARACTERS, type CoffeeProfile, type CupCharacter } from '../types'

const CSV_HEADERS = [
  'Coffee Name',
  'Country',
  'Region',
  'Producer',
  'Variety',
  'Process',
  'Altitude',
  'Roast Level',
  'Character',
  'Note 1',
  'Note 2',
  'Note 3',
  'Note 4',
  'Note 5',
  'Note 6',
  'Acidity',
  'Sweetness',
  'Body',
  'Finish',
  'Flavor',
  'Accessibility',
] as const

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function coffeesToCsv(coffees: CoffeeProfile[]): string {
  const rows = coffees.map((c) => {
    const notes = [...c.notes]
    while (notes.length < 6) notes.push('')
    const cells = [
      c.coffeeName,
      c.country,
      c.region,
      c.producer,
      c.variety,
      c.process,
      c.altitude,
      c.roastLevel,
      c.character,
      ...notes.slice(0, 6),
      String(c.sensory.acidity),
      String(c.sensory.sweetness),
      String(c.sensory.body),
      String(c.sensory.finish),
      String(c.sensory.flavor),
      String(c.sensory.accessibility),
    ]
    return cells.map((cell) => escapeCsvCell(cell)).join(',')
  })
  return [CSV_HEADERS.join(','), ...rows].join('\n')
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      cells.push(current)
      current = ''
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells
}

function splitCsvRows(text: string): string[] {
  const rows: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') inQuotes = !inQuotes
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim().length > 0) rows.push(current)
      current = ''
      if (char === '\r' && text[i + 1] === '\n') i++
    } else {
      current += char
    }
  }
  if (current.trim().length > 0) rows.push(current)
  return rows
}

function clampScore(value: string): 1 | 2 | 3 | 4 | 5 {
  const n = Number(value)
  const clamped = Math.min(5, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1))
  return clamped as 1 | 2 | 3 | 4 | 5
}

export interface CsvParseResult {
  coffees: CoffeeProfile[]
  errors: string[]
}

export function csvToCoffees(text: string): CsvParseResult {
  const lines = splitCsvRows(text.trim())
  const errors: string[] = []
  if (lines.length < 2) {
    return { coffees: [], errors: ['CSV 파일에 데이터 행이 없습니다.'] }
  }

  const dataLines = lines.slice(1)
  const coffees: CoffeeProfile[] = []

  dataLines.forEach((line, idx) => {
    const cells = parseCsvLine(line)
    if (cells.length < 21) {
      errors.push(`${idx + 2}행: 컬럼 수가 부족합니다.`)
      return
    }

    const [
      coffeeName,
      country,
      region,
      producer,
      variety,
      process,
      altitude,
      roastLevel,
      characterRaw,
      note1,
      note2,
      note3,
      note4,
      note5,
      note6,
      acidity,
      sweetness,
      body,
      finish,
      flavor,
      accessibility,
    ] = cells

    if (!coffeeName?.trim()) {
      errors.push(`${idx + 2}행: Coffee Name이 비어 있어 건너뜁니다.`)
      return
    }

    const character = CUP_CHARACTERS.includes(characterRaw as CupCharacter)
      ? (characterRaw as CupCharacter)
      : 'CLEAR'
    if (!CUP_CHARACTERS.includes(characterRaw as CupCharacter)) {
      errors.push(`${idx + 2}행: Character 값 "${characterRaw}"이(가) 올바르지 않아 CLEAR로 대체했습니다.`)
    }

    const notes = [note1, note2, note3, note4, note5, note6].filter((n) => n && n.trim().length > 0).slice(0, 6)

    const now = new Date().toISOString()
    coffees.push({
      id: crypto.randomUUID(),
      coffeeName: coffeeName.trim(),
      country: country ?? '',
      region: region ?? '',
      producer: producer ?? '',
      variety: variety ?? '',
      process: process ?? '',
      altitude: altitude ?? '',
      roastLevel: roastLevel ?? '',
      character,
      notes,
      sensory: {
        acidity: clampScore(acidity),
        sweetness: clampScore(sweetness),
        body: clampScore(body),
        finish: clampScore(finish),
        flavor: clampScore(flavor),
        accessibility: clampScore(accessibility),
      },
      createdAt: now,
      updatedAt: now,
    })
  })

  return { coffees, errors }
}
