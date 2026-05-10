// ── Types ──────────────────────────────────────────────────────────────────

export type CellValue = null | boolean // null = unknown, true = filled, false = crossed

export type PlayerGrid = CellValue[][]

export interface NonogramPuzzle {
  id: string
  title: string
  width: number
  height: number
  rowClues: number[][]
  colClues: number[][]
  solution: boolean[][] // true = filled
}

export type LineStatus = 'correct' | 'invalid' | 'incomplete'

// ── Clue extraction ────────────────────────────────────────────────────────

/** Compute run-length clues from a boolean row/column. */
export function getRowClues(row: boolean[]): number[] {
  const clues: number[] = []
  let run = 0
  for (const cell of row) {
    if (cell) {
      run++
    } else if (run > 0) {
      clues.push(run)
      run = 0
    }
  }
  if (run > 0) clues.push(run)
  return clues.length > 0 ? clues : [0]
}

export function getColClues(grid: boolean[][], col: number): number[] {
  const column = grid.map((row) => row[col] ?? false)
  return getRowClues(column)
}

// ── Line status check ──────────────────────────────────────────────────────

/**
 * Check whether a player line (row or column of CellValues) satisfies a clue.
 * - 'correct'    — filled cells match clues exactly and no unknowns remain
 * - 'invalid'    — filled cells already violate the clues (can't be fixed)
 * - 'incomplete' — not yet wrong, but unknowns remain
 */
export function checkLine(line: CellValue[], clues: number[]): LineStatus {
  // Build runs of filled cells from known cells only
  const filled = line.map((v) => (v === true ? 1 : v === false ? 0 : -1)) // -1 = unknown
  const hasUnknown = filled.includes(-1)

  // Extract runs from the fully-resolved perspective (treating unknown as empty for early validation)
  const filledRuns = extractRuns(filled.map((v) => (v === 1 ? true : false)))

  if (!hasUnknown) {
    // Fully determined — must match exactly
    // An all-empty line with clue [0] is correct
    const effectiveClues = clues.length === 1 && clues[0] === 0 ? [] : clues
    return runsEqual(filledRuns, effectiveClues) ? 'correct' : 'invalid'
  }

  // Has unknowns — check if current filled cells can still satisfy clues
  if (!canStillSolve(line, clues)) return 'invalid'
  return 'incomplete'
}

function extractRuns(line: boolean[]): number[] {
  const runs: number[] = []
  let run = 0
  for (const cell of line) {
    if (cell) {
      run++
    } else if (run > 0) {
      runs.push(run)
      run = 0
    }
  }
  if (run > 0) runs.push(run)
  return runs
}

function runsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

/**
 * Fast feasibility check: verify current filled cells don't already exceed
 * any clue run. Uses a greedy left-fit approach.
 */
function canStillSolve(line: CellValue[], clues: number[]): boolean {
  // Check that filled runs so far don't exceed corresponding clue runs
  const filledOnlyCells = line.map((v) => v === true)
  const currentRuns = extractRuns(filledOnlyCells)

  // Each current run must be ≤ its corresponding clue
  for (let i = 0; i < currentRuns.length; i++) {
    const clue = clues[i]
    const run = currentRuns[i]
    if (run === undefined || clue === undefined) return false
    // If the run is still growing (adjacent to unknown), it could still be valid
    // if it's strictly less than the clue
    if (run > clue) return false
  }

  // More filled runs than clues
  if (currentRuns.length > clues.length) return false

  return true
}

// ── Win check ──────────────────────────────────────────────────────────────

/** True when every row and column of the player grid matches the solution. */
export function checkWin(playerGrid: PlayerGrid, solution: boolean[][]): boolean {
  const height = solution.length
  const width = solution[0]?.length ?? 0

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (playerGrid[r]?.[c] !== solution[r]?.[c]) return false
    }
  }
  return true
}

// ── Puzzle generator ───────────────────────────────────────────────────────

let _genCounter = 0

export function generatePuzzle(
  width: number,
  height: number,
  density = 0.58,
): NonogramPuzzle {
  const solution: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => Math.random() < density),
  )

  const rowClues = solution.map((row) => getRowClues(row))
  const colClues = Array.from({ length: width }, (_, c) => getColClues(solution, c))

  _genCounter++
  return {
    id: `generated-${Date.now()}-${_genCounter}`,
    title: `Random ${width}×${height}`,
    width,
    height,
    rowClues,
    colClues,
    solution,
  }
}

// ── Empty player grid ──────────────────────────────────────────────────────

export function createPlayerGrid(width: number, height: number): PlayerGrid {
  return Array.from({ length: height }, () => Array.from<CellValue>({ length: width }, () => null))
}
