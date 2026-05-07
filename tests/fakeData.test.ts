import { describe, it, expect } from 'vitest'
import { generateFakeData, DATA_TYPE_LABELS, type DataType } from '../app/utils/fakeData'

describe('generateFakeData', () => {
  it('returns an error when no types are selected', () => {
    const result = generateFakeData({ types: [], rows: 5, format: 'json' })
    expect(result.error).toBe('Please select at least one data type.')
    expect(result.output).toBe('')
  })

  it('generates the correct number of rows in JSON format', () => {
    const result = generateFakeData({ types: ['name', 'email'], rows: 5, format: 'json' })
    expect(result.error).toBeNull()
    const parsed = JSON.parse(result.output)
    expect(parsed).toHaveLength(5)
  })

  it('JSON output has correct column keys matching selected types', () => {
    const result = generateFakeData({ types: ['name', 'email', 'phone'], rows: 3, format: 'json' })
    const parsed = JSON.parse(result.output)
    for (const row of parsed) {
      expect(row).toHaveProperty(DATA_TYPE_LABELS['name'])
      expect(row).toHaveProperty(DATA_TYPE_LABELS['email'])
      expect(row).toHaveProperty(DATA_TYPE_LABELS['phone'])
    }
  })

  it('CSV output has correct header row', () => {
    const types: DataType[] = ['name', 'email']
    const result = generateFakeData({ types, rows: 3, format: 'csv' })
    expect(result.error).toBeNull()
    const lines = result.output.split('\n')
    const headers = lines[0]
    expect(headers).toBe('Name,Email')
  })

  it('CSV output has correct number of data rows (excluding header)', () => {
    const result = generateFakeData({ types: ['name'], rows: 7, format: 'csv' })
    const lines = result.output.split('\n')
    // 1 header + 7 data rows
    expect(lines).toHaveLength(8)
  })

  it('list format produces correct number of lines', () => {
    const result = generateFakeData({ types: ['company', 'url'], rows: 4, format: 'list' })
    expect(result.error).toBeNull()
    const lines = result.output.split('\n')
    expect(lines).toHaveLength(4)
  })

  it('clamps rows to minimum of 1', () => {
    const result = generateFakeData({ types: ['name'], rows: 0, format: 'json' })
    const parsed = JSON.parse(result.output)
    expect(parsed).toHaveLength(1)
  })

  it('clamps rows to maximum of 100', () => {
    const result = generateFakeData({ types: ['name'], rows: 200, format: 'json' })
    const parsed = JSON.parse(result.output)
    expect(parsed).toHaveLength(100)
  })

  it('JSON output is valid parseable JSON', () => {
    const result = generateFakeData({ types: ['name', 'email', 'uuid', 'date'], rows: 10, format: 'json' })
    expect(() => JSON.parse(result.output)).not.toThrow()
  })

  it('each row contains a value for every selected type', () => {
    const types: DataType[] = ['name', 'email', 'phone', 'address', 'company']
    const result = generateFakeData({ types, rows: 5, format: 'json' })
    const parsed = JSON.parse(result.output)
    for (const row of parsed) {
      for (const type of types) {
        const value = row[DATA_TYPE_LABELS[type]]
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    }
  })
})
