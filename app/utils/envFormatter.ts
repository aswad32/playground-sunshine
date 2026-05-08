export interface EnvWarning {
  line: number
  message: string
}

export interface EnvResult {
  output: string
  warnings: EnvWarning[]
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
