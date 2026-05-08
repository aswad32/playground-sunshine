import { describe, it, expect } from 'vitest'
import { csvToJson, jsonToCsv } from '../app/utils/csvJsonConverter'

describe('csvToJson', () => {
  it('converts a simple CSV with header to JSON array', () => {
    const input = 'name,age\nAlice,30\nBob,25'
    const { output, error } = csvToJson(input)
    expect(error).toBeNull()
    const parsed = JSON.parse(output)
    expect(parsed).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ])
  })

  it('handles quoted fields containing commas', () => {
    const input = 'name,city\nAlice,"London, UK"\nBob,"Paris, France"'
    const { output, error } = csvToJson(input)
    expect(error).toBeNull()
    const parsed = JSON.parse(output)
    expect(parsed[0].city).toBe('London, UK')
    expect(parsed[1].city).toBe('Paris, France')
  })

  it('fills missing fields with empty string', () => {
    const input = 'name,age,city\nAlice,30\nBob,25,Paris'
    const { output, error } = csvToJson(input)
    expect(error).toBeNull()
    const parsed = JSON.parse(output)
    expect(parsed[0].city).toBe('')
  })

  it('returns empty output for empty input', () => {
    const { output, error } = csvToJson('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('returns empty output for whitespace-only input', () => {
    const { output, error } = csvToJson('   ')
    expect(output).toBe('')
    expect(error).toBeNull()
  })
})

describe('jsonToCsv', () => {
  it('converts a JSON array of objects to CSV with header row', () => {
    const input = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ])
    const { output, error } = jsonToCsv(input)
    expect(error).toBeNull()
    const lines = output.trim().split(/\r?\n/)
    expect(lines[0]).toBe('name,age')
    expect(lines[1]).toContain('Alice')
    expect(lines[2]).toContain('Bob')
  })

  it('returns error for invalid JSON', () => {
    const { error } = jsonToCsv('{not valid')
    expect(error).not.toBeNull()
    expect(error).toContain('valid JSON')
  })

  it('returns error when JSON is not an array', () => {
    const { error } = jsonToCsv('{"name":"Alice"}')
    expect(error).not.toBeNull()
    expect(error).toContain('array')
  })

  it('returns empty output for empty JSON array', () => {
    const { output, error } = jsonToCsv('[]')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('returns empty output for empty input', () => {
    const { output, error } = jsonToCsv('')
    expect(output).toBe('')
    expect(error).toBeNull()
  })

  it('round-trip: CSV → JSON → CSV preserves data', () => {
    const original = 'name,age\nAlice,30\nBob,25'
    const { output: jsonOutput } = csvToJson(original)
    const { output: csvOutput, error } = jsonToCsv(jsonOutput)
    expect(error).toBeNull()
    const lines = csvOutput.trim().split(/\r?\n/)
    expect(lines[0]).toBe('name,age')
    expect(lines).toHaveLength(3)
  })
})
