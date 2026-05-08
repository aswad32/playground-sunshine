# Sudoku Generator Spec

## Goal

Generate valid, uniquely-solvable Sudoku puzzles at a chosen difficulty level. Display the generated puzzle and let the user copy it, play it, or send it to the solver.

## Route

/tools/sudoku-generator

## How Generation Works

1. **Start with a complete, valid solution** — fill a 9×9 board using a randomised backtracking algorithm (shuffle candidate digits before placing)
2. **Remove cells one by one** in random order — after each removal, verify the puzzle still has exactly one solution using the backtracking solver
3. **Stop removing cells** once the target number of givens for the requested difficulty is reached or no more cells can be removed without creating multiple solutions

This guarantees every generated puzzle has a unique solution.

### Givens by difficulty

| Difficulty | Target givens |
|---|---|
| Easy | 36–46 |
| Medium | 27–35 |
| Hard | 22–26 |
| Expert | 17–21 |

Expert puzzles may take slightly longer to generate (up to ~1s on slow devices) due to the increased backtracking required.

## Actions

- **Generate** — produce a new puzzle at the selected difficulty
- **Copy as string** — copy the puzzle as an 81-character string (`0` for blanks)
- **Copy as grid** — copy a human-readable ASCII grid representation
- **Play this puzzle** — open the puzzle in the Sudoku Player (`/tools/sudoku-player?puzzle=<string>`)
- **Solve this puzzle** — open the puzzle in the Sudoku Solver (`/tools/sudoku-solver?puzzle=<string>`)
- **Export to PDF** — generate and download a PDF of multiple puzzles (see below)

## Output

- The generated puzzle displayed in a read-only 9×9 grid (given cells filled, empty cells blank)
- Difficulty badge and given-cell count shown (e.g. "Hard — 24 givens")
- 81-character puzzle string in a copiable text field below the grid
- "Play" and "Solve" action buttons

## Loading State

- Show a spinner or "Generating…" indicator while the puzzle is being produced
- For Expert difficulty, show a note: "Expert puzzles may take a moment to generate."
- Consider running generation in a **Web Worker** to avoid blocking the UI thread — especially for Hard and Expert difficulties

## PDF Export

### User controls

| Control | Options | Default |
|---|---|---|
| Difficulty | Easy / Medium / Hard / Expert | Same as current page difficulty |
| Number of puzzles | 1 – 10 | 4 |

The max is capped at **10 puzzles** to keep generation and file size reasonable.

### PDF layout

- **Page size**: A4 portrait (210 × 297 mm)
- **Puzzles per page**: 2 (one in the top half, one in the bottom half)
- **Total puzzle pages**: ceil(N / 2) — so 10 puzzles = 5 pages
- **Solutions page**: a final page listing all solutions in a compact 3-column grid layout, numbered to match the puzzles
- **Each puzzle block contains**:
  - A label: `Puzzle 1 — Medium` (difficulty + number)
  - The 9×9 grid drawn with thin lines for cell borders and thick lines for 3×3 box borders
  - Given digits printed in the cells; empty cells left blank
- **File name**: `sudoku-{difficulty}-{count}puzzles.pdf` (e.g. `sudoku-medium-4puzzles.pdf`)

### Implementation approach

Use **`jsPDF`** to draw grids programmatically:

1. Generate N puzzles using `generatePuzzle(difficulty)` in sequence
2. For each puzzle, draw:
   - A label above the grid
   - 9×9 cell lines (thin, gray)
   - 3×3 box lines (thick, black)
   - Given digits centred in their cells
3. Append a solutions page with compact grids (all 9×9 digits, no empty cells)
4. Call `jsPDF.save(filename)` to download

> `jsPDF` is the only new dependency required — ~230 KB gzipped, well-maintained, safe for browser.

### Loading / progress state

- While generating and building the PDF, show a progress message: "Generating {N} puzzles…"
- Disable the export button during generation
- On completion, the browser triggers the download automatically

### Error handling

- If any puzzle fails to generate within the timeout, show: "Could not generate all puzzles. Try a lower difficulty or fewer puzzles."
- The button re-enables so the user can retry

## Error Handling

- If generation exceeds a timeout (e.g. 5 seconds), show: "Generation took too long. Try again or choose a lower difficulty."
- If the solver dependency fails to load, show a generic error with a retry button

## Auto-generate on Load

- Automatically generate a Medium puzzle when the page first loads so there is immediate content
- The difficulty selector starts on Medium

## Layout

- Difficulty selector (Easy / Medium / Hard / Expert) at the top
- Generated puzzle grid centred below
- Difficulty badge + given count below the grid
- Puzzle string textarea + Copy as string / Copy as grid buttons
- Play and Solve action buttons
- **PDF Export section** (below the main puzzle):
  - Heading: "Export puzzles as PDF"
  - Difficulty pill selector (defaults to current difficulty)
  - Quantity stepper / selector: 1–10 puzzles (default 4)
  - "Download PDF" button — shows a spinner and progress text while generating

## Privacy

Runs fully in the browser. No puzzle data is sent anywhere.

## SEO

```
title: 'Sudoku Generator - Playground Sunshine'
description: 'Generate valid, uniquely-solvable Sudoku puzzles at any difficulty — Easy, Medium, Hard, or Expert. Free, instant, runs in your browser.'
```

## Utility Dependencies

- `utils/sudokuGenerator.ts` — exports `generatePuzzle(difficulty): GeneratedPuzzle`
  - `GeneratedPuzzle`: `{ puzzle: Board, solution: Board, givens: number, difficulty: Difficulty }`
- `utils/sudokuSolver.ts` — used internally to verify unique-solution property during cell removal
- `utils/sudokuHelpers.ts` — shared types, string ↔ board conversion, ASCII grid formatter
- `jsPDF` (npm: `jspdf`) — client-side PDF generation for the export feature

## Shared Utility Design (`utils/sudokuHelpers.ts`)

All three Sudoku tools share these pure functions:

```ts
type Board = number[][]  // 9x9, 0 = empty
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

function boardToString(board: Board): string        // → 81-char string
function stringToBoard(s: string): Board | null     // parse 81-char string
function boardToAsciiGrid(board: Board): string     // → human-readable grid
function getConflicts(board: Board, row: number, col: number, val: number): boolean
function isBoardValid(board: Board): boolean        // no conflicts anywhere
function isBoardComplete(board: Board): boolean     // all cells filled + valid
```

## Tests

- Generated Easy puzzle has 36–46 givens
- Generated Medium puzzle has 27–35 givens
- Generated Hard puzzle has 22–26 givens
- Generated Expert puzzle has 17–21 givens
- Every generated puzzle has exactly one solution (verified by solver)
- `boardToString` produces an 81-character string with no letters
- `stringToBoard` correctly parses a valid 81-char string
- `stringToBoard` returns null for strings that are too short/long or contain invalid characters
- `boardToAsciiGrid` output contains 9 rows and pipe separators
- `getConflicts` returns true when a digit appears twice in the same row
- `getConflicts` returns true when a digit appears twice in the same column
- `getConflicts` returns true when a digit appears twice in the same 3×3 box
- `getConflicts` returns false for a valid placement
- PDF export: generating N puzzles produces N valid puzzles before PDF creation (unit-testable; actual PDF rendering is browser-only and not unit tested)
