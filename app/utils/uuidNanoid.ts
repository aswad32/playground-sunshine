export interface GenerateResult {
  ids: string[]
  error: string | null
}

export function generateUUIDs(quantity: number): GenerateResult {
  const count = Math.max(1, Math.min(100, quantity))
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    ids.push(crypto.randomUUID())
  }
  return { ids, error: null }
}

export function generateNanoIDs(
  quantity: number,
  alphabet: string,
  length: number,
): GenerateResult {
  const count = Math.max(1, Math.min(100, quantity))

  if (!alphabet || alphabet.length === 0) {
    return { ids: [], error: 'Alphabet cannot be empty.' }
  }
  if (length < 1) {
    return { ids: [], error: 'Length must be at least 1.' }
  }

  const ids: string[] = []
  const alphabetArray = alphabet.split('')
  const alphabetLength = alphabetArray.length

  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    const id = Array.from(bytes)
      .map((b) => alphabetArray[b % alphabetLength])
      .join('')
    ids.push(id)
  }

  return { ids, error: null }
}
