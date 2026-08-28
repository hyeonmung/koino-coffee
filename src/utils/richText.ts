// A small whitelist of inline formatting tags the admin toolbar (RichTextArea) inserts.
// Anything else gets stripped — defensive-in-depth in case something else ends up pasted in.
const ALLOWED_TAGS = new Set(['strong', 'em', 'u', 's', 'span', 'br'])

function sanitizeInlineHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagNameRaw: string, attrs: string) => {
    const tag = tagNameRaw.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ''
    const isClosing = match.startsWith('</')
    if (tag === 'br') return '<br/>'
    if (isClosing) return `</${tag}>`
    if (tag === 'span') {
      const colorMatch = /style\s*=\s*"[^"]*color\s*:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/.exec(attrs)
      return colorMatch ? `<span style="color:${colorMatch[1]}">` : '<span>'
    }
    return `<${tag}>`
  })
}

/** Converts a plain-text paragraph (with the admin toolbar's inline tags already inlined into
 * it) into safe render-ready HTML: real line breaks + a whitelist-sanitized pass over any tags. */
export function renderRichText(text: string): string {
  return sanitizeInlineHtml(text.split('\n').join('<br/>'))
}
