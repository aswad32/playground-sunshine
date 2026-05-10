import { describe, it, expect } from 'vitest'
import {
  createEmptyBoard,
  placeMines,
  computeNumbers,
  floodReveal,
  chordReveal,
  checkWin,
  revealAll,
  neighbourFlagCount,
  type Position,
} from '../app/utils/minesweeper'

// ── createEmptyBoard ────────────────────────────────────────────────────────

describe('createEmptyBoard', () => {
  it('creates a board with the correct dimensions', () => {
    const board = createEmptyBoard(9, 9)
    expect(board).toHaveLength(9)
    expect(board[0]).toHaveLength(9)
  })

  it('initialises all cells as hidden, non-mine, with 0 adjacent', () => {
    const board = createEmptyBoard(5, 5)
    for (const row of board) {
      for (const cell of row) {
        expect(cell.mine).toBe(false)
        expect(cell.adjacent).toBe(0)
        expect(cell.state).toBe('hidden')
      }
    }
  })
})

// ── placeMines ─────────────────────────────────────────────────────────────

describe('placeMines', () => {
  const safe: Position = { row: 4, col: 4 }

  it('places exactly the requested number of mines', () => {
    const board = placeMines(createEmptyBoard(9, 9), 10, safe)
    const count = board.flat().filter((c) => c.mine).length
    expect(count).toBe(10)
  })

  it('never places a mine on the safe cell', () => {
    for (let i = 0; i < 20; i++) {
      const board = placeMines(createEmptyBoard(9, 9), 10, safe)
      expect(board[safe.row][safe.col].mine).toBe(false)
    }
  })

  it('never places a mine on any immediate neighbour of the safe cell', () => {
    for (let i = 0; i < 20; i++) {
      const board = placeMines(createEmptyBoard(9, 9), 10, safe)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          expect(board[safe.row + dr][safe.col + dc].mine).toBe(false)
        }
      }
    }
  })
})

// ── computeNumbers ─────────────────────────────────────────────────────────

describe('computeNumbers', () => {
  it('counts adjacent mines correctly', () => {
    // 3×3 board, mine at [0][0]
    const board = createEmptyBoard(3, 3)
    board[0][0] = { ...board[0][0], mine: true }
    const result = computeNumbers(board)
    expect(result[0][1].adjacent).toBe(1) // right of mine
    expect(result[1][0].adjacent).toBe(1) // below mine
    expect(result[1][1].adjacent).toBe(1) // diagonal
    expect(result[2][2].adjacent).toBe(0) // far corner
  })

  it('does not set adjacent on mine cells', () => {
    const board = createEmptyBoard(3, 3)
    board[1][1] = { ...board[1][1], mine: true }
    const result = computeNumbers(board)
    expect(result[1][1].adjacent).toBe(0)
  })
})

// ── floodReveal ────────────────────────────────────────────────────────────

describe('floodReveal', () => {
  it('reveals only the clicked cell if it has adjacent mines', () => {
    const board = createEmptyBoard(3, 3)
    board[0][0] = { ...board[0][0], mine: true }
    const numbered = computeNumbers(board)
    const result = floodReveal(numbered, { row: 0, col: 1 })
    // [0][1] has adjacent = 1, should be revealed
    expect(result[0][1].state).toBe('revealed')
    // other hidden cells should stay hidden
    expect(result[1][0].state).toBe('hidden')
    expect(result[2][2].state).toBe('hidden')
  })

  it('flood-fills blank cells recursively', () => {
    // 5×5 board, mine only at corner [0][4]
    const board = createEmptyBoard(5, 5)
    board[0][4] = { ...board[0][4], mine: true }
    const numbered = computeNumbers(board)
    // Click far corner — all blank area should be revealed
    const result = floodReveal(numbered, { row: 4, col: 0 })
    // All non-mine cells reachable from [4][0] with adjacent=0 must be revealed
    expect(result[4][0].state).toBe('revealed')
    expect(result[3][0].state).toBe('revealed')
    // Cells adjacent to the mine will stop the flood
    expect(result[0][3].state).toBe('revealed') // numbered, but reachable via flood edge
  })

  it('does not reveal flagged cells', () => {
    const board = createEmptyBoard(3, 3)
    const withFlag = board.map((row, r) =>
      row.map((cell, c) => (r === 1 && c === 1 ? { ...cell, state: 'flagged' as const } : cell)),
    )
    const result = floodReveal(withFlag, { row: 0, col: 0 })
    expect(result[1][1].state).toBe('flagged')
  })
})

