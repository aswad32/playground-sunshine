import { describe, it, expect } from 'vitest'
import { hashText } from '~/utils/hashGenerator'

// Known vectors
// SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
// SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
// MD5("hello") = 5d41402abc4b2a76b9719d911017c592
// SHA-1("hello") = aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
// SHA-512("hello") = 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043

describe('hashText', () => {
  it('computes correct SHA-256 for known input', async () => {
    const { hash, error } = await hashText('hello', 'SHA-256')
    expect(error).toBeNull()
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('computes correct SHA-256 for empty string', async () => {
    const { hash, error } = await hashText('', 'SHA-256')
    expect(error).toBeNull()
    // empty input → empty output (no error)
    expect(hash).toBe('')
  })

  it('computes correct MD5 for known input', async () => {
    const { hash, error } = await hashText('hello', 'MD5')
    expect(error).toBeNull()
    expect(hash).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('computes correct SHA-1 for known input', async () => {
    const { hash, error } = await hashText('hello', 'SHA-1')
    expect(error).toBeNull()
    expect(hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

  it('computes correct SHA-512 for known input', async () => {
    const { hash, error } = await hashText('hello', 'SHA-512')
    expect(error).toBeNull()
    expect(hash).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
    )
  })

  it('returns empty hash (no error) for empty input', async () => {
    const { hash, error } = await hashText('', 'SHA-256')
    expect(error).toBeNull()
    expect(hash).toBe('')
  })

  it('same input always produces the same hash', async () => {
    const a = await hashText('test string', 'SHA-256')
    const b = await hashText('test string', 'SHA-256')
    expect(a.hash).toBe(b.hash)
  })

  it('different inputs produce different hashes', async () => {
    const a = await hashText('hello', 'SHA-256')
    const b = await hashText('hello!', 'SHA-256')
    expect(a.hash).not.toBe(b.hash)
  })
})
