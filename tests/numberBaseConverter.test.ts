import { describe, expect, it } from 'vitest'
import { convertBase } from '~/utils/numberBaseConverter'

describe('convertBase', () => {
  it('returns empty fields for empty input', () => {
    const result = convertBase('', 10)
    expect(result.binary).toBe('')
    expect(result.octal).toBe('')
    expect(result.decimal).toBe('')
    expect(result.hex).toBe('')
    expect(result.error).toBeNull()
  })

  it('converts 255 decimal to all bases', () => {
    const result = convertBase('255', 10)
    expect(result.binary).toBe('11111111')
    expect(result.octal).toBe('377')
    expect(result.decimal).toBe('255')
    expect(result.hex).toBe('FF')
    expect(result.error).toBeNull()
  })

  it('converts 0 correctly in all bases', () => {
    const result = convertBase('0', 10)
    expect(result.binary).toBe('0')
    expect(result.octal).toBe('0')
    expect(result.decimal).toBe('0')
    expect(result.hex).toBe('0')
  })

  it('converts FF hex to 255 decimal', () => {
    const result = convertBase('FF', 16)
    expect(result.decimal).toBe('255')
    expect(result.binary).toBe('11111111')
  })

  it('converts lowercase ff hex to 255 decimal', () => {
    const result = convertBase('ff', 16)
    expect(result.decimal).toBe('255')
  })

  it('converts 10 binary to 2 decimal', () => {
    const result = convertBase('10', 2)
    expect(result.decimal).toBe('2')
  })

  it('converts 377 octal to 255 decimal', () => {
    const result = convertBase('377', 8)
    expect(result.decimal).toBe('255')
    expect(result.hex).toBe('FF')
  })

  it('hex output is always uppercase', () => {
    const result = convertBase('255', 10)
    expect(result.hex).toBe(result.hex.toUpperCase())
  })

  it('returns error for invalid binary character', () => {
    const result = convertBase('9', 2)
    expect(result.error).toBeTruthy()
    expect(result.error).toContain('Invalid character for base 2')
    expect(result.binary).toBe('')
  })

  it('returns error for invalid octal character', () => {
    const result = convertBase('9', 8)
    expect(result.error).toBeTruthy()
    expect(result.error).toContain('Invalid character for base 8')
  })

  it('returns error for invalid hex character', () => {
    const result = convertBase('GG', 16)
    expect(result.error).toBeTruthy()
  })

  it('returns error for number above MAX_SAFE_INTEGER', () => {
    const result = convertBase('9007199254740992', 10) // MAX_SAFE_INTEGER + 1
    expect(result.error).toContain('too large')
  })
})