// ── chordReveal ────────────────────────────────────────────────────────────

describe('chordReveal', () => {
  it('returns null when flag count does not match adjacent count', () => {
    const board = createEmptyBoard(3, 3)
    board[0][0] = { ...board[0][0], mine: true }
    const numbered = computeNumbers(board)
    // Reveal [0][1] (adjacent=1) without flagging anything
    const afterReveal = floodReveal(numbered, { row: 0, col: 1 })
    const result = chordReveal(afterReveal, { row: 0, col: 1 })
    expect(result).toBeNull()
  })

  it('reveals neighbours when flag count matches', () => {
    const board = createEmptyBoard(3, 3)
    board[0][0] = { ...board[0][0], mine: true }
    let b = computeNumbers(board)
    // Reveal [0][1]
    b = floodReveal(b, { row: 0, col: 1 })
    // Flag the mine at [0][0]
    b[0][0] = { ...b[0][0], state: 'flagged' }
    const result = chordReveal(b, { row: 0, col: 1 })
    expect(result).not.toBeNull()
    // [1][0] and [1][1] should now be revealed
    expect(result![1][0].state).toBe('revealed')
    expect(result![1][1].state).toBe('revealed')
  })
})

// ── checkWin ───────────────────────────────────────────────────────────────

describe('checkWin', () => {
  it('returns false when hidden non-mine cells remain', () => {
    const board = createEmptyBoard(2, 2)
    board[0][0] = { ...board[0][0], mine: true }
    expect(checkWin(board)).toBe(false)
  })

  it('returns true when all non-mine cells are revealed', () => {
    const board = createEmptyBoard(2, 2)
    board[0][0] = { ...board[0][0], mine: true }
    board[0][1] = { ...board[0][1], state: 'revealed' }
    board[1][0] = { ...board[1][0], state: 'revealed' }
    board[1][1] = { ...board[1][1], state: 'revealed' }
    expect(checkWin(board)).toBe(true)
  })

  it('returns true even if mine cells are still hidden', () => {
    const board = createEmptyBoard(2, 2)
    board[0][0] = { ...board[0][0], mine: true } // still hidden
    board[0][1] = { ...board[0][1], state: 'revealed' }
    board[1][0] = { ...board[1][0], state: 'revealed' }
    board[1][1] = { ...board[1][1], state: 'revealed' }
    expect(checkWin(board)).toBe(true)
  })
})

// ── revealAll ──────────────────────────────────────────────────────────────

describe('revealAll', () => {
  it('sets all cells to revealed', () => {
    const board = createEmptyBoard(3, 3)
    const result = revealAll(board)
    for (const row of result) {
      for (const cell of row) {
        expect(cell.state).toBe('revealed')
      }
    }
  })
})

// ── neighbourFlagCount ─────────────────────────────────────────────────────

describe('neighbourFlagCount', () => {
  it('counts flagged neighbours correctly', () => {
    const board = createEmptyBoard(3, 3)
    board[0][0] = { ...board[0][0], state: 'flagged' }
    board[0][2] = { ...board[0][2], state: 'flagged' }
    const count = neighbourFlagCount(board, { row: 1, col: 1 })
    expect(count).toBe(2)
  })

  it('returns 0 when no neighbours are flagged', () => {
    const board = createEmptyBoard(3, 3)
    expect(neighbourFlagCount(board, { row: 1, col: 1 })).toBe(0)
  })
})
