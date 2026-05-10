// ── Types ──────────────────────────────────────────────────────────────────

export type CellState = 'hidden' | 'revealed' | 'flagged'

export interface Cell {
  mine: boolean
  adjacent: number // 0–8 neighbour mine count (0 means blank)
  state: CellState
}

export type Board = Cell[][]

export interface Position {
  row: number
  col: number
}

// ── Internal helpers ───────────────────────────────────────────────────────

function get(board: Board, r: number, c: number): Cell | undefined {
  return board[r]?.[c]
}

function dims(board: Board): { width: number; height: number } {
  return { height: board.length, width: board[0]?.length ?? 0 }
}

function inBounds(r: number, c: number, height: number, width: number): boolean {
  return r >= 0 && r < height && c >= 0 && c < width
}

// ── Board creation ─────────────────────────────────────────────────────────

export function createEmptyBoard(width: number, height: number): Board {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, (): Cell => ({
      mine: false,
      adjacent: 0,
      state: 'hidden',
    })),
  )
}

// ── Mine placement ─────────────────────────────────────────────────────────

/**
 * Place `mineCount` mines on the board, excluding the `safeCell` and its
 * 8 neighbours (so the first click is always blank or at worst numbered,
 * never a mine).
 */
export function placeMines(
  board: Board,
  mineCount: number,
  safeCell: Position,
): Board {
  const { height, width } = dims(board)

  // Build the safe zone (safeCell + neighbours)
  const safeSet = new Set<string>()
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeCell.row + dr
      const c = safeCell.col + dc
      if (inBounds(r, c, height, width)) safeSet.add(`${r},${c}`)
    }
  }

  // Collect all candidate positions
  const candidates: Position[] = []
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!safeSet.has(`${r},${c}`)) candidates.push({ row: r, col: c })
    }
  }

  // Fisher-Yates shuffle and take the first mineCount
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = candidates[i]!
    candidates[i] = candidates[j]!
    candidates[j] = tmp
  }

  const next: Board = board.map((row) => row.map((cell): Cell => ({ ...cell, mine: false })))
  for (let i = 0; i < mineCount; i++) {
    const pos = candidates[i]!
    const existing = get(next, pos.row, pos.col)!
    next[pos.row]![pos.col] = { ...existing, mine: true }
  }

  return computeNumbers(next)
}

// ── Adjacency numbers ──────────────────────────────────────────────────────

export function computeNumbers(board: Board): Board {
  const { height, width } = dims(board)

  return board.map((row, r) =>
    row.map((cell, c): Cell => {
      if (cell.mine) return cell
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (inBounds(nr, nc, height, width) && get(board, nr, nc)?.mine) count++
        }
      }
      return { ...cell, adjacent: count }
    }),
  )
}

// ── Flood-fill reveal ──────────────────────────────────────────────────────

/**
 * Reveal the cell at `pos`. If it is blank (adjacent === 0), recursively
 * reveal all connected hidden non-mine cells (flood fill).
 * Returns a new board with the affected cells revealed.
 */
export function floodReveal(board: Board, pos: Position): Board {
  const { height, width } = dims(board)

  const next: Board = board.map((row) => row.map((cell): Cell => ({ ...cell })))
  const queue: Position[] = [pos]
  const visited = new Set<string>([`${pos.row},${pos.col}`])

  while (queue.length > 0) {
    const { row: r, col: c } = queue.shift()!
    const cell = get(next, r, c)
    if (!cell || cell.state === 'flagged' || cell.mine) continue
    next[r]![c] = { ...cell, state: 'revealed' }

    // Only spread from blank cells
    if (cell.adjacent !== 0) continue

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr
        const nc = c + dc
        const key = `${nr},${nc}`
        if (inBounds(nr, nc, height, width) && !visited.has(key)) {
          visited.add(key)
          if (get(next, nr, nc)?.state === 'hidden') queue.push({ row: nr, col: nc })
        }
      }
    }
  }

  return next
}

// ── Chord reveal ───────────────────────────────────────────────────────────

/**
 * Chord-click: if the number of flags around a revealed number cell equals
 * its adjacent count, reveal all non-flagged hidden neighbours.
 * Returns null if the chord is not valid (wrong flag count).
 */
export function chordReveal(board: Board, pos: Position): Board | null {
  const { height, width } = dims(board)
  const { row: r, col: c } = pos
  const cell = get(board, r, c)

  if (!cell || cell.state !== 'revealed' || cell.adjacent === 0) return null

  let flagCount = 0
  const neighbours: Position[] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (inBounds(nr, nc, height, width)) {
        const n = get(board, nr, nc)!
        if (n.state === 'flagged') flagCount++
        else if (n.state === 'hidden') neighbours.push({ row: nr, col: nc })
      }
    }
  }

  if (flagCount !== cell.adjacent) return null

  let next = board
  for (const n of neighbours) {
    next = floodReveal(next, n)
  }
  return next
}

// ── Win check ──────────────────────────────────────────────────────────────

/** Returns true when all non-mine cells are revealed. */
export function checkWin(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.mine || cell.state === 'revealed'))
}

// ── Game-over reveal ──────────────────────────────────────────────────────

/** Reveal all cells for the end-of-game state (win or loss). */
export function revealAll(board: Board): Board {
  return board.map((row) => row.map((cell): Cell => ({ ...cell, state: 'revealed' })))
}

// ── Neighbour flag count (for UI hints) ────────────────────────────────────

export function neighbourFlagCount(board: Board, pos: Position): number {
  const { height, width } = dims(board)
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = pos.row + dr
      const nc = pos.col + dc
      if (inBounds(nr, nc, height, width) && get(board, nr, nc)?.state === 'flagged') count++
    }
  }
  return count
}

