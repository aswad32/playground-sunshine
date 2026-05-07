import md5 from 'js-md5'

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

export interface HashResult {
  hash: string
  error: string | null
}

async function subtleHash(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashText(input: string, algorithm: HashAlgorithm): Promise<HashResult> {
  if (!input) return { hash: '', error: null }

  try {
    const encoded = new TextEncoder().encode(input)

    if (algorithm === 'MD5') {
      return { hash: md5(encoded), error: null }
    }

    const hash = await subtleHash(algorithm, encoded.buffer as ArrayBuffer)
    return { hash, error: null }
  } catch {
    return { hash: '', error: 'Failed to compute hash.' }
  }
}

export async function hashFile(file: File, algorithm: HashAlgorithm): Promise<HashResult> {
  try {
    const buffer = await file.arrayBuffer()

    if (algorithm === 'MD5') {
      return { hash: md5(buffer), error: null }
    }

    const hash = await subtleHash(algorithm, buffer)
    return { hash, error: null }
  } catch {
    return { hash: '', error: 'Failed to hash file.' }
  }
}
