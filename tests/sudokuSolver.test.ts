import { describe, it, expect } from 'vitest'
import { solve, hasUniqueSolution } from '../app/utils/sudokuSolver'
import { emptyBoard, cloneBoard, stringToBoard } from '../app/utils/sudokuHelpers'

// A well-known puzzle string (from Wikipedia / "world's hardest Sudoku")
const EASY_PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

// Same puzzle with first given removed (so we can test multi-solution)
const EMPTY_PUZZLE = '0'.repeat(81)

// A puzzle with an error injected (duplicate in row 0)
function invalidPuzzle() {
  const b = stringToBoard(EASY_PUZZLE)!
  b[0][1] = b[0][0] // force row conflict
  return b
}

describe('solve', () => {
  it('solves a known easy puzzle', () => {
    const board = stringToBoard(EASY_PUZZLE)!
    const result = solve(board)
    expect(result.solved).toBe(true)
    expect(result.solution).not.toBeNull()
    // All cells filled
    expect(result.solution!.flat().every((v) => v > 0)).toBe(true)
  })

  it('returns solved=false for an unsolvable board', () => {
    const board = invalidPuzzle()
    const result = solve(board)
    expect(result.solved).toBe(false)
    expect(result.reason).toBe('no-solution')
  })

  it('detects multiple solutions for a nearly-empty board', () => {
    const result = solve(emptyBoard())
    expect(result.solved).toBe(true)
    expect(result.multiSolution).toBe(true)
  })

  it('does not mutate the input board', () => {
    const board = stringToBoard(EASY_PUZZLE)!
    const snapshot = board.map((r) => [...r])
    solve(board)
    expect(board).toEqual(snapshot)
  })

  it('preserves given values in the solution', () => {
    const board = stringToBoard(EASY_PUZZLE)!
    const result = solve(board)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) {
          expect(result.solution![r][c]).toBe(board[r][c])
        }
      }
    }
  })
})

describe('hasUniqueSolution', () => {
  it('returns true for a uniquely-solvable puzzle', () => {
    const board = stringToBoard(EASY_PUZZLE)!
    expect(hasUniqueSolution(board)).toBe(true)
  })

  it('returns false for an empty board', () => {
    expect(hasUniqueSolution(emptyBoard())).toBe(false)
  })
})
