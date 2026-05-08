import { describe, it, expect } from 'vitest'
import { relativeLuminance, contrastRatio, checkContrast } from '../app/utils/contrastChecker'
import { parseHex } from '../app/utils/colorConverter'

const white = parseHex('#FFFFFF')!
const black = parseHex('#000000')!
const red = parseHex('#FF0000')!
const gray = parseHex('#767676')!

describe('relativeLuminance', () => {
  it('black has luminance 0', () => {
    expect(relativeLuminance(black)).toBeCloseTo(0, 5)
  })

  it('white has luminance 1', () => {
    expect(relativeLuminance(white)).toBeCloseTo(1, 5)
  })

  it('red has luminance ≈ 0.2126', () => {
    expect(relativeLuminance(red)).toBeCloseTo(0.2126, 3)
  })
})

describe('contrastRatio', () => {
  it('white on black → 21 : 1', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 1)
  })

  it('white on white → 1 : 1', () => {
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
  })

  it('swapping colors produces same ratio', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(contrastRatio(black, white), 5)
  })
})

describe('checkContrast', () => {
  it('white on black passes all AA and AAA levels', () => {
    const result = checkContrast(white, black)
    expect(result.aa.normalText).toBe(true)
    expect(result.aa.largeText).toBe(true)
    expect(result.aa.uiComponents).toBe(true)
    expect(result.aaa.normalText).toBe(true)
    expect(result.aaa.largeText).toBe(true)
  })

  it('white on white fails all levels', () => {
    const result = checkContrast(white, white)
    expect(result.aa.normalText).toBe(false)
    expect(result.aa.largeText).toBe(false)
    expect(result.aaa.normalText).toBe(false)
    expect(result.aaa.largeText).toBe(false)
  })

  it('#767676 on white: ratio ≈ 4.48, passes AA normal text', () => {
    const result = checkContrast(gray, white)
    expect(result.ratio).toBeGreaterThanOrEqual(4.4)
    expect(result.ratio).toBeLessThan(4.6)
    expect(result.aa.normalText).toBe(true)
    expect(result.aaa.normalText).toBe(false)
  })

  it('formats ratio label correctly', () => {
    const result = checkContrast(white, black)
    expect(result.ratioLabel).toBe('21.00 : 1')
  })
})
