export interface FormatResult {
  output: string
  error: string | null
}

export function formatJson(input: string): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', error: null }

  try {
    const parsed = JSON.parse(trimmed)
    return { output: JSON.stringify(parsed, null, 2), error: null }
  } catch {
    return {
      output: '',
      error: 'This does not look like valid JSON. Check for missing quotes, commas, or brackets.',
    }
  }
}

export function minifyJson(input: string): FormatResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', error: null }

  try {
    const parsed = JSON.parse(trimmed)
    return { output: JSON.stringify(parsed), error: null }
  } catch {
    return {
      output: '',
      error: 'This does not look like valid JSON. Check for missing quotes, commas, or brackets.',
    }
  }
}
