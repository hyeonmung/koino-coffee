import { renderRichText } from '../utils/richText'

interface StoryBodyProps {
  body: string
}

/** Minimal markdown-lite renderer: blank-line-separated paragraphs, `## ` headings. Within a
 * paragraph, single line breaks render as real breaks, and the admin toolbar's inline formatting
 * tags (bold/italic/underline/strikethrough/color) render as intended. */
export default function StoryBody({ body }: StoryBodyProps) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim())

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="font-serif text-[18px] font-bold text-navy" dangerouslySetInnerHTML={{ __html: renderRichText(block.slice(3)) }} />
          )
        }
        return (
          <p
            key={i}
            className="text-[14px] leading-relaxed text-navy/75"
            dangerouslySetInnerHTML={{ __html: renderRichText(block) }}
          />
        )
      })}
    </div>
  )
}
