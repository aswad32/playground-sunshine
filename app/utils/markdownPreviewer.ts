import { marked } from 'marked'
import DOMPurify from 'dompurify'

export interface RenderResult {
  html: string
  error: string | null
}

/**
 * Renders Markdown to sanitized HTML.
 * Runs entirely client-side — input is never sent to a server.
 * DOMPurify is applied to prevent XSS before the result is used with v-html.
 */
export function renderMarkdown(input: string): RenderResult {
  if (!input.trim()) {
    return { html: '', error: null }
  }

  try {
    const raw = marked.parse(input) as string
    // Sanitize only when a DOM is available (browser context)
    const html =
      typeof window !== 'undefined' && DOMPurify.isSupported
        ? DOMPurify.sanitize(raw)
        : raw
    return { html, error: null }
  } catch {
    return { html: '', error: null }
  }
}
