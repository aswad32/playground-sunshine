import { describe, expect, it } from 'vitest'
import { formatEnv } from '~/utils/envFormatter'

describe('formatEnv', () => {
  it('returns empty output for empty input', () => {
    const result = formatEnv('')
    expect(result.output).toBe('')
    expect(result.warnings).toHaveLength(0)
  })

  it('returns empty output for whitespace-only input', () => {
    const result = formatEnv('   \n  ')
    expect(result.output).toBe('')
    expect(result.warnings).toHaveLength(0)
  })

  it('preserves a simple KEY=VALUE pair', () => {
    const result = formatEnv('DB_HOST=localhost')
    expect(result.output).toBe('DB_HOST=localhost')
    expect(result.warnings).toHaveLength(0)
  })

  it('trims whitespace around = on format', () => {
    const result = formatEnv('API_KEY = abc123')
    expect(result.output).toBe('API_KEY=abc123')
    expect(result.warnings).toHaveLength(0)
  })

  it('trims whitespace around = with extra spaces', () => {
    const result = formatEnv('PORT  =  8080')
    expect(result.output).toBe('PORT=8080')
  })

  it('preserves quoted values', () => {
    const result = formatEnv('DB_PASS="my secret"')
    expect(result.output).toBe('DB_PASS="my secret"')
    expect(result.warnings).toHaveLength(0)
  })

  it('preserves single-quoted values', () => {
    const result = formatEnv("APP_ENV='production'")
    expect(result.output).toBe("APP_ENV='production'")
  })

  it('preserves comment lines', () => {
    const result = formatEnv('# Database config\nDB_HOST=localhost')
    expect(result.output).toContain('# Database config')
    expect(result.output).toContain('DB_HOST=localhost')
    expect(result.warnings).toHaveLength(0)
  })

  it('preserves blank lines', () => {
    const result = formatEnv('A=1\n\nB=2')
    const lines = result.output.split('\n')
    expect(lines[1]).toBe('')
  })

  it('warns about invalid lines', () => {
    const result = formatEnv('DB_HOST=localhost\nnot a valid line')
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].message).toContain('does not look like a valid KEY=VALUE pair')
    expect(result.warnings[0].message).toContain('Line 2')
  })

  it('warns about duplicate keys with correct line numbers', () => {
    const result = formatEnv('API_KEY=first\nOTHER=value\nAPI_KEY=second')
    const dupWarning = result.warnings.find((w) => w.message.includes('Duplicate'))
    expect(dupWarning).toBeTruthy()
    expect(dupWarning?.message).toContain('API_KEY')
    expect(dupWarning?.message).toContain('1')
    expect(dupWarning?.message).toContain('3')
  })

  it('sorts keys alphabetically when sortAlpha is true', () => {
    const result = formatEnv('ZEBRA=1\nAPPLE=2\nMIDDLE=3', true)
    const lines = result.output.split('\n')
    expect(lines[0]).toBe('APPLE=2')
    expect(lines[1]).toBe('MIDDLE=3')
    expect(lines[2]).toBe('ZEBRA=1')
  })

  it('does not sort when sortAlpha is false', () => {
    const result = formatEnv('ZEBRA=1\nAPPLE=2', false)
    const lines = result.output.split('\n')
    expect(lines[0]).toBe('ZEBRA=1')
    expect(lines[1]).toBe('APPLE=2')
  })

  it('sort preserves comment and blank lines in relative position', () => {
    const result = formatEnv('# header\nZEBRA=1\nAPPLE=2', true)
    const lines = result.output.split('\n')
    expect(lines[0]).toBe('# header')
    expect(lines[1]).toBe('APPLE=2')
    expect(lines[2]).toBe('ZEBRA=1')
  })
})
