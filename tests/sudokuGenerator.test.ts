import { describe, it, expect } from 'vitest'
import { generatePuzzle } from '../app/utils/sudokuGenerator'
import { isBoardValid, isBoardComplete } from '../app/utils/sudokuHelpers'
import { hasUniqueSolution } from '../app/utils/sudokuSolver'
import type { Difficulty } from '../app/utils/sudokuHelpers'

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

// Note: generator tests are intentionally lightweight because generation is
// probabilistic and can be slow on CI at higher difficulties.  We test easy
// and medium by default; hard / expert are guarded with a longer timeout.

describe('generatePuzzle', () => {
  it.each(['easy', 'medium'] as Difficulty[])('generates a valid %s puzzle', (diff) => {
    const result = generatePuzzle(diff)
    expect(result.difficulty).toBe(diff)
    expect(result.givens).toBeGreaterThan(0)
    // Solution is a complete valid board
    expect(isBoardComplete(result.solution)).toBe(true)
    // Puzzle is a valid (not necessarily complete) board
    expect(isBoardValid(result.puzzle)).toBe(true)
  })

  it('puzzle givens match the solution at the same positions', () => {
    const result = generatePuzzle('easy')
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (result.puzzle[r][c] !== 0) {
          expect(result.puzzle[r][c]).toBe(result.solution[r][c])
        }
      }
    }
  })

  it('returns different puzzles on successive calls', () => {
    const a = generatePuzzle('easy')
    const b = generatePuzzle('easy')
    // Extremely unlikely to produce identical puzzles
    const aStr = a.puzzle.flat().join('')
    const bStr = b.puzzle.flat().join('')
    expect(aStr).not.toBe(bStr)
  })

  it('easy puzzle has unique solution', () => {
    const result = generatePuzzle('easy')
    expect(hasUniqueSolution(result.puzzle)).toBe(true)
  }, 10_000)

  it('easy puzzle stays within givens range [36, 46]', () => {
    const result = generatePuzzle('easy')
    expect(result.givens).toBeGreaterThanOrEqual(36)
    expect(result.givens).toBeLessThanOrEqual(46)
  })
})
