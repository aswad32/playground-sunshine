import { describe, expect, it } from 'vitest'
import { formatEnv, convertEnv, compareEnv } from '~/utils/envFormatter'

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

describe('convertEnv — JSON', () => {
  it('outputs valid JSON object', () => {
    const result = convertEnv('HOST=localhost\nPORT=5432', 'json')
    const obj = JSON.parse(result.output)
    expect(obj).toEqual({ HOST: 'localhost', PORT: '5432' })
  })

  it('strips surrounding quotes from values', () => {
    const result = convertEnv('MSG="hello world"\nNAME=\'alice\'', 'json')
    const obj = JSON.parse(result.output)
    expect(obj.MSG).toBe('hello world')
    expect(obj.NAME).toBe('alice')
  })

  it('excludes comment and blank lines', () => {
    const result = convertEnv('# comment\nKEY=val\n\n', 'json')
    const obj = JSON.parse(result.output)
    expect(Object.keys(obj)).toEqual(['KEY'])
  })

  it('sorts alphabetically when sortAlpha is true', () => {
    const result = convertEnv('ZEBRA=1\nAPPLE=2', 'json', true)
    const keys = Object.keys(JSON.parse(result.output))
    expect(keys[0]).toBe('APPLE')
    expect(keys[1]).toBe('ZEBRA')
  })

  it('returns empty output for empty input', () => {
    expect(convertEnv('', 'json').output).toBe('')
  })
})

describe('convertEnv — Docker Compose', () => {
  it('outputs environment: block', () => {
    const result = convertEnv('HOST=localhost\nPORT=5432', 'docker')
    expect(result.output).toBe('environment:\n  - HOST=localhost\n  - PORT=5432')
  })

  it('strips surrounding quotes from values', () => {
    const result = convertEnv('MSG="hi there"', 'docker')
    expect(result.output).toContain('  - MSG=hi there')
  })

  it('excludes comment and blank lines', () => {
    const result = convertEnv('# comment\nKEY=val', 'docker')
    const lines = result.output.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toBe('  - KEY=val')
  })
})

describe('convertEnv — GitHub Actions', () => {
  it('outputs env: block', () => {
    const result = convertEnv('HOST=localhost\nPORT=5432', 'github-actions')
    expect(result.output).toBe('env:\n  HOST: localhost\n  PORT: 5432')
  })

  it('wraps values with colons in double quotes', () => {
    const result = convertEnv('URL=http://example.com', 'github-actions')
    expect(result.output).toContain('  URL: "http://example.com"')
  })

  it('wraps values with # in double quotes', () => {
    const result = convertEnv('MSG=hello # world', 'github-actions')
    expect(result.output).toContain('  MSG: "hello # world"')
  })

  it('strips surrounding quotes from values', () => {
    const result = convertEnv('TOKEN="abc123"', 'github-actions')
    expect(result.output).toContain('  TOKEN: abc123')
  })

  it('excludes comment and blank lines', () => {
    const result = convertEnv('# comment\nKEY=val', 'github-actions')
    const lines = result.output.split('\n')
    expect(lines).toHaveLength(2)
  })
})

describe('convertEnv — .env.example', () => {
  it('strips all values to empty string', () => {
    const result = convertEnv('HOST=localhost\nPORT=5432', 'env-example')
    expect(result.output).toBe('HOST=\nPORT=')
  })

  it('preserves comment lines', () => {
    const result = convertEnv('# Database\nDB_HOST=localhost', 'env-example')
    expect(result.output).toContain('# Database')
    expect(result.output).toContain('DB_HOST=')
  })

  it('preserves blank lines', () => {
    const result = convertEnv('A=1\n\nB=2', 'env-example')
    const lines = result.output.split('\n')
    expect(lines[1]).toBe('')
  })

  it('returns empty output for empty input', () => {
    expect(convertEnv('', 'env-example').output).toBe('')
  })
})

describe('compareEnv', () => {
  it('detects keys missing from .env', () => {
    const result = compareEnv('A=1', 'A=\nB=\nC=')
    expect(result.missing).toContain('B')
    expect(result.missing).toContain('C')
    expect(result.missing).not.toContain('A')
  })

  it('detects extra keys in .env', () => {
    const result = compareEnv('A=1\nB=2\nC=3', 'A=')
    expect(result.extra).toContain('B')
    expect(result.extra).toContain('C')
  })

  it('detects matching keys', () => {
    const result = compareEnv('A=1\nB=2', 'A=\nB=')
    expect(result.matching).toContain('A')
    expect(result.matching).toContain('B')
    expect(result.missing).toHaveLength(0)
    expect(result.extra).toHaveLength(0)
  })

  it('returns all missing when .env is empty', () => {
    const result = compareEnv('', 'A=\nB=')
    expect(result.missing).toEqual(['A', 'B'])
    expect(result.extra).toHaveLength(0)
    expect(result.matching).toHaveLength(0)
  })

  it('returns all extra when .env.example is empty', () => {
    const result = compareEnv('A=1\nB=2', '')
    expect(result.extra).toEqual(['A', 'B'])
    expect(result.missing).toHaveLength(0)
  })

  it('returns empty lists when both inputs are empty', () => {
    const result = compareEnv('', '')
    expect(result.missing).toHaveLength(0)
    expect(result.extra).toHaveLength(0)
    expect(result.matching).toHaveLength(0)
  })

  it('ignores comment lines in both inputs', () => {
    const result = compareEnv('# comment\nA=1', '# another comment\nA=')
    expect(result.matching).toEqual(['A'])
    expect(result.missing).toHaveLength(0)
  })
})
