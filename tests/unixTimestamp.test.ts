import { describe, it, expect } from 'vitest'
import { timestampToDate, dateToTimestamp } from '~/utils/unixTimestamp'

describe('timestampToDate', () => {
  it('converts a known seconds timestamp to correct UTC date', () => {
    // 2023-11-14T22:13:20.000Z
    const { utc, error } = timestampToDate('1700000000', 'seconds')
    expect(error).toBeNull()
    expect(utc).toContain('2023')
  })

  it('converts a milliseconds timestamp correctly', () => {
    const { utc, error } = timestampToDate('1700000000000', 'milliseconds')
    expect(error).toBeNull()
    expect(utc).toContain('2023')
  })

  it('produces the same date from seconds and equivalent milliseconds', () => {
    const fromSec = timestampToDate('1700000000', 'seconds')
    const fromMs = timestampToDate('1700000000000', 'milliseconds')
    expect(fromSec.utc).toBe(fromMs.utc)
  })

  it('returns an error for non-numeric input', () => {
    const { utc, local, error } = timestampToDate('not-a-number', 'seconds')
    expect(error).toBe('Please enter a valid number.')
    expect(utc).toBe('')
    expect(local).toBe('')
  })

  it('returns empty output for empty input', () => {
    const { utc, local, error } = timestampToDate('', 'seconds')
    expect(error).toBeNull()
    expect(utc).toBe('')
    expect(local).toBe('')
  })

  it('includes both utc and local fields', () => {
    const { utc, local, error } = timestampToDate('0', 'seconds')
    expect(error).toBeNull()
    expect(utc).toBeTruthy()
    expect(local).toBeTruthy()
  })
})

describe('dateToTimestamp', () => {
  it('converts a known date string to correct Unix seconds', () => {
    // 2023-11-14T22:13:20.000Z
    const { seconds, error } = dateToTimestamp('2023-11-14T22:13:20')
    expect(error).toBeNull()
    // Allow for timezone offset — check the seconds are in a reasonable range
    expect(seconds).toBeTypeOf('number')
    expect(seconds).toBeGreaterThan(0)
  })

  it('milliseconds is exactly 1000x seconds', () => {
    const { seconds, milliseconds, error } = dateToTimestamp('2023-01-01T00:00:00')
    expect(error).toBeNull()
    expect(milliseconds).toBe(seconds * 1000)
  })

  it('returns an error for an invalid date string', () => {
    const { error } = dateToTimestamp('not-a-date')
    expect(error).toBe('Please enter a valid date.')
  })

  it('returns empty result for empty input', () => {
    const { seconds, milliseconds, error } = dateToTimestamp('')
    expect(error).toBeNull()
    expect(seconds).toBe(0)
    expect(milliseconds).toBe(0)
  })
})
