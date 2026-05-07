import { describe, it, expect } from 'vitest'
import { validateCron, explainCron, getNextRuns } from '~/utils/cronBuilder'

describe('validateCron', () => {
  it('accepts a valid 5-field expression', () => {
    expect(validateCron('* * * * *')).toBe(true)
    expect(validateCron('0 8 * * 1')).toBe(true)
    expect(validateCron('*/5 * * * *')).toBe(true)
    expect(validateCron('0 0 1 1 0')).toBe(true)
  })

  it('rejects expressions with wrong field count', () => {
    expect(validateCron('* * * *')).toBe(false)
    expect(validateCron('* * * * * *')).toBe(false)
  })

  it('rejects out-of-range values', () => {
    expect(validateCron('60 * * * *')).toBe(false) // minute > 59
    expect(validateCron('* 24 * * *')).toBe(false) // hour > 23
    expect(validateCron('* * 0 * *')).toBe(false)  // dom < 1
    expect(validateCron('* * * 13 *')).toBe(false) // month > 12
    expect(validateCron('* * * * 7')).toBe(false)  // dow > 6
  })
})

describe('explainCron', () => {
  it('explains "* * * * *" as every minute', () => {
    const { explanation, error } = explainCron('* * * * *')
    expect(error).toBeNull()
    expect(explanation.toLowerCase()).toContain('every minute')
  })

  it('explains "0 8 * * 1" correctly as a weekly schedule', () => {
    const { explanation, error } = explainCron('0 8 * * 1')
    expect(error).toBeNull()
    expect(explanation).toContain('08:00')
    expect(explanation.toLowerCase()).toContain('monday')
  })

  it('explains "0 0 * * *" as midnight daily', () => {
    const { explanation, error } = explainCron('0 0 * * *')
    expect(error).toBeNull()
    expect(explanation).toContain('00:00')
  })

  it('explains "*/5 * * * *" as every 5 minutes', () => {
    const { explanation, error } = explainCron('*/5 * * * *')
    expect(error).toBeNull()
    expect(explanation.toLowerCase()).toContain('every 5 minutes')
  })

  it('explains "*/15 * * * *" as every 15 minutes', () => {
    const { explanation, error } = explainCron('*/15 * * * *')
    expect(error).toBeNull()
    expect(explanation.toLowerCase()).toContain('every 15 minutes')
  })

  it('explains "0 9-17 * * 1-5" containing a range', () => {
    const { explanation, error } = explainCron('0 9-17 * * 1-5')
    // Should not throw and should return some explanation
    expect(error).toBeNull()
    expect(explanation.length).toBeGreaterThan(0)
  })

  it('returns an error for a 6-field expression', () => {
    const { explanation, error } = explainCron('0 * * * * *')
    expect(explanation).toBe('')
    expect(error).toBeTruthy()
  })

  it('returns an error for invalid expressions', () => {
    const { explanation, error } = explainCron('invalid')
    expect(explanation).toBe('')
    expect(error).toBeTruthy()
  })

  it('returns empty for empty input', () => {
    const { explanation, error } = explainCron('')
    expect(error).toBeNull()
    expect(explanation).toBe('')
  })
})

describe('getNextRuns', () => {
  it('returns 5 run times for a valid expression', () => {
    const { runs, error } = getNextRuns('* * * * *', 5)
    expect(error).toBeNull()
    expect(runs).toHaveLength(5)
  })

  it('all run times are in the future', () => {
    const now = new Date()
    const { runs } = getNextRuns('* * * * *', 5)
    runs.forEach((run) => expect(run.getTime()).toBeGreaterThan(now.getTime()))
  })

  it('returns an error for an invalid expression', () => {
    const { runs, error } = getNextRuns('invalid', 5)
    expect(runs).toHaveLength(0)
    expect(error).toBeTruthy()
  })

  it('hourly expression returns runs 60 minutes apart', () => {
    const { runs } = getNextRuns('0 * * * *', 3)
    expect(runs).toHaveLength(3)
    const diff1 = runs[1].getTime() - runs[0].getTime()
    const diff2 = runs[2].getTime() - runs[1].getTime()
    expect(diff1).toBe(60 * 60 * 1000)
    expect(diff2).toBe(60 * 60 * 1000)
  })
})
