import { diffLines } from 'diff'

export type DiffLineType = 'added' | 'removed' | 'unchanged'

export interface DiffLine {
  type: DiffLineType
  value: string
  lineNumber: number | null
}

export interface DiffResult {
  lines: DiffLine[]
  additions: number
  removals: number
  identical: boolean
}

export function computeDiff(original: string, modified: string): DiffResult {
  const hunks = diffLines(original, modified)

  const lines: DiffLine[] = []
  let additions = 0
  let removals = 0
  let lineNumber = 1

  for (const hunk of hunks) {
    const hunkLines = hunk.value.replace(/\n$/, '').split('\n')

    for (const value of hunkLines) {
      if (hunk.added) {
        lines.push({ type: 'added', value, lineNumber: null })
        additions++
      } else if (hunk.removed) {
        lines.push({ type: 'removed', value, lineNumber: lineNumber++ })
        removals++
      } else {
        lines.push({ type: 'unchanged', value, lineNumber: lineNumber++ })
      }
    }
  }

  return {
    lines,
    additions,
    removals,
    identical: additions === 0 && removals === 0,
  }
}

export function diffToText(result: DiffResult): string {
  return result.lines
    .map((l) => {
      if (l.type === 'added') return `+ ${l.value}`
      if (l.type === 'removed') return `- ${l.value}`
      return `  ${l.value}`
    })
    .join('\n')
}
