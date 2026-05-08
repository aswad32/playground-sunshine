export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const

export type CharsetKey = keyof typeof CHARSETS

export type PasswordStrength = 'Weak' | 'Fair' | 'Strong' | 'Very Strong'

export interface PasswordOptions {
  length: number
  include: CharsetKey[]
  quantity: number
}

export function generatePassword(length: number, include: CharsetKey[]): string {
  if (include.length === 0) throw new Error('At least one character class required.')

  const clampedLength = Math.min(128, Math.max(8, length))

  // Build full pool
  const pool = include.map((k) => CHARSETS[k]).join('')

  // Guarantee at least one character from each selected class
  const guaranteed: string[] = include.map((k) => {
    const chars = CHARSETS[k]
    return chars[randomIndex(chars.length)]
  })

  // Fill remaining positions from the full pool
  const remaining = clampedLength - guaranteed.length
  const rest: string[] = Array.from({ length: remaining }, () => pool[randomIndex(pool.length)])

  // Shuffle the combined array using Fisher-Yates with crypto random
  const combined = [...guaranteed, ...rest]
  for (let i = combined.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return combined.join('')
}

export function generatePasswords(options: PasswordOptions): string[] {
  const length = Math.min(128, Math.max(8, options.length))
  const quantity = Math.min(20, Math.max(1, options.quantity))
  return Array.from({ length: quantity }, () => generatePassword(length, options.include))
}

export function getStrength(password: string, include: CharsetKey[]): PasswordStrength {
  const len = password.length
  const classes = include.length

  if (len < 8 || classes <= 1) return 'Weak'
  if (len < 12 && classes >= 2) return 'Fair'
  if (len < 16 && classes >= 2) return 'Strong'
  return 'Very Strong'
}

function randomIndex(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}
