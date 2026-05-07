export interface Base64Result {
  output: string
  error: string | null
}

export function encodeBase64(input: string): Base64Result {
  if (!input) return { output: '', error: null }

  try {
    const bytes = new TextEncoder().encode(input)
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('')
    return { output: btoa(binary), error: null }
  } catch {
    return { output: '', error: 'Failed to encode input.' }
  }
}

export function decodeBase64(input: string): Base64Result {
  if (!input) return { output: '', error: null }

  try {
    const binary = atob(input.trim())
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const decoded = new TextDecoder().decode(bytes)
    return { output: decoded, error: null }
  } catch {
    return {
      output: '',
      error:
        "This doesn't look like valid Base64. Check for invalid characters or incorrect padding.",
    }
  }
}
