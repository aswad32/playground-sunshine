import { describe, it, expect } from 'vitest'
import { decodeJwt } from '../app/utils/jwtDecoder'

// A JWT with payload: { sub: "1234567890", name: "John Doe", iat: 1516239022 }
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// A JWT with exp in the past (exp: 1)
const EXPIRED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.signature'

// A JWT with exp far in the future (exp: 9999999999)
const FUTURE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.signature'

describe('decodeJwt', () => {
  it('returns empty result for empty input', () => {
    const result = decodeJwt('')
    expect(result.header).toBeNull()
    expect(result.payload).toBeNull()
    expect(result.error).toBeNull()
  })

  it('returns empty result for whitespace-only input', () => {
    const result = decodeJwt('   ')
    expect(result.header).toBeNull()
    expect(result.error).toBeNull()
  })

  it('decodes a valid JWT header correctly', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.error).toBeNull()
    expect(result.header).toMatchObject({ alg: 'HS256', typ: 'JWT' })
  })

  it('decodes a valid JWT payload correctly', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.error).toBeNull()
    expect(result.payload).toMatchObject({ sub: '1234567890', name: 'John Doe' })
  })

  it('exposes the signature segment', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  })

  it('marks an expired token as expired', () => {
    const result = decodeJwt(EXPIRED_JWT)
    expect(result.isExpired).toBe(true)
    expect(result.expiresAt).not.toBeNull()
  })

  it('does not mark a future token as expired', () => {
    const result = decodeJwt(FUTURE_JWT)
    expect(result.isExpired).toBe(false)
    expect(result.expiresAt).not.toBeNull()
  })

  it('returns no expiry info when exp is absent', () => {
    const result = decodeJwt(VALID_JWT)
    expect(result.isExpired).toBe(false)
    expect(result.expiresAt).toBeNull()
  })

  it('returns error for a string with wrong number of parts', () => {
    const result = decodeJwt('only.two')
    expect(result.error).toContain("doesn't look like a valid JWT")
    expect(result.header).toBeNull()
  })

  it('returns error for non-base64 segments', () => {
    const result = decodeJwt('not.valid.base64!!!')
    expect(result.error).toContain("doesn't look like a valid JWT")
  })
})
