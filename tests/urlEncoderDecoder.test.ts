import { describe, it, expect } from 'vitest'
import { encodeUrl, decodeUrl } from '~/utils/urlEncoderDecoder'

describe('encodeUrl', () => {
  it('encodes spaces as %20', () => {
    const { output, error } = encodeUrl('hello world')
    expect(error).toBeNull()
    expect(output).toBe('hello%20world')
  })

  it('encodes special characters correctly', () => {
    const { output, error } = encodeUrl('https://example.com/search?q=hello world&lang=en')
    expect(error).toBeNull()
    expect(output).toContain('%3A%2F%2F')
    expect(output).toContain('hello%20world')
    expect(output).toContain('%26')
  })

  it('returns empty for empty input', () => {
    const { output, error } = encodeUrl('')
    expect(error).toBeNull()
    expect(output).toBe('')
  })

  it('encodes unicode characters', () => {
    const { output, error } = encodeUrl('café')
    expect(error).toBeNull()
    expect(output).not.toContain('é')
    expect(output).toContain('%C3%A9')
  })
})

describe('decodeUrl', () => {
  it('decodes percent-encoded URL back to plain text', () => {
    const { output, error } = decodeUrl('hello%20world')
    expect(error).toBeNull()
    expect(output).toBe('hello world')
  })

  it('encode → decode roundtrip produces original string', () => {
    const original = 'https://example.com/search?q=hello world&lang=en'
    const { output: encoded } = encodeUrl(original)
    const { output: decoded } = decodeUrl(encoded)
    expect(decoded).toBe(original)
  })

  it('returns empty for empty input', () => {
    const { output, error } = decodeUrl('')
    expect(error).toBeNull()
    expect(output).toBe('')
  })

  it('returns an error for malformed percent-encoding', () => {
    const { output, error } = decodeUrl('hello%GGworld')
    expect(output).toBe('')
    expect(error).toBeTruthy()
    expect(error).toContain('valid encoded URL')
  })

  it('decodes %2F as /', () => {
    const { output } = decodeUrl('path%2Fto%2Fresource')
    expect(output).toBe('path/to/resource')
  })
})
