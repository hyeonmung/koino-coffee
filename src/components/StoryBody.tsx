interface StoryBodyProps {
  body: string
}

/** Minimal markdown-lite renderer: blank-line-separated paragraphs, `## ` headings. */
export default function StoryBody({ body }: StoryBodyProps) {
  const blocks = body.split(/\n\s*\n/).filter((b) => b.trim())

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="font-serif text-[18px] font-bold text-navy">
              {block.slice(3)}
            </h2>
          )
        }
        return (
          <p key={i} className="text-[14px] leading-relaxed text-navy/75">
            {block}
          </p>
        )
      })}
    </div>
  )
}
