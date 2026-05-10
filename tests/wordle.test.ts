import { describe, it, expect } from 'vitest'
import { evaluateGuess, isValidGuess, pickRandomWord, getDailyWord } from '../app/utils/wordle'

// ── evaluateGuess ───────────────────────────────────────────────────────────

describe('evaluateGuess', () => {
  it('marks all correct when guess matches answer exactly', () => {
    const result = evaluateGuess('crane', 'crane')
    expect(result.every((r) => r.result === 'correct')).toBe(true)
    expect(result.map((r) => r.letter)).toEqual(['C','R','A','N','E'])
  })

  it('marks all absent when no letters match', () => {
    const result = evaluateGuess('zzzzz', 'crane')
    expect(result.every((r) => r.result === 'absent')).toBe(true)
  })

  it('marks correct and absent individually', () => {
    // CRANE vs CRANE: all correct already tested
    // BRACE vs CRANE: C correct at [2→1? No — B,R,A,C,E vs C,R,A,N,E
    // pos 0: B vs C → absent
    // pos 1: R vs R → correct
    // pos 2: A vs A → correct
    // pos 3: C vs N → present (C is in CRANE at pos 0)
    // pos 4: E vs E → correct
    const r = evaluateGuess('brace', 'crane')
    expect(r[0]?.result).toBe('absent')   // B not in CRANE
    expect(r[1]?.result).toBe('correct')  // R
    expect(r[2]?.result).toBe('correct')  // A
    expect(r[3]?.result).toBe('present')  // C is in CRANE
    expect(r[4]?.result).toBe('correct')  // E
  })

  it('handles duplicate letters correctly — does not over-mark yellow', () => {
    // Answer: ABBEY. Guess: KEEPS
    // K→absent, E→present (one E in ABBEY), E→absent (only one E remaining), P→absent, S→absent
    const r = evaluateGuess('keeps', 'abbey')
    expect(r[0]?.result).toBe('absent')   // K
    expect(r[1]?.result).toBe('present')  // first E — present
    expect(r[2]?.result).toBe('absent')   // second E — no more E remaining
    expect(r[3]?.result).toBe('absent')   // P
    expect(r[4]?.result).toBe('absent')   // S
  })

  it('green takes priority over yellow for duplicate letters', () => {
    // Answer: ONION (O,N,I,O,N), Guess: UNION (U,N,I,O,N)
    // pos0: U vs O → absent (U not in ONION)
    // pos1: N vs N → correct
    // pos2: I vs I → correct
    // pos3: O vs O → correct
    // pos4: N vs N → correct
    const r = evaluateGuess('union', 'onion')
    expect(r[0]?.result).toBe('absent')
    expect(r[1]?.result).toBe('correct')
    expect(r[2]?.result).toBe('correct')
    expect(r[3]?.result).toBe('correct')
    expect(r[4]?.result).toBe('correct')
  })

  it('is case-insensitive', () => {
    const lower = evaluateGuess('crane', 'crane')
    const upper = evaluateGuess('CRANE', 'CRANE')
    const mixed = evaluateGuess('Crane', 'cRANE')
    expect(lower.map((r) => r.result)).toEqual(upper.map((r) => r.result))
    expect(lower.map((r) => r.result)).toEqual(mixed.map((r) => r.result))
  })
})

// ── isValidGuess ───────────────────────────────────────────────────────────

describe('isValidGuess', () => {
  it('accepts words in the answers list', () => {
    expect(isValidGuess('crane')).toBe(true)
    expect(isValidGuess('CRANE')).toBe(true) // isValidGuess normalises to lowercase
  })

  it('rejects nonsense words', () => {
    expect(isValidGuess('zzzzz')).toBe(false)
    expect(isValidGuess('abcde')).toBe(false)
  })
})

// ── pickRandomWord ─────────────────────────────────────────────────────────

describe('pickRandomWord', () => {
  it('returns a 5-letter uppercase word', () => {
    const w = pickRandomWord(0)
    expect(w).toHaveLength(5)
    expect(w).toBe(w.toUpperCase())
  })

  it('is deterministic for a given seed', () => {
    expect(pickRandomWord(42)).toBe(pickRandomWord(42))
  })

  it('returns different words for different seeds', () => {
    const words = new Set(Array.from({ length: 50 }, (_, i) => pickRandomWord(i)))
    expect(words.size).toBeGreaterThan(1)
  })
})

// ── getDailyWord ───────────────────────────────────────────────────────────

describe('getDailyWord', () => {
  it('returns a 5-letter uppercase string', () => {
    const w = getDailyWord()
    expect(w).toHaveLength(5)
    expect(w).toBe(w.toUpperCase())
  })

  it('returns the same word when called twice on the same day', () => {
    expect(getDailyWord()).toBe(getDailyWord())
  })
})
