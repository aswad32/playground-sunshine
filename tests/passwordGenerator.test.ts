import { describe, expect, it, vi } from 'vitest'
import { generatePassword, generatePasswords, getStrength, CHARSETS } from '~/utils/passwordGenerator'

describe('generatePassword', () => {
  it('produces a password of the exact requested length', () => {
    const pwd = generatePassword(20, ['lowercase'])
    expect(pwd).toHaveLength(20)
  })

  it('clamps length below 8 to 8', () => {
    const pwd = generatePassword(4, ['lowercase'])
    expect(pwd).toHaveLength(8)
  })

  it('clamps length above 128 to 128', () => {
    const pwd = generatePassword(200, ['lowercase'])
    expect(pwd).toHaveLength(128)
  })

  it('only contains uppercase characters when only uppercase is selected', () => {
    const pwd = generatePassword(32, ['uppercase'])
    expect(pwd).toMatch(/^[A-Z]+$/)
  })

  it('only contains lowercase characters when only lowercase is selected', () => {
    const pwd = generatePassword(32, ['lowercase'])
    expect(pwd).toMatch(/^[a-z]+$/)
  })

  it('only contains digits when only numbers is selected', () => {
    const pwd = generatePassword(32, ['numbers'])
    expect(pwd).toMatch(/^[0-9]+$/)
  })

  it('only contains pool characters from selected classes', () => {
    const pool = CHARSETS.uppercase + CHARSETS.numbers
    const pwd = generatePassword(32, ['uppercase', 'numbers'])
    for (const char of pwd) {
      expect(pool).toContain(char)
    }
  })

  it('contains at least one character from each selected class', () => {
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 10; i++) {
      const pwd = generatePassword(16, ['uppercase', 'lowercase', 'numbers', 'symbols'])
      expect(pwd).toMatch(/[A-Z]/)
      expect(pwd).toMatch(/[a-z]/)
      expect(pwd).toMatch(/[0-9]/)
      expect(pwd).toMatch(/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/)
    }
  })

  it('throws when no character class is provided', () => {
    expect(() => generatePassword(16, [])).toThrow()
  })
})

describe('generatePasswords', () => {
  it('generates the requested quantity', () => {
    const results = generatePasswords({ length: 16, include: ['lowercase'], quantity: 5 })
    expect(results).toHaveLength(5)
  })

  it('clamps quantity to 20', () => {
    const results = generatePasswords({ length: 16, include: ['lowercase'], quantity: 50 })
    expect(results).toHaveLength(20)
  })

  it('generates unique passwords (10 runs)', () => {
    const results = generatePasswords({ length: 16, include: ['uppercase', 'lowercase', 'numbers'], quantity: 10 })
    const unique = new Set(results)
    expect(unique.size).toBe(10)
  })

  it('does not use Math.random', () => {
    const spy = vi.spyOn(Math, 'random')
    generatePasswords({ length: 16, include: ['lowercase'], quantity: 3 })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('getStrength', () => {
  it('returns Weak for short password with one class', () => {
    expect(getStrength('abc12345', ['lowercase'])).toBe('Weak')
  })

  it('returns Fair for length 8-11 with two classes', () => {
    expect(getStrength('abcABC12', ['lowercase', 'uppercase'])).toBe('Fair')
  })

  it('returns Strong for length 12-15 with two classes', () => {
    expect(getStrength('abcABCabc123', ['lowercase', 'uppercase', 'numbers'])).toBe('Strong')
  })

  it('returns Very Strong for length >= 16 with 3+ classes', () => {
    expect(getStrength('abcABCabc12345!@', ['lowercase', 'uppercase', 'numbers', 'symbols'])).toBe('Very Strong')
  })
})
