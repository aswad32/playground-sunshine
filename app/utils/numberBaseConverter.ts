export type Base = 2 | 8 | 10 | 16

export interface ConversionResult {
  binary: string
  octal: string
  decimal: string
  hex: string
  error: string | null
}

const BASE_PATTERNS: Record<Base, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
}

const BASE_LABELS: Record<Base, string> = {
  2: 'binary',
  8: 'octal',
  10: 'decimal',
  16: 'hexadecimal',
}

export function convertBase(value: string, fromBase: Base): ConversionResult {
  const empty: ConversionResult = { binary: '', octal: '', decimal: '', hex: '', error: null }

  if (!value.trim()) return empty

  if (!BASE_PATTERNS[fromBase].test(value)) {
    return { ...empty, error: `Invalid character for base ${fromBase} (${BASE_LABELS[fromBase]}).` }
  }

  const decimal = parseInt(value, fromBase)

  if (!Number.isFinite(decimal)) {
    return { ...empty, error: 'Could not parse this value.' }
  }

  if (decimal > Number.MAX_SAFE_INTEGER) {
    return { ...empty, error: 'Number too large for safe integer conversion.' }
  }

  return {
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
    error: null,
  }
}
