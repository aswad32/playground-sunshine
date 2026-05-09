import { describe, expect, it } from 'vitest'
import { charSavings, jsonToToon, toonToJson, toPromptBlock } from '~/utils/jsonToonConverter'

describe('jsonToToon', () => {
  it('encodes a simple flat object', () => {
    const result = jsonToToon('{"name":"Alice","role":"admin"}')
    expect(result.error).toBeNull()
    expect(result.value).toContain('name: Alice')
    expect(result.value).toContain('role: admin')
  })

  it('encodes a uniform array of objects with tabular header syntax', () => {
    const input = JSON.stringify([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
    const result = jsonToToon(input)
    expect(result.error).toBeNull()
    expect(result.value).toContain('[2]{id,name}')
  })

  it('encodes a nested object with indentation', () => {
    const input = JSON.stringify({ user: { name: 'Alice', role: 'admin' } })
    const result = jsonToToon(input)
    expect(result.error).toBeNull()
    expect(result.value).toContain('user:')
    expect(result.value).toContain('  name: Alice')
  })

  it('returns an error for invalid JSON', () => {
    const result = jsonToToon('{not valid json}')
    expect(result.error).toBeTruthy()
    expect(result.value).toBeNull()
  })

  it('handles primitive JSON values — string', () => {
    const result = jsonToToon('"hello"')
    expect(result.error).toBeNull()
    expect(result.value).toBeTruthy()
  })

  it('handles primitive JSON values — number', () => {
    const result = jsonToToon('42')
    expect(result.error).toBeNull()
    expect(result.value).toBeTruthy()
  })

  it('handles primitive JSON values — boolean', () => {
    const result = jsonToToon('true')
    expect(result.error).toBeNull()
  })

  it('handles primitive JSON values — null', () => {
    const result = jsonToToon('null')
    expect(result.error).toBeNull()
  })

  it('handles arrays of primitives', () => {
    const result = jsonToToon('["a","b","c"]')
    expect(result.error).toBeNull()
    expect(result.value).toBeTruthy()
  })
})

describe('toonToJson', () => {
  it('round-trips: toonToJson(jsonToToon(input)) deep-equals input', () => {
    const original = {
      user: { name: 'Alice', role: 'admin' },
      tags: ['ts', 'vue'],
      items: [
        { id: 1, label: 'foo', active: true },
        { id: 2, label: 'bar', active: false },
      ],
    }
    const toonResult = jsonToToon(JSON.stringify(original))
    expect(toonResult.error).toBeNull()

    const jsonResult = toonToJson(toonResult.value as string)
    expect(jsonResult.error).toBeNull()

    expect(JSON.parse(jsonResult.value as string)).toEqual(original)
  })

  it('returns an error for invalid TOON (row count mismatch)', () => {
    // Declares 3 rows but only provides 2 — the decoder throws
    const result = toonToJson('items[3]{id,name}:\n  1,foo\n  2,bar')
    expect(result.error).toBeTruthy()
    expect(result.value).toBeNull()
  })

  it('does not throw for arbitrary scalar strings (decoder is lenient)', () => {
    // The TOON decoder treats unrecognised scalars as string values — no error
    expect(() => toonToJson('hello world')).not.toThrow()
  })
})

describe('toPromptBlock', () => {
  it('wraps TOON string in a fenced code block', () => {
    const toon = 'name: Alice\nrole: admin'
    const block = toPromptBlock(toon)
    expect(block).toBe('```toon\nname: Alice\nrole: admin\n```')
  })

  it('returns empty string for empty input', () => {
    expect(toPromptBlock('')).toBe('')
    expect(toPromptBlock('   ')).toBe('')
  })
})

describe('charSavings', () => {
  it('returns positive when TOON is shorter', () => {
    expect(charSavings(1000, 600)).toBe(40)
  })

  it('returns negative when TOON is longer', () => {
    expect(charSavings(1000, 1200)).toBe(-20)
  })

  it('returns 0 when both are equal length', () => {
    expect(charSavings(500, 500)).toBe(0)
  })

  it('returns 0 when jsonChars is 0 to avoid division by zero', () => {
    expect(charSavings(0, 100)).toBe(0)
  })
})
