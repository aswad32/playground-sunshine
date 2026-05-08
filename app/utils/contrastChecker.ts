import { parseHex, type RGB } from './colorConverter'

export { parseHex }

/**
 * Calculate relative luminance per WCAG 2.1:
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function linearize(channel: number): number {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: RGB): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

export function contrastRatio(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface WcagResult {
  ratio: number
  ratioLabel: string
  aa: {
    normalText: boolean  // ≥ 4.5 : 1
    largeText: boolean   // ≥ 3 : 1
    uiComponents: boolean // ≥ 3 : 1
  }
  aaa: {
    normalText: boolean  // ≥ 7 : 1
    largeText: boolean   // ≥ 4.5 : 1
  }
}

export function checkContrast(fg: RGB, bg: RGB): WcagResult {
  const ratio = contrastRatio(fg, bg)
  return {
    ratio,
    ratioLabel: `${ratio.toFixed(2)} : 1`,
    aa: {
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
      uiComponents: ratio >= 3,
    },
    aaa: {
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
    },
  }
}
