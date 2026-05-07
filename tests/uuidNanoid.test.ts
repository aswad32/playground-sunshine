import { describe, it, expect } from 'vitest'
import { generateUUIDs, generateNanoIDs } from '~/utils/uuidNanoid'

describe('generateUUIDs', () => {
  it('generates a valid UUID v4 format', () => {
    const { ids, error } = generateUUIDs(1)
    expect(error).toBeNull()
    expect(ids).toHaveLength(1)
    expect(ids[0]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('generates the correct quantity of UUIDs', () => {
    const { ids, error } = generateUUIDs(10)
    expect(error).toBeNull()
    expect(ids).toHaveLength(10)
  })

  it('clamps quantity below 1 to 1', () => {
    const { ids } = generateUUIDs(0)
    expect(ids).toHaveLength(1)
  })

  it('clamps quantity above 100 to 100', () => {
    const { ids } = generateUUIDs(200)
    expect(ids).toHaveLength(100)
  })

  it('generates unique IDs', () => {
    const { ids } = generateUUIDs(20)
    const unique = new Set(ids)
    expect(unique.size).toBe(20)
  })
})

describe('generateNanoIDs', () => {
  const defaultAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  it('generates NanoIDs of the correct length', () => {
    const { ids, error } = generateNanoIDs(5, defaultAlphabet, 21)
    expect(error).toBeNull()
    expect(ids).toHaveLength(5)
    ids.forEach((id) => expect(id).toHaveLength(21))
  })

  it('respects custom alphabet — only uses characters from alphabet', () => {
    const alphabet = 'abc'
    const { ids, error } = generateNanoIDs(10, alphabet, 10)
    expect(error).toBeNull()
    ids.forEach((id) => {
      expect(id).toHaveLength(10)
      expect(id).toMatch(/^[abc]+$/)
    })
  })

  it('respects custom length', () => {
    const { ids } = generateNanoIDs(3, defaultAlphabet, 8)
    ids.forEach((id) => expect(id).toHaveLength(8))
  })

  it('returns an error when alphabet is empty', () => {
    const { ids, error } = generateNanoIDs(1, '', 21)
    expect(ids).toHaveLength(0)
    expect(error).toBe('Alphabet cannot be empty.')
  })

  it('returns an error when length is less than 1', () => {
    const { ids, error } = generateNanoIDs(1, defaultAlphabet, 0)
    expect(ids).toHaveLength(0)
    expect(error).toBe('Length must be at least 1.')
  })

  it('clamps quantity correctly', () => {
    const { ids } = generateNanoIDs(200, defaultAlphabet, 10)
    expect(ids).toHaveLength(100)
  })
})
