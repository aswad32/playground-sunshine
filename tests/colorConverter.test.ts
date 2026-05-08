import { describe, it, expect } from 'vitest'
import {
  parseHex, rgbToHex, parseRgb, formatRgb, parseHsl, formatHsl, parseHsb, formatHsb,
  rgbToHsl, hslToRgb, rgbToHsb, hsbToRgb, rgbToAllFormats,
} from '../app/utils/colorConverter'

describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('expands 3-digit hex to 6-digit', () => {
    expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('parses without leading #', () => {
    expect(parseHex('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns null for invalid hex', () => {
    expect(parseHex('#GGGGGG')).toBeNull()
    expect(parseHex('notahex')).toBeNull()
  })
})

describe('rgbToHex', () => {
  it('formats red as #FF0000', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000')
  })

  it('formats black as #000000', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('outputs uppercase', () => {
    expect(rgbToHex({ r: 26, g: 43, b: 60 })).toMatch(/^#[0-9A-F]{6}$/)
  })
})

describe('parseRgb', () => {
  it('parses "rgb(26, 43, 60)"', () => {
    expect(parseRgb('rgb(26, 43, 60)')).toEqual({ r: 26, g: 43, b: 60 })
  })

  it('parses "26, 43, 60" without wrapper', () => {
    expect(parseRgb('26, 43, 60')).toEqual({ r: 26, g: 43, b: 60 })
  })

  it('returns null for value > 255', () => {
    expect(parseRgb('rgb(300, 0, 0)')).toBeNull()
  })

  it('returns null for invalid input', () => {
    expect(parseRgb('not a color')).toBeNull()
  })
})

describe('rgbToHsl / hslToRgb', () => {
  it('converts red correctly', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 })
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts black correctly', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 0 })
    expect(hsl.l).toBe(0)
    expect(hsl.s).toBe(0)
  })

  it('converts white correctly', () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 })
    expect(hsl.l).toBe(100)
  })

  it('round-trips through HSL', () => {
    const original = { r: 59, g: 130, b: 246 }
    const rgb = hslToRgb(rgbToHsl(original))
    expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(1)
  })
})

describe('rgbToHsb / hsbToRgb', () => {
  it('converts red correctly', () => {
    const hsb = rgbToHsb({ r: 255, g: 0, b: 0 })
    expect(hsb.h).toBe(0)
    expect(hsb.s).toBe(100)
    expect(hsb.b).toBe(100)
  })

  it('converts black correctly', () => {
    const hsb = rgbToHsb({ r: 0, g: 0, b: 0 })
    expect(hsb.b).toBe(0)
  })

  it('converts white correctly', () => {
    const hsb = rgbToHsb({ r: 255, g: 255, b: 255 })
    expect(hsb.s).toBe(0)
    expect(hsb.b).toBe(100)
  })

  it('round-trips through HSB', () => {
    const original = { r: 59, g: 130, b: 246 }
    const rgb = hsbToRgb(rgbToHsb(original))
    expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(1)
  })
})

describe('rgbToAllFormats', () => {
  it('converts #FF0000 to all formats', () => {
    const rgb = { r: 255, g: 0, b: 0 }
    const result = rgbToAllFormats(rgb)
    expect(result.hex).toBe('#FF0000')
    expect(result.rgb).toBe('rgb(255, 0, 0)')
    expect(result.hsl).toBe('hsl(0, 100%, 50%)')
    expect(result.hsb).toBe('hsb(0, 100%, 100%)')
  })

  it('converts black to all formats', () => {
    const result = rgbToAllFormats({ r: 0, g: 0, b: 0 })
    expect(result.hex).toBe('#000000')
    expect(result.hsl).toBe('hsl(0, 0%, 0%)')
    expect(result.hsb).toBe('hsb(0, 0%, 0%)')
  })

  it('converts white to all formats', () => {
    const result = rgbToAllFormats({ r: 255, g: 255, b: 255 })
    expect(result.hex).toBe('#FFFFFF')
    expect(result.hsl).toBe('hsl(0, 0%, 100%)')
    expect(result.hsb).toBe('hsb(0, 0%, 100%)')
  })

  it('#3B82F6 round-trips correctly', () => {
    const rgb = parseHex('#3B82F6')!
    const formats = rgbToAllFormats(rgb)
    const roundTripped = parseHex(formats.hex)
    expect(roundTripped).toEqual(rgb)
  })
})
