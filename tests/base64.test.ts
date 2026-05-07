import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64 } from '~/utils/base64'

describe('encodeBase64', () => {
  it('encodes plain ASCII text correctly', () => {
    const { output, error } = encodeBase64('Hello, World!')
    expect(error).toBeNull()
    expect(output).toBe('SGVsbG8sIFdvcmxkIQ==')
  })

  it('encodes Unicode text correctly', () => {
    const { output, error } = encodeBase64('café')
    expect(error).toBeNull()
    expect(output).toBeTruthy()
    // round-trip: decoding the encoded value should give back the original
    const decoded = decodeBase64(output)
    expect(decoded.output).toBe('café')
  })

  it('returns empty output for empty input', () => {
    const { output, error } = encodeBase64('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('handles emoji correctly via round-trip', () => {
    const { output, error } = encodeBase64('🚀')
    expect(error).toBeNull()
    const decoded = decodeBase64(output)
    expect(decoded.output).toBe('🚀')
  })
})

describe('decodeBase64', () => {
  it('decodes valid Base64 to correct plain text', () => {
    const { output, error } = decodeBase64('SGVsbG8sIFdvcmxkIQ==')
    expect(error).toBeNull()
    expect(output).toBe('Hello, World!')
  })

  it('decodes padded Base64 with whitespace trimmed', () => {
    const { output, error } = decodeBase64('  SGVsbG8=  ')
    expect(error).toBeNull()
    expect(output).toBe('Hello')
  })

  it('returns empty output for empty input', () => {
    const { output, error } = decodeBase64('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('returns an error for invalid Base64', () => {
    const { output, error } = decodeBase64('not!!!valid%%%base64')
    expect(output).toBe('')
    expect(error).toBeTruthy()
    expect(error).toContain("valid Base64")
  })

  it('encodes and decodes roundtrip for multi-line text', () => {
    const original = 'line one\nline two\nline three'
    const { output: encoded } = encodeBase64(original)
    const { output: decoded } = decodeBase64(encoded)
    expect(decoded).toBe(original)
  })
})
