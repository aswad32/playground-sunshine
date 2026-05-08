/**
 * Tokenise an arbitrary string into lowercase word tokens.
 *
 * Splits on:
 * - Whitespace
 * - Underscores
 * - Hyphens
 * - camelCase / PascalCase transitions (lowercase→uppercase boundary)
 * - Uppercase sequences followed by a lowercase letter (e.g. "XMLParser" → ["XML", "Parser"])
 *
 * Non-alphanumeric characters (other than the separators above) are stripped.
 * Consecutive separators collapse into a single boundary.
 * Numbers are treated as part of the adjacent token.
 */
export function tokenise(input: string): string[] {
  // Insert a space before uppercase letters that follow a lowercase letter or digit
  // e.g. "helloWorld" → "hello World", "base64Encoder" → "base64 Encoder"
  const spaced = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // "XMLParser" → "XML Parser"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')

  // Split on whitespace, underscores, hyphens; strip non-alphanumeric chars
  const raw = spaced.split(/[\s_\-]+/)

  const tokens: string[] = []
  for (const part of raw) {
    const clean = part.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    if (clean.length > 0) tokens.push(clean)
  }
  return tokens
}

export function toCamelCase(input: string): string {
  const words = tokenise(input)
  if (words.length === 0) return ''
  return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

export function toPascalCase(input: string): string {
  return tokenise(input)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

export function toSnakeCase(input: string): string {
  return tokenise(input).join('_')
}

export function toKebabCase(input: string): string {
  return tokenise(input).join('-')
}

export function toScreamingSnakeCase(input: string): string {
  return tokenise(input).join('_').toUpperCase()
}

export function toTitleCase(input: string): string {
  return tokenise(input)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export interface CaseConversions {
  camel: string
  pascal: string
  snake: string
  kebab: string
  screaming: string
  title: string
}

export function convertAllCases(input: string): CaseConversions {
  return {
    camel: toCamelCase(input),
    pascal: toPascalCase(input),
    snake: toSnakeCase(input),
    kebab: toKebabCase(input),
    screaming: toScreamingSnakeCase(input),
    title: toTitleCase(input),
  }
}
