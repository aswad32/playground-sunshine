import { ANSWERS, VALID_GUESSES } from './wordleWords'

export type LetterResult = 'correct' | 'present' | 'absent'

export interface GuessResult {
  letter: string
  result: LetterResult
}

/**
 * Evaluate a guess against the hidden answer, following standard Wordle rules:
 * - Green (correct) letters are matched first.
 * - Yellow (present) letters can only be used up to the count of remaining
 *   (unmatched) occurrences of that letter in the answer.
 */
export function evaluateGuess(guess: string, answer: string): GuessResult[] {
  const g = guess.toUpperCase()
  const a = answer.toUpperCase()
  const results: LetterResult[] = Array(5).fill('absent')

  // Remaining counts for each letter in the answer after green matches are removed
  const remaining: Record<string, number> = {}

  // First pass: mark greens and count remaining answer letters
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      results[i] = 'correct'
    } else {
      const ch = a[i] ?? ''
      remaining[ch] = (remaining[ch] ?? 0) + 1
    }
  }

  // Second pass: mark yellows using remaining counts
  for (let i = 0; i < 5; i++) {
    if (results[i] === 'correct') continue
    const ch = g[i] ?? ''
    if (remaining[ch] && remaining[ch] > 0) {
      results[i] = 'present'
      remaining[ch]--
    }
  }

  return Array.from({ length: 5 }, (_, i) => ({
    letter: g[i] ?? '',
    result: results[i] ?? 'absent',
  }))
}

/** Check if a word is accepted as a valid guess. */
export function isValidGuess(word: string): boolean {
  const w = word.toLowerCase()
  return ANSWERS.includes(w) || VALID_GUESSES.includes(w)
}

/** Pick a random word from the answers list, optionally seeded. */
export function pickRandomWord(seed?: number): string {
  const idx = seed !== undefined
    ? Math.abs(seed) % ANSWERS.length
    : Math.floor(Math.random() * ANSWERS.length)
  return (ANSWERS[idx] ?? ANSWERS[0] ?? 'crane').toUpperCase()
}

/** Derive a deterministic daily word from the current UTC date. */
export function getDailyWord(): string {
  const now = new Date()
  // Days since a fixed epoch (2024-01-01 UTC)
  const epoch = Date.UTC(2024, 0, 1)
  const dayIndex = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - epoch) / 86400000)
  return pickRandomWord(dayIndex)
}

/** Key used for daily localStorage state */
export function dailyStateKey(): string {
  const now = new Date()
  return `ps-wordle-daily-${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`
}
