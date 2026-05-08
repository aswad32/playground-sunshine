import { describe, expect, it } from 'vitest'
import { formatYaml } from '~/utils/yamlFormatter'

describe('formatYaml', () => {
  it('returns empty output for empty input', () => {
    const result = formatYaml('')
    expect(result.output).toBe('')
    expect(result.error).toBeNull()
    expect(result.multiDocWarning).toBe(false)
  })

  it('returns empty output for whitespace-only input', () => {
    const result = formatYaml('   \n  ')
    expect(result.output).toBe('')
    expect(result.error).toBeNull()
  })

  it('formats a simple key-value pair', () => {
    const result = formatYaml('name: Alice')
    expect(result.error).toBeNull()
    expect(result.output).toContain('name: Alice')
  })

  it('formats nested objects with 2-space indentation', () => {
    const input = 'person:\n  name: Alice\n  age: 30'
    const result = formatYaml(input)
    expect(result.error).toBeNull()
    expect(result.output).toMatch(/^person:\n {2}name: Alice\n {2}age: 30/)
  })

  it('formats arrays correctly', () => {
    const input = 'fruits:\n  - apple\n  - banana\n  - cherry'
    const result = formatYaml(input)
    expect(result.error).toBeNull()
    expect(result.output).toContain('fruits:')
    expect(result.output).toContain('- apple')
  })

  it('returns an error for invalid YAML (tab indentation)', () => {
    const input = 'key:\n\tvalue: bad'
    const result = formatYaml(input)
    expect(result.output).toBe('')
    expect(result.error).toBeTruthy()
    expect(result.error).toContain("doesn't look like valid YAML")
  })

  it('returns an error for malformed YAML', () => {
    const result = formatYaml('key: [unclosed')
    expect(result.output).toBe('')
    expect(result.error).toBeTruthy()
  })

  it('output round-trips back to the same structure', () => {
    const input = 'server:\n  host: localhost\n  port: 8080\n  debug: true'
    const result = formatYaml(input)
    expect(result.error).toBeNull()
    const roundTrip = formatYaml(result.output)
    expect(roundTrip.output).toBe(result.output)
  })

  it('detects multi-document YAML and sets multiDocWarning', () => {
    const input = 'key: value\n---\nother: doc'
    const result = formatYaml(input)
    expect(result.multiDocWarning).toBe(true)
  })
})
