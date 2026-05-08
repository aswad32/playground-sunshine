# Sudoku Solver Spec

## Goal

Accept a Sudoku puzzle as input (typed into a grid or pasted as a string), solve it using a backtracking algorithm, and display the solution. Handles invalid puzzles and puzzles with multiple solutions gracefully.

## Route

/tools/sudoku-solver

## Inputs

### Grid input (primary)
- Interactive 9×9 grid where the user can click each cell and type a digit (1–9)
- Empty cells are left blank (representing unknowns)
- Given cells (user-entered) are visually distinct from solution cells

### String input (secondary)
- A text field accepting an 81-character string where digits 1–9 represent given cells and `0` or `.` represent empty cells
- Example: `530070000600195000098000060800060003400803001700020006060000280000419005000080079`
- Parsing is lenient: strips whitespace, newlines, and pipe `|` characters to support formats like:
  ```
  5 3 . | . 7 . | . . .
  6 . . | 1 9 5 | . . .
  ```
- Paste triggers automatic parse and population of the grid

### Import from Sudoku Generator
- A "Play in Solver" link from the Generator page pre-fills the grid via a query param (`?puzzle=<81-char-string>`)

## Actions

- **Solve** — run the backtracking solver and display the solution
- **Step** *(optional, nice-to-have)* — reveal one correct cell at a time (like a hint)
- **Clear** — reset the grid and input field
- **Copy solution** — copy the solution as an 81-character string

## Output

- The solved grid displayed in the same 9×9 layout
- Given cells in bold/dark, solved cells in a different colour (e.g. blue/green)
- Solution string shown below the grid as a copiable text field

## Error Handling

| Condition | Message |
|---|---|
| Puzzle has no solution | "This puzzle has no solution. Check for conflicting numbers." |
| Puzzle has multiple solutions | "This puzzle has multiple solutions — a valid Sudoku puzzle should have exactly one. The first solution found is shown." |
| Input string wrong length | "Paste an 81-character string (digits 1–9 for givens, 0 or . for blanks)." |
| Grid has obvious conflicts (same digit twice in a row/col/box) | Highlight conflicts in red before solving and show: "Fix the highlighted conflicts before solving." |

## Algorithm

- **Backtracking with constraint propagation** for correctness and speed
- To detect multiple solutions: continue searching after the first solution is found; if a second is found, stop and flag
- Puzzles with 17+ givens and a unique solution should solve in < 50ms
- Very hard/minimal puzzles (17 givens) should still solve within 500ms

## Layout

- Grid on the left, controls and string input on the right (stacked on mobile)
- "Solve" button prominent below the grid
- Solution string in a read-only textarea below the solved grid

## Privacy

Runs fully in the browser. No puzzle data is sent anywhere.

## SEO

```
title: 'Sudoku Solver - Playground Sunshine'
description: 'Solve any Sudoku puzzle instantly in your browser — paste an 81-character string or enter the puzzle manually. Free, private, no install.'
```

## Utility Dependencies

- `utils/sudokuSolver.ts` — backtracking solver; exports `solve(board): SolveResult`
- `utils/sudokuHelpers.ts` — shared types (`Board`, `Cell`), conflict detection, string ↔ board conversion

## Tests

- Valid puzzle with unique solution returns correct solution
- Puzzle with no solution returns `{ solved: false, reason: 'no-solution' }`
- Puzzle with multiple solutions returns `{ solved: true, multiSolution: true }` with one valid solution
- Empty board (all zeros) returns multiple solutions flag
- 81-char string with dots parses correctly into a board
- 81-char string with pipes and spaces parses correctly
- String shorter or longer than 81 significant characters returns a parse error
- Conflict pre-check detects two identical digits in the same row/column/box
