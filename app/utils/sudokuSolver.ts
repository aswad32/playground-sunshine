import { cloneBoard, hasConflict, type Board } from './sudokuHelpers'

export type SolveReason = 'no-solution' | 'timeout'

export interface SolveResult {
  solved: boolean
  solution: Board | null
  /** True when more than one valid solution exists */
  multiSolution: boolean
  reason?: SolveReason
}

/** Find the next empty cell using minimum remaining values (MRV) heuristic —
 *  pick the empty cell with the fewest valid candidates. Falls back to first
 *  empty if all have the same count. Returns null when the board is full.
 */
function nextEmpty(board: Board): [number, number] | null {
  let bestRow = -1
  let bestCol = -1
  let bestCount = 10

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue
      let count = 0
      for (let v = 1; v <= 9; v++) {
        if (!hasConflict(board, r, c, v)) count++
      }
      if (count < bestCount) {
        bestCount = count
        bestRow = r
        bestCol = c
      }
    }
  }

  return bestRow === -1 ? null : [bestRow, bestCol]
}

/**
 * Recursive backtracking solver.
 * @param board   Mutable working board (modified in place)
 * @param count   Object with `.value` counting solutions found so far
 * @param limit   Stop searching after this many solutions (1 = find one, 2 = detect multiple)
 * @param result  Filled with the first solution found
 * @param deadline  Performance.now() deadline — abort if exceeded
 */
function backtrack(
  board: Board,
  count: { value: number },
  limit: number,
  result: { board: Board | null },
  deadline: number,
): void {
  if (performance.now() > deadline) return

  const cell = nextEmpty(board)
  if (!cell) {
    count.value++
    if (result.board === null) result.board = cloneBoard(board)
    return
  }

  const [r, c] = cell
  for (let v = 1; v <= 9; v++) {
    if (count.value >= limit) return
    if (!hasConflict(board, r, c, v)) {
      board[r][c] = v
      backtrack(board, count, limit, result, deadline)
      board[r][c] = 0
    }
  }
}

/**
 * Solve a Sudoku board.
 * @param puzzle  9×9 board (0 = empty). Not modified.
 * @param timeoutMs  Maximum time to spend (default 5000ms)
 */
export function solve(puzzle: Board, timeoutMs = 5000): SolveResult {
  const board = cloneBoard(puzzle)
  const count = { value: 0 }
  const result: { board: Board | null } = { board: null }
  const deadline = performance.now() + timeoutMs

  // Run up to 2 solutions to detect uniqueness
  backtrack(board, count, 2, result, deadline)

  if (performance.now() > deadline && count.value === 0) {
    return { solved: false, solution: null, multiSolution: false, reason: 'timeout' }
  }

  if (count.value === 0) {
    return { solved: false, solution: null, multiSolution: false, reason: 'no-solution' }
  }

  return {
    solved: true,
    solution: result.board,
    multiSolution: count.value > 1,
  }
}

/** Quick check: does this puzzle have exactly one solution? */
export function hasUniqueSolution(puzzle: Board, timeoutMs = 5000): boolean {
  const result = solve(puzzle, timeoutMs)
  return result.solved && !result.multiSolution
}
