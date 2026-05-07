export interface UrlResult {
  output: string
  error: string | null
}

export function encodeUrl(input: string): UrlResult {
  if (!input) return { output: '', error: null }

  try {
    return { output: encodeURIComponent(input), error: null }
  } catch {
    return { output: '', error: 'Failed to encode input.' }
  }
}

export function decodeUrl(input: string): UrlResult {
  if (!input) return { output: '', error: null }

  try {
    return { output: decodeURIComponent(input), error: null }
  } catch {
    return {
      output: '',
      error:
        "This doesn't look like a valid encoded URL. Check for incomplete percent sequences.",
    }
  }
}
