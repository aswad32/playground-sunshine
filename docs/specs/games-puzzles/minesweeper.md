# Minesweeper Spec

## Goal

A faithful, fully playable Minesweeper game in the browser. Players reveal cells, flag suspected mines, and try to clear the board without hitting a mine. Configurable grid sizes and a clean, tap-friendly UI.

## Route

`/tools/minesweeper`

## Core Gameplay

### Board

- Rectangular grid of hidden cells
- A random subset of cells contain mines (count depends on difficulty)
- Each non-mine cell has a **number** (1–8) indicating how many of its up to 8 neighbours are mines, or is **blank** (zero neighbours are mines)
- The first cell clicked is **always safe** — mines are placed after the first click to guarantee this

### Cell States

| State | Display |
|---|---|
| Hidden | Flat covered tile |
| Revealed (number) | Digit 1–8, colour-coded |
| Revealed (blank) | Empty, slightly inset |
| Flagged | 🚩 icon; cannot be accidentally revealed |
| Mine (game over) | 💣 icon, revealed on loss |
| Incorrectly flagged | ✗ icon, revealed on loss |

### Interactions

- **Left-click / tap** — reveal a cell
- **Right-click / long-press** — cycle flag on a hidden cell (flagged → unflagged)
- **Chord click** (click on a revealed number with exactly the right number of neighbouring flags) — auto-reveal all non-flagged neighbours
- **Blank flood-fill** — revealing a blank cell automatically reveals all connected blank and numbered cells recursively

### Win / Loss

- **Win** — all non-mine cells are revealed; remaining unflagged mines are auto-flagged
- **Loss** — a mine cell is revealed; all mines are uncovered; incorrectly flagged cells are marked
- Both states show a result banner with elapsed time and a "Play Again" button

## Difficulty Presets

| Level | Grid | Mines |
|---|---|---|
| Beginner | 9 × 9 | 10 |
| Intermediate | 16 × 16 | 40 |
| Expert | 30 × 16 | 99 |
| Custom | User-defined | User-defined |

Custom: width 5–50, height 5–30, mines 1 – (width × height − 9).

## Timer

- Starts on first click, stops on win or loss
- Displayed as seconds (e.g. `042`)
- Best time per difficulty stored in `localStorage` and shown below the board

## Mine Counter

- Displays remaining mines = total mines − flagged cells (can go negative)
- Classic seven-segment display style is optional; a plain number is fine

## Layout

- Difficulty selector above the board
- Mine counter | Reset / smiley button | Timer in a single header row
- Board centred; cells at least 32 px on desktop, 40 px on mobile
- On small screens the board scrolls horizontally rather than shrinking below tap size

## Reset

- Clicking the Reset button (or smiley icon) starts a new game at the current difficulty without changing the preset

## Custom Mode

- Inputs for width, height, and mine count with validation
- Clamped to safe ranges — mines cannot exceed (width × height − 9)

## Accessibility

- Cells have `role="button"` and `aria-label` describing their state (e.g. "Row 3, Column 5, hidden")
- Flag action available via keyboard: select cell with arrow keys, press `F` to flag
- Colour-coded numbers also use distinct digit shapes so colour is not the sole indicator

## Privacy

Runs fully in the browser. No game data is sent anywhere.

## How to Play (in-game instructions)

The tool page must display a collapsible "How to Play" panel (collapsed by default, remembers state in `localStorage`) so new users can learn the rules without leaving the page. The panel should be visible near the top of the play area, labelled clearly (e.g. a "How to play" link or `?` button).

Suggested panel content:

> **How to play Minesweeper**
>
> The board is a grid of covered tiles. Some tiles hide mines — your job is to uncover every tile that does **not** have a mine.
>
> - **Click / tap** a tile to reveal it. If it's a number, that number tells you how many mines are in the 8 tiles surrounding it. If it's blank, all safe neighbours are revealed automatically.
> - **Right-click / long-press** a tile to place a 🚩 flag — useful for marking tiles you're sure contain a mine. Flagged tiles cannot be accidentally clicked open.
> - **Double-click / chord-click** a revealed number tile to instantly reveal all its unflagged neighbours — only safe to do when you've flagged exactly the right number of surrounding mines.
> - Your first click is always safe — mines are placed after you click.
>
> You win when every non-mine tile is revealed. You lose the moment you reveal a mine.

The panel content is plain text / simple HTML inside the Vue component — no separate component needed.

## Implementation Notes

- Mine placement logic in `utils/minesweeper.ts` — pure functions, directly testable
- Key exports: `placeMines(width, height, mineCount, safeCell)`, `computeNumbers(board)`, `floodReveal(board, cell)`, `checkWin(board)`
- Page: `pages/tools/minesweeper.vue`
- No external game library required; pure Vue 3 + CSS grid
