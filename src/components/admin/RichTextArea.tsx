import { useRef } from 'react'

interface RichTextAreaProps {
  value: string
  onChange: (value: string) => void
  className: string
  placeholder?: string
}

const TOOLS: { label: string; title: string; before: string; after: string; buttonClassName: string }[] = [
  { label: 'B', title: '굵게', before: '<strong>', after: '</strong>', buttonClassName: 'font-bold' },
  { label: 'I', title: '기울임', before: '<em>', after: '</em>', buttonClassName: 'italic' },
  { label: 'U', title: '밑줄', before: '<u>', after: '</u>', buttonClassName: 'underline' },
  { label: 'S', title: '취소선', before: '<s>', after: '</s>', buttonClassName: 'line-through' },
]

const toolButtonClass =
  'flex h-7 w-7 shrink-0 items-center justify-center border border-navy/20 text-[12px] text-navy/70 hover:border-navy hover:text-navy'

/** A plain textarea with a small formatting toolbar above it. Selected text gets wrapped in the
 * matching inline tag (<strong>/<em>/<u>/<s>/<span style="color:...">) right in the stored plain
 * text — StoryBody / AboutBlockRenderer render those tags back out via renderRichText. */
export default function RichTextArea({ value, onChange, className, placeholder }: RichTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const wrapSelection = (before: string, after: string) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end } = el
    if (start === end) return
    const selected = value.slice(start, end)
    onChange(value.slice(0, start) + before + selected + after + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => wrapSelection(tool.before, tool.after)}
            className={`${toolButtonClass} ${tool.buttonClassName}`}
          >
            {tool.label}
          </button>
        ))}
        <label title="글자 색" className={`relative cursor-pointer ${toolButtonClass}`}>
          A
          <input
            type="color"
            defaultValue="#1b2a4a"
            onChange={(e) => wrapSelection(`<span style="color:${e.target.value}">`, '</span>')}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
      <p className="mt-1 text-[10px] text-navy/35">서식을 적용할 부분을 드래그해서 선택한 뒤 버튼을 누르세요.</p>
    </div>
  )
}
