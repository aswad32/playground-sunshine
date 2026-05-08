export interface EnvWarning {
  line: number
  message: string
}

export interface EnvResult {
  output: string
  warnings: EnvWarning[]
}

export type ConvertTarget = 'env' | 'json' | 'docker' | 'github-actions' | 'env-example'

export interface CompareResult {
  missing: string[]   // in .env.example but not in .env
  extra: string[]     // in .env but not in .env.example
  matching: string[]  // in both
}

type LineData =
  | { type: 'blank' }
  | { type: 'comment'; raw: string }
  | { type: 'kv'; key: string; value: string }
  | { type: 'invalid'; raw: string }

// KEY must start with letter or underscore, followed by letters, digits, or underscores
const KV_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)/

function parseLine(raw: string): LineData {
  const trimmed = raw.trim()
  if (trimmed === '') return { type: 'blank' }
  if (trimmed.startsWith('#')) return { type: 'comment', raw: trimmed }
  const match = trimmed.match(KV_PATTERN)
  if (match) return { type: 'kv', key: match[1], value: match[2] }
  return { type: 'invalid', raw: trimmed }
}

function serializeLine(line: LineData): string {
  if (line.type === 'blank') return ''
  if (line.type === 'comment') return line.raw
  if (line.type === 'kv') return `${line.key}=${line.value}`
  return line.raw
}

export function formatEnv(input: string, sortAlpha = false): EnvResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', warnings: [] }

  const rawLines = trimmed.split('\n')
  const lineData: LineData[] = rawLines.map((l) => parseLine(l))
  const warnings: EnvWarning[] = []

  // Flag invalid lines
  lineData.forEach((line, i) => {
    if (line.type === 'invalid') {
      warnings.push({
        line: i + 1,
        message: `Line ${i + 1}: \`${line.raw}\` does not look like a valid KEY=VALUE pair.`,
      })
    }
  })

  // Detect duplicate keys
  const keyLines = new Map<string, number[]>()
  lineData.forEach((line, i) => {
    if (line.type === 'kv') {
      const existing = keyLines.get(line.key) ?? []
      existing.push(i + 1)
      keyLines.set(line.key, existing)
    }
  })
  keyLines.forEach((lines, key) => {
    if (lines.length > 1) {
      warnings.push({
        line: lines[0],
        message: `Duplicate key detected: \`${key}\` (lines ${lines.join(' and ')}). Only the last value will take effect.`,
      })
    }
  })

  // Sort key-value pairs alphabetically in-place, preserving blank/comment positions
  if (sortAlpha) {
    const kvIndices = lineData
      .map((l, i) => (l.type === 'kv' ? i : -1))
      .filter((i) => i >= 0)
    const sorted = kvIndices
      .map((i) => lineData[i] as Extract<LineData, { type: 'kv' }>)
      .sort((a, b) => a.key.localeCompare(b.key))
    kvIndices.forEach((origIdx, pos) => {
      lineData[origIdx] = sorted[pos]
    })
  }

  return { output: lineData.map(serializeLine).join('\n'), warnings }
}

/** Strip surrounding single or double quotes from a value string. */
function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

/** Parse an env string into an ordered list of kv pairs (comments/blanks excluded). */
function extractKvPairs(input: string): { key: string; value: string }[] {
  return input
    .trim()
    .split('\n')
    .map((l) => parseLine(l))
    .filter((l): l is Extract<LineData, { type: 'kv' }> => l.type === 'kv')
}

export function convertEnv(input: string, target: ConvertTarget, sortAlpha = false): EnvResult {
  if (target === 'env') return formatEnv(input, sortAlpha)

  const trimmed = input.trim()
  if (!trimmed) return { output: '', warnings: [] }

  const { warnings } = formatEnv(trimmed)
  let pairs = extractKvPairs(trimmed)

  if (sortAlpha) {
    pairs = [...pairs].sort((a, b) => a.key.localeCompare(b.key))
  }

  if (target === 'json') {
    const obj: Record<string, string> = {}
    for (const { key, value } of pairs) obj[key] = unquote(value)
    return { output: JSON.stringify(obj, null, 2), warnings }
  }

  if (target === 'docker') {
    const lines = ['environment:']
    for (const { key, value } of pairs) lines.push(`  - ${key}=${unquote(value)}`)
    return { output: lines.join('\n'), warnings }
  }

  if (target === 'github-actions') {
    const lines = ['env:']
    for (const { key, value } of pairs) {
      const raw = unquote(value)
      const needsQuotes = raw.includes(':') || raw.includes('#') || raw !== raw.trim()
      lines.push(`  ${key}: ${needsQuotes ? `"${raw}"` : raw}`)
    }
    return { output: lines.join('\n'), warnings }
  }

  if (target === 'env-example') {
    const rawLines = trimmed.split('\n')
    const result = rawLines.map((l) => {
      const parsed = parseLine(l)
      if (parsed.type === 'kv') return `${parsed.key}=`
      return serializeLine(parsed)
    })
    return { output: result.join('\n'), warnings }
  }

  return { output: '', warnings }
}

export function compareEnv(envInput: string, exampleInput: string): CompareResult {
  const envKeys = new Set(extractKvPairs(envInput).map((p) => p.key))
  const exampleKeys = new Set(extractKvPairs(exampleInput).map((p) => p.key))

  const missing = [...exampleKeys].filter((k) => !envKeys.has(k))
  const extra = [...envKeys].filter((k) => !exampleKeys.has(k))
  const matching = [...envKeys].filter((k) => exampleKeys.has(k))

  return { missing, extra, matching }
}
