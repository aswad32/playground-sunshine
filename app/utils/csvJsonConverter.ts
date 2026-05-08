import Papa from 'papaparse'

export type ConversionDirection = 'csv-to-json' | 'json-to-csv'

export interface ConversionResult {
  output: string
  error: string | null
}

export function csvToJson(input: string): ConversionResult {
  if (!input.trim()) return { output: '', error: null }

  const result = Papa.parse<Record<string, string>>(input.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    return { output: '', error: result.errors[0].message }
  }

  // Collect all field names from the header
  const fields = result.meta.fields ?? []

  // Normalize: fill missing fields with empty string
  const normalized = result.data.map((row) => {
    const filled: Record<string, string> = {}
    for (const field of fields) {
      filled[field] = row[field] ?? ''
    }
    return filled
  })

  return { output: JSON.stringify(normalized, null, 2), error: null }
}

export function jsonToCsv(input: string): ConversionResult {
  if (!input.trim()) return { output: '', error: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(input.trim())
  } catch {
    return {
      output: '',
      error: "This doesn't look like valid JSON. Make sure it's a JSON array of objects.",
    }
  }

  if (!Array.isArray(parsed)) {
    return {
      output: '',
      error: 'JSON → CSV conversion expects a JSON array of objects.',
    }
  }

  if (parsed.length === 0) {
    return { output: '', error: null }
  }

  const result = Papa.unparse(parsed as object[])
  return { output: result, error: null }
}

export function convert(input: string, direction: ConversionDirection): ConversionResult {
  if (direction === 'csv-to-json') return csvToJson(input)
  return jsonToCsv(input)
}
