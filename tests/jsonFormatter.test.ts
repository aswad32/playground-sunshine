import { describe, it, expect } from 'vitest'
import { formatJson, minifyJson, sortTopLevelKeys } from '../app/utils/jsonFormatter'

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

describe('sortTopLevelKeys', () => {
  it('sorts object keys alphabetically (case-insensitive)', () => {
    const result = sortTopLevelKeys({ z: 1, a: 2, m: 3 })
    expect(Object.keys(result as object)).toEqual(['a', 'm', 'z'])
  })

  it('returns arrays unchanged', () => {
    expect(sortTopLevelKeys([3, 1, 2])).toEqual([3, 1, 2])
  })

  it('returns null unchanged', () => {
    expect(sortTopLevelKeys(null)).toBeNull()
  })

  it('returns primitive values unchanged', () => {
    expect(sortTopLevelKeys(42)).toBe(42)
    expect(sortTopLevelKeys('hello')).toBe('hello')
  })

  it('sorts mixed-case keys case-insensitively', () => {
    const result = sortTopLevelKeys({ Zebra: 1, apple: 2, Mango: 3 })
    expect(Object.keys(result as object)).toEqual(['apple', 'Mango', 'Zebra'])
  })
})

describe('formatJson with sortKeys option', () => {
  it('sorts keys when sortKeys is true', () => {
    const { output, error } = formatJson('{"z":1,"a":2}', { sortKeys: true })
    expect(error).toBeNull()
    expect(Object.keys(JSON.parse(output))).toEqual(['a', 'z'])
  })

  it('does not sort keys when sortKeys is false', () => {
    const { output, error } = formatJson('{"z":1,"a":2}', { sortKeys: false })
    expect(error).toBeNull()
    expect(output).toBeTruthy()
  })

  it('leaves array root unchanged when sortKeys is true', () => {
    const { output, error } = formatJson('[3,1,2]', { sortKeys: true })
    expect(error).toBeNull()
    expect(JSON.parse(output)).toEqual([3, 1, 2])
  })
})
