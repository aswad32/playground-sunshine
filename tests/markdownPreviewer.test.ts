import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../app/utils/markdownPreviewer'

describe('renderMarkdown', () => {
  it('returns empty html and no error for empty input', () => {
    const result = renderMarkdown('')
    expect(result.html).toBe('')
    expect(result.error).toBeNull()
  })

  it('returns empty html and no error for whitespace-only input', () => {
    const result = renderMarkdown('   ')
    expect(result.html).toBe('')
    expect(result.error).toBeNull()
  })

  it('renders h1 heading', () => {
    const result = renderMarkdown('# Hello')
    expect(result.html).toContain('<h1')
    expect(result.html).toContain('Hello')
  })

  it('renders h2 heading', () => {
    const result = renderMarkdown('## Section')
    expect(result.html).toContain('<h2')
    expect(result.html).toContain('Section')
  })

  it('renders bold text', () => {
    const result = renderMarkdown('**bold text**')
    expect(result.html).toContain('<strong>')
    expect(result.html).toContain('bold text')
  })

  it('renders italic text', () => {
    const result = renderMarkdown('*italic text*')
    expect(result.html).toContain('<em>')
    expect(result.html).toContain('italic text')
  })

  it('renders inline code', () => {
    const result = renderMarkdown('Use `const` here')
    expect(result.html).toContain('<code>')
    expect(result.html).toContain('const')
  })

  it('renders fenced code blocks', () => {
    const result = renderMarkdown('```\nconst x = 1\n```')
    expect(result.html).toContain('<pre>')
    expect(result.html).toContain('<code>')
  })

  it('renders links as anchor elements', () => {
    const result = renderMarkdown('[Example](https://example.com)')
    expect(result.html).toContain('<a ')
    expect(result.html).toContain('href="https://example.com"')
    expect(result.html).toContain('Example')
  })

  it('renders unordered lists', () => {
    const result = renderMarkdown('- item one\n- item two')
    expect(result.html).toContain('<ul>')
    expect(result.html).toContain('<li>')
  })

  it('renders ordered lists', () => {
    const result = renderMarkdown('1. first\n2. second')
    expect(result.html).toContain('<ol>')
    expect(result.html).toContain('<li>')
  })

  it('renders blockquotes', () => {
    const result = renderMarkdown('> a quote')
    expect(result.html).toContain('<blockquote>')
  })
})
