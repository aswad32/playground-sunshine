import { describe, it, expect, vi, beforeAll } from 'vitest'
import { isSupported, formatBytes, compressImage, SUPPORTED_TYPES } from '../app/utils/imageCompressor'

// ── Helpers ────────────────────────────────────────────────────────────────────

describe('isSupported', () => {
  it('returns true for image/jpeg', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    expect(isSupported(file)).toBe(true)
  })

  it('returns true for image/png', () => {
    const file = new File([''], 'icon.png', { type: 'image/png' })
    expect(isSupported(file)).toBe(true)
  })

  it('returns true for image/webp', () => {
    const file = new File([''], 'img.webp', { type: 'image/webp' })
    expect(isSupported(file)).toBe(true)
  })

  it('returns false for image/gif', () => {
    const file = new File([''], 'anim.gif', { type: 'image/gif' })
    expect(isSupported(file)).toBe(false)
  })

  it('returns false for application/pdf', () => {
    const file = new File([''], 'doc.pdf', { type: 'application/pdf' })
    expect(isSupported(file)).toBe(false)
  })
})

describe('formatBytes', () => {
  it('formats bytes below 1 KB', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(2048)).toBe('2.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.50 MB')
  })

  it('formats exact 1 KB boundary', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })
})

// ── compressImage error paths ──────────────────────────────────────────────────

describe('compressImage error handling', () => {
  it('returns error for unsupported file type', async () => {
    const file = new File(['gif data'], 'anim.gif', { type: 'image/gif' })
    const result = await compressImage({
      file,
      quality: 0.8,
      maintainAspectRatio: true,
    })
    expect(result.blob).toBeNull()
    expect(result.error).toBe('Please upload a JPEG, PNG, or WebP image.')
  })

  it('returns error for zero target width', async () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await compressImage({
      file,
      quality: 0.8,
      targetWidth: 0,
      maintainAspectRatio: true,
    })
    expect(result.blob).toBeNull()
    expect(result.error).toBe('Please enter valid dimensions.')
  })

  it('returns error for negative target height', async () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await compressImage({
      file,
      quality: 0.8,
      targetHeight: -100,
      maintainAspectRatio: true,
    })
    expect(result.blob).toBeNull()
    expect(result.error).toBe('Please enter valid dimensions.')
  })

  it('includes original file size even on error', async () => {
    const data = new Uint8Array(5000)
    const file = new File([data], 'anim.gif', { type: 'image/gif' })
    const result = await compressImage({
      file,
      quality: 0.8,
      maintainAspectRatio: true,
    })
    expect(result.originalSize).toBe(5000)
  })
})

describe('SUPPORTED_TYPES', () => {
  it('includes jpeg, png, and webp', () => {
    expect(SUPPORTED_TYPES).toContain('image/jpeg')
    expect(SUPPORTED_TYPES).toContain('image/png')
    expect(SUPPORTED_TYPES).toContain('image/webp')
  })
})
