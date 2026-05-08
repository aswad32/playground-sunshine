// ── Types ─────────────────────────────────────────────────────────────────

/** 9×9 board — 0 represents an empty cell */
export type Board = number[][]

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

export interface CellPos {
  row: number
  col: number
}

// ── Board creation ─────────────────────────────────────────────────────────

/** Create an empty 9×9 board filled with zeros */
export function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0))
}

/** Deep-clone a board */
export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

// ── Conflict detection ─────────────────────────────────────────────────────

/** Return true if placing `val` at (row, col) conflicts with the current board.
 *  The cell at (row, col) is excluded from the check (useful for re-checking
 *  an already-placed value).
 */
export function hasConflict(board: Board, row: number, col: number, val: number): boolean {
  if (val === 0) return false

  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === val) return true
  }

  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === val) return true
  }

  // 3×3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === val) return true
    }
  }

  return false
}

/** Return true if the board has no conflicting values (ignores empty cells) */
export function isBoardValid(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c]
      if (val !== 0 && hasConflict(board, r, c, val)) return false
    }
  }
  return true
}

/** Return true if all 81 cells are filled and the board has no conflicts */
export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return false
    }
  }
  return isBoardValid(board)
}

/** Return all (row, col) positions that conflict with the given cell's value */
export function getConflictPositions(board: Board, row: number, col: number): CellPos[] {
  const val = board[row][col]
  if (val === 0) return []

  const conflicts: CellPos[] = []
  const seen = new Set<string>()

  const add = (r: number, c: number) => {
    const key = `${r},${c}`
    if (!seen.has(key)) {
      seen.add(key)
      conflicts.push({ row: r, col: c })
    }
  }

  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === val) add(row, c)
  }

  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === val) add(r, col)
  }

  // Box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === val) add(r, c)
    }
  }

  return conflicts
}

// ── String ↔ Board conversion ──────────────────────────────────────────────

/** Serialise a board to an 81-character string (0 = empty) */
export function boardToString(board: Board): string {
  return board.flat().join('')
}

/**
 * Parse a string into a 9×9 board.
 * Accepts digits 0–9 and dots (`.`) as significant chars; ignores whitespace,
 * pipes `|`, dashes `-`, and plus `+` (common ASCII grid decorators).
 * Returns null if the number of significant characters ≠ 81 or invalid chars remain.
 */
export function stringToBoard(s: string): Board | null {
  const cleaned = s.replace(/[\s|+\-]/g, '')
  const normalized = cleaned.replace(/\./g, '0')
  if (normalized.length !== 81) return null
  if (!/^[0-9]+$/.test(normalized)) return null

  const board = emptyBoard()
  for (let i = 0; i < 81; i++) {
    board[Math.floor(i / 9)][i % 9] = Number(normalized[i])
  }
  return board
}

/** Format a board as a human-readable ASCII grid */
export function boardToAsciiGrid(board: Board): string {
  const rows: string[] = []
  for (let r = 0; r < 9; r++) {
    if (r > 0 && r % 3 === 0) rows.push('+-------+-------+-------+')
    const cells = board[r].map((v, c) => {
      const ch = v === 0 ? '.' : String(v)
      return (c > 0 && c % 3 === 0 ? '| ' : '') + ch
    })
    rows.push('| ' + cells.join(' ') + ' |')
  }
  return rows.join('\n')
}
