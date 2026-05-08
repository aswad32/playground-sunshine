import { describe, it, expect } from 'vitest'
import {
  emptyBoard,
  cloneBoard,
  hasConflict,
  isBoardValid,
  isBoardComplete,
  getConflictPositions,
  boardToString,
  stringToBoard,
  boardToAsciiGrid,
} from '../app/utils/sudokuHelpers'

// A valid complete board for testing
const COMPLETE: number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

const COMPLETE_STR = COMPLETE.flat().join('')

describe('emptyBoard', () => {
  it('returns a 9×9 array of zeros', () => {
    const b = emptyBoard()
    expect(b).toHaveLength(9)
    b.forEach((row) => {
      expect(row).toHaveLength(9)
      row.forEach((v) => expect(v).toBe(0))
    })
  })
})

describe('cloneBoard', () => {
  it('deep copies the board', () => {
    const b = emptyBoard()
    const c = cloneBoard(b)
    c[0][0] = 5
    expect(b[0][0]).toBe(0)
  })
})

describe('hasConflict', () => {
  it('returns false for value 0', () => {
    expect(hasConflict(emptyBoard(), 0, 0, 0)).toBe(false)
  })

  it('detects row conflict', () => {
    const b = emptyBoard()
    b[0][3] = 5
    expect(hasConflict(b, 0, 0, 5)).toBe(true)
  })

  it('detects column conflict', () => {
    const b = emptyBoard()
    b[3][0] = 5
    expect(hasConflict(b, 0, 0, 5)).toBe(true)
  })

  it('detects box conflict', () => {
    const b = emptyBoard()
    b[1][1] = 5
    expect(hasConflict(b, 0, 0, 5)).toBe(true)
  })

  it('excludes the cell itself when checking its own value', () => {
    const b = emptyBoard()
    b[0][0] = 5
    expect(hasConflict(b, 0, 0, 5)).toBe(false)
  })

  it('returns false when no conflict', () => {
    const b = emptyBoard()
    b[0][3] = 3
    expect(hasConflict(b, 0, 0, 5)).toBe(false)
  })
})

describe('isBoardValid', () => {
  it('returns true for empty board', () => {
    expect(isBoardValid(emptyBoard())).toBe(true)
  })

  it('returns true for complete valid board', () => {
    expect(isBoardValid(COMPLETE)).toBe(true)
  })

  it('returns false when a row has duplicates', () => {
    const b = cloneBoard(COMPLETE)
    b[0][0] = b[0][1] // duplicate in row 0
    expect(isBoardValid(b)).toBe(false)
  })
})

describe('isBoardComplete', () => {
  it('returns false for empty board', () => {
    expect(isBoardComplete(emptyBoard())).toBe(false)
  })

  it('returns true for a complete valid board', () => {
    expect(isBoardComplete(COMPLETE)).toBe(true)
  })

  it('returns false if one cell is empty', () => {
    const b = cloneBoard(COMPLETE)
    b[4][4] = 0
    expect(isBoardComplete(b)).toBe(false)
  })
})

describe('getConflictPositions', () => {
  it('returns empty array for empty cell', () => {
    expect(getConflictPositions(emptyBoard(), 0, 0)).toEqual([])
  })

  it('returns the conflicting cells', () => {
    const b = emptyBoard()
    b[0][0] = 5
    b[0][5] = 5 // row conflict
    b[7][0] = 5 // col conflict
    const conflicts = getConflictPositions(b, 0, 0)
    expect(conflicts).toContainEqual({ row: 0, col: 5 })
    expect(conflicts).toContainEqual({ row: 7, col: 0 })
  })

  it('does not include the cell itself', () => {
    const b = emptyBoard()
    b[0][0] = 5
    b[0][1] = 5
    const conflicts = getConflictPositions(b, 0, 0)
    expect(conflicts.some((p) => p.row === 0 && p.col === 0)).toBe(false)
  })
})

describe('boardToString', () => {
  it('serialises a complete board to 81 chars', () => {
    expect(boardToString(COMPLETE)).toBe(COMPLETE_STR)
    expect(boardToString(COMPLETE)).toHaveLength(81)
  })

  it('uses 0 for empty cells', () => {
    const b = emptyBoard()
    expect(boardToString(b)).toBe('0'.repeat(81))
  })
})

describe('stringToBoard', () => {
  it('parses a valid 81-char string', () => {
    const b = stringToBoard(COMPLETE_STR)
    expect(b).not.toBeNull()
    expect(b![0][0]).toBe(5)
    expect(b![8][8]).toBe(9)
  })

  it('treats dots as empty cells', () => {
    const s = '.'.repeat(81)
    const b = stringToBoard(s)
    expect(b).not.toBeNull()
    expect(b!.flat().every((v) => v === 0)).toBe(true)
  })

  it('strips pipes, dashes, pluses, and spaces', () => {
    const raw = '| 5 3 4 | 6 7 8 | 9 1 2 |\n' +
                '| 6 7 2 | 1 9 5 | 3 4 8 |\n' +
                '| 1 9 8 | 3 4 2 | 5 6 7 |\n' +
                '+-------+-------+-------+\n' +
                '| 8 5 9 | 7 6 1 | 4 2 3 |\n' +
                '| 4 2 6 | 8 5 3 | 7 9 1 |\n' +
                '| 7 1 3 | 9 2 4 | 8 5 6 |\n' +
                '+-------+-------+-------+\n' +
                '| 9 6 1 | 5 3 7 | 2 8 4 |\n' +
                '| 2 8 7 | 4 1 9 | 6 3 5 |\n' +
                '| 3 4 5 | 2 8 6 | 1 7 9 |\n'
    const b = stringToBoard(raw)
    expect(b).not.toBeNull()
    expect(b![0][0]).toBe(5)
  })

  it('returns null for wrong-length string', () => {
    expect(stringToBoard('123')).toBeNull()
  })

  it('returns null for invalid characters', () => {
    expect(stringToBoard('x'.repeat(81))).toBeNull()
  })
})

describe('boardToAsciiGrid', () => {
  it('produces a string with 13 lines (9 rows + 2 separators + extra from first pass)', () => {
    const lines = boardToAsciiGrid(emptyBoard()).split('\n')
    // 9 data rows + 2 separator rows = 11
    expect(lines).toHaveLength(11)
  })

  it('contains pipe characters', () => {
    expect(boardToAsciiGrid(emptyBoard())).toContain('|')
  })
})
