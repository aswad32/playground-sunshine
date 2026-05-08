const ENCODE_MAP: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
]

export function encodeHtmlEntities(input: string): string {
  if (!input) return ''
  let result = input
  for (const [pattern, entity] of ENCODE_MAP) {
    result = result.replace(pattern, entity)
  }
  return result
}

export function decodeHtmlEntities(input: string): { output: string; hadUnknown: boolean } {
  if (!input) return { output: '', hadUnknown: false }

  // Use a textarea element to leverage the browser's native entity decoding
  const textarea = document.createElement('textarea')
  textarea.innerHTML = input
  const decoded = textarea.value

  // Check if any entities remain undecoded (e.g. &invalidEntity; stays as-is after innerHTML assignment)
  const hadUnknown = /&[a-zA-Z][a-zA-Z0-9]*;/.test(decoded)

  return { output: decoded, hadUnknown }
}
