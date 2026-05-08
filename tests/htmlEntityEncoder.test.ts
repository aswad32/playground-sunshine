import { describe, expect, it } from 'vitest'
import { encodeHtmlEntities, decodeHtmlEntities } from '~/utils/htmlEntityEncoder'

describe('encodeHtmlEntities', () => {
  it('returns empty string for empty input', () => {
    expect(encodeHtmlEntities('')).toBe('')
  })

  it('encodes < and >', () => {
    expect(encodeHtmlEntities('<script>')).toBe('&lt;script&gt;')
  })

  it('encodes & to &amp;', () => {
    expect(encodeHtmlEntities('cats & dogs')).toBe('cats &amp; dogs')
  })

  it('encodes " to &quot;', () => {
    expect(encodeHtmlEntities('"hello"')).toBe('&quot;hello&quot;')
  })

  it("encodes ' to &#39;", () => {
    expect(encodeHtmlEntities("it's")).toBe('it&#39;s')
  })

  it('encodes all special characters in a mixed string', () => {
    const result = encodeHtmlEntities('<a href="test">it\'s a & thing</a>')
    expect(result).toBe('&lt;a href=&quot;test&quot;&gt;it&#39;s a &amp; thing&lt;/a&gt;')
  })

  it('leaves plain text unchanged', () => {
    expect(encodeHtmlEntities('hello world 123')).toBe('hello world 123')
  })
})

describe('decodeHtmlEntities', () => {
  it('returns empty output for empty input', () => {
    const result = decodeHtmlEntities('')
    expect(result.output).toBe('')
    expect(result.hadUnknown).toBe(false)
  })

  it('decodes &lt; and &gt; to < and >', () => {
    const result = decodeHtmlEntities('&lt;p&gt;')
    expect(result.output).toBe('<p>')
    expect(result.hadUnknown).toBe(false)
  })

  it('decodes &amp; to &', () => {
    const result = decodeHtmlEntities('cats &amp; dogs')
    expect(result.output).toBe('cats & dogs')
  })

  it('decodes &quot; to "', () => {
    const result = decodeHtmlEntities('&quot;hello&quot;')
    expect(result.output).toBe('"hello"')
  })

  it("decodes &#39; to '", () => {
    const result = decodeHtmlEntities('it&#39;s')
    expect(result.output).toBe("it's")
  })

  it('round-trips: encode then decode returns original', () => {
    const original = '<div class="test">it\'s a & test</div>'
    const encoded = encodeHtmlEntities(original)
    const { output } = decodeHtmlEntities(encoded)
    expect(output).toBe(original)
  })
})
