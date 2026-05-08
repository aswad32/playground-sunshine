export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }
export interface HSB { h: number; s: number; b: number }

// ── HEX ──────────────────────────────────────────────────────────────────────

export function parseHex(input: string): RGB | null {
  const cleaned = input.trim().replace(/^#/, '')
  let hex = cleaned
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const hex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

// ── RGB ──────────────────────────────────────────────────────────────────────

export function parseRgb(input: string): RGB | null {
  // Accepts: "rgb(26, 43, 60)" or "26, 43, 60" or "26 43 60"
  const stripped = input.trim().replace(/^rgb\s*\(/i, '').replace(/\)\s*$/, '')
  const parts = stripped.split(/[\s,]+/).filter(Boolean)
  if (parts.length !== 3) return null
  const [r, g, b] = parts.map(Number)
  if ([r, g, b].some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return { r, g, b }
}

export function formatRgb({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`
}

// ── HSL ──────────────────────────────────────────────────────────────────────

export function parseHsl(input: string): HSL | null {
  const stripped = input.trim().replace(/^hsl\s*\(/i, '').replace(/\)\s*$/, '')
  const parts = stripped.split(/[\s,]+/).map(p => p.replace('%', '')).filter(Boolean)
  if (parts.length !== 3) return null
  const [h, s, l] = parts.map(Number)
  if (isNaN(h) || isNaN(s) || isNaN(l)) return null
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null
  return { h, s, l }
}

export function formatHsl({ h, s, l }: HSL): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

// ── HSB ──────────────────────────────────────────────────────────────────────

export function parseHsb(input: string): HSB | null {
  const stripped = input.trim().replace(/^hsb\s*\(/i, '').replace(/\)\s*$/, '')
  const parts = stripped.split(/[\s,]+/).map(p => p.replace('%', '')).filter(Boolean)
  if (parts.length !== 3) return null
  const [h, s, b] = parts.map(Number)
  if (isNaN(h) || isNaN(s) || isNaN(b)) return null
  if (h < 0 || h > 360 || s < 0 || s > 100 || b < 0 || b > 100) return null
  return { h, s, b }
}

export function formatHsb({ h, s, b }: HSB): string {
  return `hsb(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(b)}%)`
}

// ── Conversion functions ──────────────────────────────────────────────────────

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export function rgbToHsb({ r, g, b }: RGB): HSB {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const bv = max
  const s = max === 0 ? 0 : (max - min) / max
  let h = 0
  if (max !== min) {
    const d = max - min
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), b: Math.round(bv * 100) }
}

export function hsbToRgb({ h, s, b }: HSB): RGB {
  const sn = s / 100, bn = b / 100
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = bn * (1 - sn)
  const q = bn * (1 - f * sn)
  const t = bn * (1 - (1 - f) * sn)
  let r = 0, g = 0, bv = 0
  if (i === 0) { r = bn; g = t; bv = p }
  else if (i === 1) { r = q; g = bn; bv = p }
  else if (i === 2) { r = p; g = bn; bv = t }
  else if (i === 3) { r = p; g = q; bv = bn }
  else if (i === 4) { r = t; g = p; bv = bn }
  else { r = bn; g = p; bv = q }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(bv * 255) }
}

// ── All formats from RGB ──────────────────────────────────────────────────────

export interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hsb: string
}

export function rgbToAllFormats(rgb: RGB): ColorFormats {
  return {
    hex: rgbToHex(rgb),
    rgb: formatRgb(rgb),
    hsl: formatHsl(rgbToHsl(rgb)),
    hsb: formatHsb(rgbToHsb(rgb)),
  }
}
