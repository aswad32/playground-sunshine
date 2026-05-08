import { emptyBoard, cloneBoard, hasConflict, type Board, type Difficulty } from './sudokuHelpers'
import { hasUniqueSolution } from './sudokuSolver'

export interface GeneratedPuzzle {
  puzzle: Board
  solution: Board
  givens: number
  difficulty: Difficulty
}

/** Shuffle an array in-place using Fisher-Yates (mutates and returns the array) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Fill an empty board with a complete, valid solution using randomised backtracking */
function fillBoard(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue

      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
      for (const d of digits) {
        if (!hasConflict(board, r, c, d)) {
          board[r][c] = d
          if (fillBoard(board)) return true
          board[r][c] = 0
        }
      }
      return false // no valid digit found — backtrack
    }
  }
  return true // all cells filled
}

const GIVENS_RANGE: Record<Difficulty, [number, number]> = {
  easy:   [36, 46],
  medium: [27, 35],
  hard:   [22, 26],
  expert: [17, 21],
}

/**
 * Generate a valid Sudoku puzzle with a unique solution at the given difficulty.
 * Throws if generation fails within the attempt limit.
 */
export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  // Step 1: create a full solution
  const solution = emptyBoard()
  fillBoard(solution)

  // Step 2: remove cells one by one in random order, keeping unique-solution property
  const puzzle = cloneBoard(solution)
  const [minGivens] = GIVENS_RANGE[difficulty]

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number]),
  )

  for (const [r, c] of positions) {
    const backup = puzzle[r][c]
    puzzle[r][c] = 0

    const currentGivens = puzzle.flat().filter((v) => v !== 0).length
    if (currentGivens < minGivens) {
      puzzle[r][c] = backup
      continue
    }

    if (!hasUniqueSolution(puzzle)) {
      puzzle[r][c] = backup
    }
  }

  const givens = puzzle.flat().filter((v) => v !== 0).length

  return { puzzle, solution, givens, difficulty }
}
