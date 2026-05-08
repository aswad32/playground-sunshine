import type { Board, Difficulty } from './sudokuHelpers'
import { generatePuzzle } from './sudokuGenerator'

// ── Layout constants (mm) ──────────────────────────────────────────────────
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 18

// Two puzzles per page, each in its own half
const PUZZLE_AREA_H = (PAGE_H - MARGIN * 2) / 2
const GRID_SIZE = Math.min(PAGE_W - MARGIN * 2, PUZZLE_AREA_H - 18) // keep it square
const CELL = GRID_SIZE / 9

// ── Colour / stroke helpers ────────────────────────────────────────────────
const COL_GIVEN = '#111111'
const COL_GRID_THIN = '#bbbbbb'
const COL_GRID_THICK = '#333333'
const COL_LABEL = '#444444'
const COL_SOLUTION = '#2563eb' // blue for solution digits

// ── Types ──────────────────────────────────────────────────────────────────
export interface PdfPuzzle {
  puzzle: Board
  solution: Board
  difficulty: Difficulty
  index: number   // 1-based
}

// ── Draw one 9×9 grid ─────────────────────────────────────────────────────
function drawGrid(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  board: Board,
  originX: number,
  originY: number,
  digitColor: string,
  smallFont: boolean,
) {
  const fontSize = smallFont ? 5 : 9

  // Cell backgrounds (all white — handled by page bg)
  // Draw digits first, then lines on top
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(fontSize)
  doc.setTextColor(digitColor)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c]
      if (v === 0) continue
      const x = originX + c * CELL + CELL / 2
      const y = originY + r * CELL + CELL / 2 + (smallFont ? 1.5 : 2.2)
      doc.text(String(v), x, y, { align: 'center', baseline: 'middle' })
    }
  }

  // Thin cell borders
  doc.setDrawColor(COL_GRID_THIN)
  doc.setLineWidth(0.2)
  for (let i = 0; i <= 9; i++) {
    // skip positions that will be drawn thick
    if (i % 3 === 0) continue
    const x = originX + i * CELL
    const y = originY + i * CELL
    doc.line(x, originY, x, originY + GRID_SIZE)        // vertical
    doc.line(originX, y, originX + GRID_SIZE, y)         // horizontal
  }

  // Thick box borders (every 3rd line including outer boundary)
  doc.setDrawColor(COL_GRID_THICK)
  doc.setLineWidth(0.6)
  for (let i = 0; i <= 9; i += 3) {
    const x = originX + i * CELL
    const y = originY + i * CELL
    doc.line(x, originY, x, originY + GRID_SIZE)
    doc.line(originX, y, originX + GRID_SIZE, y)
  }
}

// ── Capitalise first letter ────────────────────────────────────────────────
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Main export function ───────────────────────────────────────────────────

/**
 * Generate `count` Sudoku puzzles at `difficulty`, draw them into a jsPDF
 * document (2 puzzles per A4 page + solutions page), and trigger download.
 *
 * @param difficulty  Difficulty level for all generated puzzles
 * @param count       Number of puzzles (1–10)
 * @param onProgress  Optional callback called after each puzzle is generated
 */
export async function exportSudokuPdf(
  difficulty: Difficulty,
  count: number,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  // ── 1. Generate all puzzles ─────────────────────────────────────────────
  const puzzles: PdfPuzzle[] = []
  for (let i = 0; i < count; i++) {
    // Yield to UI between generations so the progress callback renders
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    const gen = generatePuzzle(difficulty)
    puzzles.push({ puzzle: gen.puzzle, solution: gen.solution, difficulty, index: i + 1 })
    onProgress?.(i + 1, count)
  }

  // ── 2. Build PDF ────────────────────────────────────────────────────────
  // Dynamic import so jsPDF is only loaded when the user clicks Export
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // ── 3. Puzzle pages (2 per page) ────────────────────────────────────────
  for (let i = 0; i < puzzles.length; i++) {
    const p = puzzles[i]
    const isFirstOnPage = i % 2 === 0

    if (!isFirstOnPage) {
      // already on same page — second puzzle goes in lower half
    } else if (i > 0) {
      doc.addPage()
    }

    const gridX = (PAGE_W - GRID_SIZE) / 2
    const slotOffsetY = isFirstOnPage ? 0 : PUZZLE_AREA_H
    const labelY = MARGIN + slotOffsetY + 6
    const gridY = MARGIN + slotOffsetY + 10

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COL_LABEL)
    doc.text(`Puzzle ${p.index} — ${cap(p.difficulty)}`, gridX, labelY)

    // Grid
    drawGrid(doc, p.puzzle, gridX, gridY, COL_GIVEN, false)

    // Divider between two puzzles on the same page
    if (!isFirstOnPage) {
      doc.setDrawColor('#e5e7eb')
      doc.setLineWidth(0.3)
      doc.line(MARGIN, MARGIN + PUZZLE_AREA_H, PAGE_W - MARGIN, MARGIN + PUZZLE_AREA_H)
    }
  }

  // ── 4. Solutions page ────────────────────────────────────────────────────
  doc.addPage()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(COL_LABEL)
  doc.text('Solutions', MARGIN, MARGIN)

  // 3 columns of compact solution grids
  const COLS = 3
  const SOL_GRID = (PAGE_W - MARGIN * 2 - (COLS - 1) * 6) / COLS  // width per solution
  const SOL_CELL = SOL_GRID / 9
  const ROW_H = SOL_GRID + 8   // grid height + label space

  for (let i = 0; i < puzzles.length; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const sx = MARGIN + col * (SOL_GRID + 6)
    const sy = MARGIN + 8 + row * ROW_H

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(COL_LABEL)
    doc.text(`Puzzle ${puzzles[i].index}`, sx, sy + 3.5)

    // Draw compact solution grid (override CELL size via local helper)
    drawSolutionGrid(doc, puzzles[i].solution, sx, sy + 5, SOL_GRID)
  }

  // ── 5. Download ──────────────────────────────────────────────────────────
  const filename = `sudoku-${difficulty}-${count}puzzle${count !== 1 ? 's' : ''}.pdf`
  doc.save(filename)
}

/** Draw a compact solution grid at a given size (not using the module-level CELL) */
function drawSolutionGrid(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  board: Board,
  ox: number,
  oy: number,
  size: number,
) {
  const cell = size / 9

  // Digits
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.5)
  doc.setTextColor(COL_SOLUTION)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c]
      if (v === 0) continue
      doc.text(String(v), ox + c * cell + cell / 2, oy + r * cell + cell / 2 + 1.4, {
        align: 'center',
        baseline: 'middle',
      })
    }
  }

  // Thin lines
  doc.setDrawColor(COL_GRID_THIN)
  doc.setLineWidth(0.15)
  for (let i = 0; i <= 9; i++) {
    if (i % 3 === 0) continue
    doc.line(ox + i * cell, oy, ox + i * cell, oy + size)
    doc.line(ox, oy + i * cell, ox + size, oy + i * cell)
  }

  // Thick lines
  doc.setDrawColor(COL_GRID_THICK)
  doc.setLineWidth(0.4)
  for (let i = 0; i <= 9; i += 3) {
    doc.line(ox + i * cell, oy, ox + i * cell, oy + size)
    doc.line(ox, oy + i * cell, ox + size, oy + i * cell)
  }
}
