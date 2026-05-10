# Nonogram (Picross) Spec

## Goal

A fully playable Nonogram / Picross puzzle game. Players fill in cells on a grid guided by numeric clues along each row and column to reveal a hidden pixel picture. Includes a built-in puzzle library and a puzzle generator.

## Route

`/tools/nonogram`

## Core Gameplay

### What is a Nonogram?

Each row and column has a sequence of clue numbers. Each number indicates a consecutive run of filled cells in that line, separated by at least one empty cell. The goal is to determine which cells are filled and which are empty to satisfy all clues simultaneously.

Example 5 × 5 grid:

```
Cols:  2  1  3  1  2
       -  -  -  -  -
  2  | ■  ■  .  .  .
  3  | .  ■  ■  ■  .
  1  | .  .  ■  .  .
 1 1 | ■  .  ■  .  .
  2  | .  .  ■  ■  .
```

### Cell States

| State | Display |
|---|---|
| Unknown | Empty tile |
| Filled | Solid coloured square |
| Crossed out | Light X mark (player marks a cell as definitely empty) |

### Interactions

- **Left-click / tap** — cycle: unknown → filled → unknown
- **Right-click / long-press** — cycle: unknown → crossed-out → unknown
- **Click-drag** — fill (or cross) a run of cells in one gesture; the action taken is determined by the first cell clicked
- **Keyboard** — arrow keys to navigate, `Space` to fill, `X` to cross out

### Clue Highlighting

- When a row or column is correctly solved, highlight its clue numbers in green
- When a row or column is impossible (filled cells already violate the clues), highlight in red
- This provides immediate feedback without revealing the solution

### Win State

- Detected when all rows and columns are satisfied
- Show a congratulations banner with the elapsed time
- Reveal the completed picture with a brief animation
- Offer "Next Puzzle" and "Back to Library" buttons

## Puzzle Library

- At least 20 built-in puzzles across three sizes:
  - **Small** — 5 × 5 (tutorial level)
  - **Medium** — 10 × 10
  - **Large** — 15 × 15
- Puzzles are static data in `utils/nonogramPuzzles.ts`, each entry containing:
  - `id`, `title`, `size`, `rowClues`, `colClues`, `solution` (2-D boolean array)
- A puzzle picker / gallery page shows puzzle thumbnails (rendered from the solution grid as a small pixel preview)

## Puzzle Generator

- Generates a random valid nonogram of a chosen size:
  - Randomly fills a grid with a given density (e.g. 50–65% filled)
  - Derives row and column clues from the filled grid
  - Does **not** guarantee a unique solution — a notice informs the player that multiple solutions may exist for generated puzzles
- Generator accessible via a "Random Puzzle" button on the picker

## Difficulty

Difficulty is purely a function of grid size and clue complexity — no explicit difficulty rating needed. The puzzle library labels puzzles as Easy / Medium / Hard based on size.

## Timer

- Starts on first interaction, stops on win
- Displayed as MM:SS above the board
- Best time per puzzle stored in `localStorage`

## State Persistence

- Current puzzle progress saved to `localStorage` per puzzle ID
- "Resume" prompt on returning to a puzzle already in progress

## Layout

- Puzzle picker / gallery as the default view for the route
- Puzzle play view:
  - Column clues above the grid, row clues to the left
  - Clue cells sized to match grid cells
  - Grid fills available width up to a comfortable maximum (≤ 600 px for 15 × 15)
  - On mobile, the full puzzle view is scrollable; cells are at least 28 px
- Timer and win/loss state in a bar above the grid

## Accessibility

- Each cell has `role="checkbox"` and `aria-label` (e.g. "Row 3, Column 5, empty")
- Clue cells marked as `aria-hidden` (decorative context, not interactive)
- Keyboard navigation fully functional

## Privacy

Runs fully in the browser. No puzzle data or progress is sent anywhere.

## How to Play (in-game instructions)

The tool page must display a collapsible "How to Play" panel (collapsed by default, remembers state in `localStorage`) so new users can learn the rules without leaving the page. The panel should be visible near the top of the play view, labelled clearly (e.g. a "How to play" link or `?` button).

Suggested panel content:

> **How to play Nonogram (Picross)**
>
> Each number on the left of a row (or above a column) tells you how many cells in a row are filled in that line. If there are multiple numbers, each group of filled cells is separated by at least one empty cell — and they must appear **in the order shown**, left-to-right or top-to-bottom.
>
> - **Click / tap** a cell to fill it in.
> - **Right-click / long-press** to mark a cell with ✕ if you know it must be empty — this is just a helper, not required.
> - **Click and drag** to fill or mark several cells at once.
> - Clue numbers turn **green** when that line is solved, and **red** if you've made an impossible mistake.
>
> Start with a row or column that has only one possible arrangement (e.g. a clue equal to the full line length), then use those filled cells as anchors for crossing off other options. Work your way inwards!

The panel content is plain text / simple HTML inside the Vue component — no separate component needed.

## Implementation Notes

- Pure logic in `utils/nonogram.ts`:
  - `getRowClues(row: boolean[]): number[]`
  - `getColClues(grid: boolean[][], col: number): number[]`
  - `checkLine(filled: (boolean | null)[], clues: number[]): 'correct' | 'invalid' | 'incomplete'`
  - `generatePuzzle(width: number, height: number, density?: number): NonogramPuzzle`
  - `checkWin(playerGrid: (boolean | null)[][], solution: boolean[][]): boolean`
- Puzzle data: `utils/nonogramPuzzles.ts`
- Page: `pages/tools/nonogram.vue`
- No external game library required; pure Vue 3 + CSS grid
