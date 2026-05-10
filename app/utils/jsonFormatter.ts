export interface FormatResult {
  output: string
  error: string | null
}

// Attempt to fix common non-standard JSON before parsing:
// - unquoted object keys: { color: "red" } → { "color": "red" }
// - trailing commas:      [1, 2,]          → [1, 2]
function relaxJson(input: string): string {
  return input
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1')
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch {
    return JSON.parse(relaxJson(input))
  }
}

export function sortTopLevelKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value
  return Object.keys(value as object)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (value as Record<string, unknown>)[key]
      return acc
    }, {})
}

export function formatJson(input: string, options?: { sortKeys?: boolean }): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', error: null }

  try {
    let parsed = parseJson(trimmed)
    if (options?.sortKeys) parsed = sortTopLevelKeys(parsed)
    return { output: JSON.stringify(parsed, null, 2), error: null }
  } catch {
    return {
      output: '',
      error: 'This does not look like valid JSON. Check for missing quotes, commas, or brackets.',
    }
  }
}

export function minifyJson(input: string, options?: { sortKeys?: boolean }): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', error: null }

  try {
    let parsed = parseJson(trimmed)
    if (options?.sortKeys) parsed = sortTopLevelKeys(parsed)
    return { output: JSON.stringify(parsed), error: null }
  } catch {
    return {
      output: '',
      error: 'This does not look like valid JSON. Check for missing quotes, commas, or brackets.',
    }
  }
}
