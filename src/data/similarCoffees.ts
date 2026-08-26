import type { Coffee } from './schema'

export function getSimilarCoffees(coffee: Coffee, all: Coffee[], limit = 3): Coffee[] {
  const notesSet = new Set(coffee.notes.map((n) => n.toLowerCase()))

  return all
    .filter((c) => c.id !== coffee.id && c.publishStatus === 'published')
    .map((c) => {
      let score = 0
      if (c.character === coffee.character) score += 2
      score += c.notes.filter((n) => notesSet.has(n.toLowerCase())).length
      if (c.country === coffee.country) score += 1
      return { coffee: c, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.coffee)
}
