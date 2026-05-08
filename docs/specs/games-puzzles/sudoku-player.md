# Sudoku Player Spec

## Goal

A fully playable Sudoku game in the browser. Players can start a new game at a chosen difficulty, fill in numbers, get conflict feedback, use pencil marks, and check or reveal the solution.

## Route

/tools/sudoku-player

## Core Gameplay

### Board
- 9×9 grid divided into nine 3×3 subgrids
- Cells are either **given** (pre-filled, not editable, shown in darker text) or **empty** (player-editable)
- One cell is **selected** at a time; click or keyboard navigation (arrow keys) to move

### Input
- Click a cell to select it, then press a digit key (1–9) to fill it, or `Backspace`/`Delete` to clear it
- On-screen number pad (1–9 + Erase) for mobile users
- **Pencil mark mode** toggle: when active, digits are entered as small candidate notes in the cell rather than as a definitive value

### Conflict Highlighting
- Immediately highlight cells in red/orange if the entered number conflicts with another number in the same row, column, or 3×3 box
- Do not prevent the player from entering conflicting numbers — highlight only
- Highlight all cells that share the same value in the conflicting row/column/box

### Win State
- When all 81 cells are filled correctly (no conflicts), show a congratulations message
- Display elapsed time and difficulty
- Offer "Play again" and "New game" buttons

## Difficulty Levels

| Level | Givens (approx.) |
|---|---|
| Easy | 36–46 |
| Medium | 27–35 |
| Hard | 22–26 |
| Expert | 17–21 |

Puzzle generation is delegated to the **Sudoku Generator** utility (`utils/sudokuGenerator.ts`).

## Actions

- **New Game** — pick a difficulty and generate a fresh puzzle
- **Check** — highlight all incorrect cells (cells where player's value ≠ solution value)
- **Reveal solution** — fill in the full solution (with confirmation prompt)
- **Undo** — step back one move (maintain a move history stack)
- **Pencil mode toggle** — switch between definitive values and pencil marks
- **Erase** — clear the selected cell's value and pencil marks

## Timer

- Show elapsed time (MM:SS) from first interaction
- Pause/resume button
- Timer stops on win

## State Persistence

- Save current game state to `localStorage` keyed by difficulty so the player can resume after a page reload
- Only save if the game is in progress (not yet won)
- Prompt "Resume previous game?" on load if a saved game exists

## Layout

- Board centred, large enough to tap on mobile (each cell ≥ 44px)
- Number pad below the board on small screens, beside the board on larger screens
- Difficulty selector and timer in a header row above the board
- Action buttons (Check, Undo, Reveal) below the number pad

## Error Handling

- If puzzle generation fails for any reason, show a retry message and a "Try again" button
- Never show a puzzle with fewer than 17 givens (minimum for a unique solution)

## Privacy

Runs fully in the browser. No game data is sent anywhere.

## SEO

```
title: 'Sudoku Player - Playground Sunshine'
description: 'Play Sudoku directly in your browser — Easy, Medium, Hard, and Expert puzzles with conflict highlighting, pencil marks, and a timer.'
```

## Utility Dependencies

- `utils/sudokuGenerator.ts` — generate puzzles at a given difficulty
- `utils/sudokuSolver.ts` — validate and solve puzzles
- `utils/sudokuHelpers.ts` — shared types and pure board helpers (conflict detection, coordinate utilities)

## Tests

- Conflict detection correctly identifies row, column, and box conflicts
- No false conflict when a cell is empty
- Win detection triggers when all cells match the solution
- Win detection does not trigger when conflicts remain
- Move history undo restores previous cell value
- Pencil marks are stored and cleared independently of cell values
