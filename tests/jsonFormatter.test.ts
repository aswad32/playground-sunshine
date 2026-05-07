import { describe, it, expect } from 'vitest'
import { formatJson, minifyJson } from '../app/utils/jsonFormatter'

describe('formatJson', () => {
  it('formats compact JSON with indentation', () => {
    const { output, error } = formatJson('{"name":"Alice","age":30}')
    expect(error).toBeNull()
    expect(output).toBe('{\n  "name": "Alice",\n  "age": 30\n}')
  })

  it('handles already-formatted JSON', () => {
    const input = '{\n  "key": "value"\n}'
    const { output, error } = formatJson(input)
    expect(error).toBeNull()
    expect(JSON.parse(output)).toEqual({ key: 'value' })
  })

  it('returns an error for invalid JSON', () => {
    const { output, error } = formatJson('{name: Alice}')
    expect(output).toBe('')
    expect(error).toContain('does not look like valid JSON')
  })

  it('returns empty output for empty input', () => {
    const { output, error } = formatJson('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('returns empty output for whitespace-only input', () => {
    const { output, error } = formatJson('   ')
    expect(output).toBe('')
    expect(error).toBeNull()
  })
})

describe('minifyJson', () => {
  it('minifies formatted JSON to a single line', () => {
    const input = '{\n  "name": "Alice",\n  "age": 30\n}'
    const { output, error } = minifyJson(input)
    expect(error).toBeNull()
    expect(output).toBe('{"name":"Alice","age":30}')
  })

  it('returns an error for invalid JSON', () => {
    const { output, error } = minifyJson('{bad json}')
    expect(output).toBe('')
    expect(error).toContain('does not look like valid JSON')
  })

  it('returns empty output for empty input', () => {
    const { output, error } = minifyJson('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })
})
