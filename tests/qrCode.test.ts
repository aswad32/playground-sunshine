import { describe, it, expect } from 'vitest'
import { generateQRCode } from '../app/utils/qrCode'

describe('generateQRCode', () => {
  it('returns null dataUrl and no error for empty input', async () => {
    const result = await generateQRCode('')
    expect(result.dataUrl).toBeNull()
    expect(result.error).toBeNull()
  })

  it('returns null dataUrl and no error for whitespace-only input', async () => {
    const result = await generateQRCode('   ')
    expect(result.dataUrl).toBeNull()
    expect(result.error).toBeNull()
  })

  it('generates a data URL for a valid URL', async () => {
    const result = await generateQRCode('https://example.com')
    expect(result.error).toBeNull()
    expect(result.dataUrl).not.toBeNull()
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('generates a data URL for plain text', async () => {
    const result = await generateQRCode('Hello, world!')
    expect(result.error).toBeNull()
    expect(result.dataUrl).not.toBeNull()
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('returns an error for input exceeding max length', async () => {
    const longInput = 'a'.repeat(5000)
    const result = await generateQRCode(longInput)
    expect(result.dataUrl).toBeNull()
    expect(result.error).toBe('The input is too long to encode. Try shortening it.')
  })

  it('produces a non-empty PNG data URL', async () => {
    const result = await generateQRCode('https://example.com/test')
    expect(result.dataUrl!.length).toBeGreaterThan(100)
  })

  it('generates different QR codes for different inputs', async () => {
    const r1 = await generateQRCode('https://example.com')
    const r2 = await generateQRCode('https://other.org')
    expect(r1.dataUrl).not.toBe(r2.dataUrl)
  })
})
