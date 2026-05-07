export interface JwtHeader {
  alg?: string
  typ?: string
  [key: string]: unknown
}

export interface JwtPayload {
  exp?: number
  iat?: number
  sub?: string
  [key: string]: unknown
}

export interface JwtDecodeResult {
  header: JwtHeader | null
  payload: JwtPayload | null
  signature: string
  error: string | null
  isExpired: boolean
  expiresAt: Date | null
}

function decodeBase64Url(str: string): unknown {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  const decoded = atob(padded)
  return JSON.parse(decoded)
}

export function decodeJwt(input: string): JwtDecodeResult {
  const empty: JwtDecodeResult = {
    header: null,
    payload: null,
    signature: '',
    error: null,
    isExpired: false,
    expiresAt: null,
  }

  const trimmed = input.trim()
  if (!trimmed) return empty

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return {
      ...empty,
      error: "This doesn't look like a valid JWT. Make sure it has three dot-separated parts.",
    }
  }

  try {
    const header = decodeBase64Url(parts[0]) as JwtHeader
    const payload = decodeBase64Url(parts[1]) as JwtPayload
    const signature = parts[2]

    let isExpired = false
    let expiresAt: Date | null = null

    if (typeof payload.exp === 'number') {
      expiresAt = new Date(payload.exp * 1000)
      isExpired = expiresAt < new Date()
    }

    return { header, payload, signature, error: null, isExpired, expiresAt }
  } catch {
    return {
      ...empty,
      error: "This doesn't look like a valid JWT. Make sure it has three dot-separated parts.",
    }
  }
}
