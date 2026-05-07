import { describe, it, expect } from 'vitest'
import { computeDiff, diffToText } from '../app/utils/textDiff'

describe('computeDiff', () => {
  it('returns identical=true and no additions/removals for equal strings', () => {
    const result = computeDiff('hello\nworld\n', 'hello\nworld\n')
    expect(result.identical).toBe(true)
    expect(result.additions).toBe(0)
    expect(result.removals).toBe(0)
  })

  it('returns identical=true for two empty strings', () => {
    const result = computeDiff('', '')
    expect(result.identical).toBe(true)
    expect(result.lines).toHaveLength(0)
  })

  it('detects added lines', () => {
    const result = computeDiff('hello\n', 'hello\nworld\n')
    expect(result.additions).toBe(1)
    expect(result.removals).toBe(0)
    const added = result.lines.filter((l) => l.type === 'added')
    expect(added).toHaveLength(1)
    expect(added[0].value).toBe('world')
  })

  it('detects removed lines', () => {
    const result = computeDiff('hello\nworld\n', 'hello\n')
    expect(result.removals).toBe(1)
    expect(result.additions).toBe(0)
    const removed = result.lines.filter((l) => l.type === 'removed')
    expect(removed).toHaveLength(1)
    expect(removed[0].value).toBe('world')
  })

  it('handles mixed additions and removals', () => {
    const result = computeDiff('hello\nworld\n', 'hello\nearth\n')
    expect(result.additions).toBe(1)
    expect(result.removals).toBe(1)
  })

  it('treats empty original as all lines added', () => {
    const result = computeDiff('', 'line1\nline2\n')
    expect(result.additions).toBe(2)
    expect(result.removals).toBe(0)
    result.lines.forEach((l) => expect(l.type).toBe('added'))
  })

  it('treats empty modified as all lines removed', () => {
    const result = computeDiff('line1\nline2\n', '')
    expect(result.removals).toBe(2)
    expect(result.additions).toBe(0)
    result.lines.forEach((l) => expect(l.type).toBe('removed'))
  })

  it('addition and removal counts match summary', () => {
    const result = computeDiff('a\nb\nc\n', 'a\nx\ny\n')
    const countAdded = result.lines.filter((l) => l.type === 'added').length
    const countRemoved = result.lines.filter((l) => l.type === 'removed').length
    expect(countAdded).toBe(result.additions)
    expect(countRemoved).toBe(result.removals)
  })
})

describe('diffToText', () => {
  it('prefixes added lines with "+"', () => {
    const result = computeDiff('', 'hello\n')
    const text = diffToText(result)
    expect(text).toContain('+ hello')
  })

  it('prefixes removed lines with "-"', () => {
    const result = computeDiff('hello\n', '')
    const text = diffToText(result)
    expect(text).toContain('- hello')
  })

  it('prefixes unchanged lines with double space', () => {
    const result = computeDiff('same\n', 'same\n')
    const text = diffToText(result)
    expect(text).toContain('  same')
  })
})
