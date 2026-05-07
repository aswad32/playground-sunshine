import { describe, it, expect } from 'vitest'
import { testRegex } from '~/utils/regexTester'

describe('testRegex', () => {
  it('matches a simple pattern', () => {
    const { matches, error } = testRegex('hello', 'g', 'say hello world')
    expect(error).toBeNull()
    expect(matches).toHaveLength(1)
    expect(matches[0].value).toBe('hello')
    expect(matches[0].index).toBe(4)
  })

  it('global flag returns all matches', () => {
    const { matches, error } = testRegex('\\d+', 'g', 'abc 123 def 456 ghi 789')
    expect(error).toBeNull()
    expect(matches).toHaveLength(3)
    expect(matches.map((m) => m.value)).toEqual(['123', '456', '789'])
  })

  it('without global flag returns only first match', () => {
    const { matches } = testRegex('\\d+', '', 'abc 123 def 456')
    expect(matches).toHaveLength(1)
    expect(matches[0].value).toBe('123')
  })

  it('case-insensitive flag works correctly', () => {
    const { matches } = testRegex('hello', 'gi', 'Hello HELLO hello')
    expect(matches).toHaveLength(3)
  })

  it('numbered capture groups are included', () => {
    const { matches } = testRegex('(\\d{4})-(\\d{2})-(\\d{2})', 'g', '2026-05-07')
    expect(matches).toHaveLength(1)
    expect(matches[0].numberedGroups).toEqual(['2026', '05', '07'])
  })

  it('named capture groups are shown correctly', () => {
    const { matches } = testRegex('(?<year>\\d{4})-(?<month>\\d{2})', 'g', '2026-05')
    expect(matches).toHaveLength(1)
    expect(matches[0].namedGroups).toEqual({ year: '2026', month: '05' })
  })

  it('returns an error for an invalid regex pattern', () => {
    const { matches, error } = testRegex('[invalid', 'g', 'test')
    expect(matches).toHaveLength(0)
    expect(error).toBeTruthy()
    expect(error).toContain('valid regular expression')
  })

  it('returns empty for empty pattern', () => {
    const { matches, error } = testRegex('', 'g', 'hello world')
    expect(error).toBeNull()
    expect(matches).toHaveLength(0)
  })

  it('builds correct segments for highlighting', () => {
    const { segments } = testRegex('\\d+', 'g', 'abc 123 def')
    expect(segments).toEqual([
      { text: 'abc ', matched: false },
      { text: '123', matched: true },
      { text: ' def', matched: false },
    ])
  })

  it('multiline flag matches ^ and $ per line', () => {
    const { matches } = testRegex('^line', 'gm', 'line one\nline two\nother')
    expect(matches).toHaveLength(2)
  })
})
