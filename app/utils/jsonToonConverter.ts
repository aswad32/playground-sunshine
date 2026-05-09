import { encode, decode, ToonDecodeError } from '@toon-format/toon'

export interface ConversionResult<T> {
  value: T
  error: null
}

export interface ConversionError {
  value: null
  error: string
  detail?: string
}

export type ConversionOutput<T> = ConversionResult<T> | ConversionError

// --- JSON → TOON ---

export function jsonToToon(jsonString: string): ConversionOutput<string> {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return {
      value: null,
      error: "This doesn't look like valid JSON. Check for missing quotes, commas, or brackets.",
    }
  }
  try {
    return { value: encode(parsed), error: null }
  } catch (err) {
    return {
      value: null,
      error: 'Failed to encode JSON as TOON.',
      detail: err instanceof Error ? err.message : String(err),
    }
  }
}

// --- TOON → JSON ---

export function toonToJson(toonString: string): ConversionOutput<string> {
  try {
    const decoded = decode(toonString)
    return { value: JSON.stringify(decoded, null, 2), error: null }
  } catch (err) {
    const detail = err instanceof ToonDecodeError || err instanceof Error
      ? err.message
      : String(err)
    return {
      value: null,
      error: "This doesn't look like valid TOON. Check the format structure.",
      detail,
    }
  }
}

// --- Prompt block ---

export function toPromptBlock(toonString: string): string {
  if (!toonString.trim()) return ''
  return `\`\`\`toon\n${toonString}\n\`\`\``
}

// --- Savings ---

/**
 * Returns percentage of chars saved going from JSON → TOON.
 * Positive = TOON is smaller. Negative = TOON is larger.
 */
export function charSavings(jsonChars: number, toonChars: number): number {
  if (jsonChars === 0) return 0
  return Math.round((1 - toonChars / jsonChars) * 100)
}
