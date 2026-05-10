import { describe, it, expect } from 'vitest'
import {
  getRowClues,
  getColClues,
  checkLine,
  checkWin,
  generatePuzzle,
  createPlayerGrid,
} from '../app/utils/nonogram'

// ── getRowClues ─────────────────────────────────────────────────────────────

describe('getRowClues', () => {
  it('returns [0] for an all-empty row', () => {
    expect(getRowClues([false, false, false])).toEqual([0])
  })

  it('returns single run for a fully filled row', () => {
    expect(getRowClues([true, true, true])).toEqual([3])
  })

  it('returns multiple runs separated by gaps', () => {
    expect(getRowClues([true, true, false, true])).toEqual([2, 1])
  })

  it('handles leading and trailing empty cells', () => {
    expect(getRowClues([false, true, true, false])).toEqual([2])
  })

  it('handles alternating cells', () => {
    expect(getRowClues([true, false, true, false, true])).toEqual([1, 1, 1])
  })
})

// ── getColClues ─────────────────────────────────────────────────────────────

describe('getColClues', () => {
  it('extracts a column and computes runs correctly', () => {
    const grid = [
      [true, false],
      [true, false],
      [false, true],
    ]
    expect(getColClues(grid, 0)).toEqual([2])
    expect(getColClues(grid, 1)).toEqual([1])
  })

  it('returns [0] for an all-empty column', () => {
    const grid = [[false], [false], [false]]
    expect(getColClues(grid, 0)).toEqual([0])
  })
})

// ── checkLine ──────────────────────────────────────────────────────────────

describe('checkLine', () => {
  it('returns correct when fully determined and matching', () => {
    expect(checkLine([true, true, false, true], [2, 1])).toBe('correct')
  })

  it('returns invalid when fully determined and not matching', () => {
    expect(checkLine([true, true, true, false], [2, 1])).toBe('invalid')
  })

  it('returns incomplete when unknowns remain and no violation', () => {
    expect(checkLine([true, null, null, null], [2])).toBe('incomplete')
  })

  it('returns invalid when runs already exceed clue', () => {
    // 3 filled but clue says max 2
    expect(checkLine([true, true, true, null], [2])).toBe('invalid')
  })

  it('returns invalid when more run groups than clues', () => {
    expect(checkLine([true, false, true, null], [1])).toBe('invalid')
  })

  it('returns correct for all-empty line matching [0] clue', () => {
    expect(checkLine([false, false, false], [0])).toBe('correct')
  })

  it('returns incomplete for fully unknown line', () => {
    expect(checkLine([null, null, null], [2])).toBe('incomplete')
  })
})

// ── checkWin ───────────────────────────────────────────────────────────────

describe('checkWin', () => {
  const solution = [[true, false], [false, true]]

  it('returns true when player grid matches solution exactly', () => {
    const player = [[true, false], [false, true]]
    expect(checkWin(player, solution)).toBe(true)
  })

  it('returns false when a cell differs', () => {
    const player = [[true, true], [false, true]]
    expect(checkWin(player, solution)).toBe(false)
  })

  it('returns false when unknowns remain', () => {
    const player = [[true, null], [false, true]]
    expect(checkWin(player, solution)).toBe(false)
  })
})

// ── generatePuzzle ─────────────────────────────────────────────────────────

describe('generatePuzzle', () => {
  it('returns a puzzle with correct dimensions', () => {
    const p = generatePuzzle(8, 6)
    expect(p.width).toBe(8)
    expect(p.height).toBe(6)
    expect(p.solution).toHaveLength(6)
    expect(p.solution[0]).toHaveLength(8)
  })

  it('has the correct number of row and column clue arrays', () => {
    const p = generatePuzzle(5, 5)
    expect(p.rowClues).toHaveLength(5)
    expect(p.colClues).toHaveLength(5)
  })

  it('clues match the solution', () => {
    const p = generatePuzzle(5, 5)
    for (let r = 0; r < p.height; r++) {
      const row = p.solution[r]!
      const runs: number[] = []
      let run = 0
      for (const cell of row) {
        if (cell) { run++ } else if (run > 0) { runs.push(run); run = 0 }
      }
      if (run > 0) runs.push(run)
      const expected = runs.length > 0 ? runs : [0]
      expect(p.rowClues[r]).toEqual(expected)
    }
  })
})

// ── createPlayerGrid ───────────────────────────────────────────────────────

describe('createPlayerGrid', () => {
  it('creates a grid of the right size, all null', () => {
    const g = createPlayerGrid(4, 3)
    expect(g).toHaveLength(3)
    expect(g[0]).toHaveLength(4)
    for (const row of g) {
      for (const cell of row) {
        expect(cell).toBeNull()
      }
    }
  })
})
