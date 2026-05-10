# Wordle Clone Spec

## Goal

A free, unlimited Wordle-style word guessing game. Players have six attempts to guess a hidden 5-letter word and receive colour-coded feedback after each guess. Playable in random mode or with a shareable daily seed.

## Route

`/tools/wordle`

## Core Gameplay

### Rules

- Hidden word is exactly 5 letters (English, uppercase internally, displayed uppercase)
- Player has **6 guesses**
- Each guess must be a valid 5-letter word from the built-in word list
- After submitting a guess, each letter receives one of three states:

| State | Colour | Meaning |
|---|---|---|
| Correct | Green | Right letter, right position |
| Present | Yellow/Amber | Letter is in the word but wrong position |
| Absent | Grey | Letter is not in the word |

### Duplicate Letter Handling

Follow the standard Wordle rule: letters are marked green/yellow at most as many times as they appear in the hidden word, prioritising green (exact) matches first.

### Input

- On-screen keyboard (QWERTY layout) that reflects letter states from previous guesses
- Physical keyboard fully supported — type letters, `Enter` to submit, `Backspace` to delete
- Letters appear in the current row's tiles as typed; submit locks the row and triggers feedback animation

### Validation

- Reject guesses not in the word list with an inline message: "Not a valid word"
- Do not allow submitting a row with fewer than 5 letters

### Win / Loss

- **Win** — the guess matches the hidden word; all tiles flip to green; a congratulations message appears showing the number of guesses used
- **Loss** — all 6 guesses are used without success; the hidden word is revealed
- Both states offer a "Play Again" button (random mode) or show next-word countdown (daily mode)

## Game Modes

### Random Mode (default)

- A random word is chosen from the answer list on each new game
- "New Game" button available at any time — starts a fresh game immediately

### Daily Mode

- One word per calendar day, derived from a deterministic seed based on the date
- Shared across all players on the same day (no server needed — seed computed client-side from `Date`)
- Countdown timer to next word shown after win/loss
- Daily result is saved in `localStorage` — returning the same day resumes the completed state

## Word Lists

- **Answer list** (~2 300 common, well-known words) — the pool from which hidden words are drawn
- **Valid guess list** (~10 000+ words) — extended list for validation; answers list is a subset
- Both lists shipped as static TypeScript arrays in `utils/wordleWords.ts`
- No external dictionary API call

## Keyboard

- On-screen QWERTY keyboard with three rows
- Each key reflects the best known state of that letter (correct > present > absent > unknown), colour-coded to match the board
- Tap on mobile, click or physical key on desktop

## Share / Copy Result

- After a game ends, a "Share Result" button copies a spoiler-free emoji grid to the clipboard:
  ```
  Wordle (Playground Sunshine) — Random
  4/6

  ⬜🟨⬜⬜⬜
  ⬜⬜🟨⬜🟨
  🟨🟩🟨⬜⬜
  🟩🟩🟩🟩🟩
  ```
- Uses `⬛` for absent, `🟨` for present, `🟩` for correct

## Statistics

- Stored in `localStorage`:
  - Games played
  - Win percentage
  - Current streak
  - Max streak
  - Guess distribution (how many games won in 1–6 guesses)
- Shown in a stats panel accessible via a button in the header

## Layout

- Header row: title | Daily / Random toggle | Stats button
- Board: 6 rows × 5 tiles, centred, tiles large enough to read comfortably (min 52 px)
- On-screen keyboard below the board
- Toast messages (invalid word, win/loss) appear above the board

## Animations

- Tile flip animation on guess submission (CSS transform, no JS animation library)
- Tile shake animation on invalid guess
- Win bounce animation on correct guess
- All animations respect `prefers-reduced-motion`

## Accessibility

- Board tiles have `aria-label` describing their state (e.g. "Position 1: S — correct")
- On-screen keyboard keys have accessible labels
- Colour states also conveyed via tile border or pattern for colour-blind users (optional high-contrast mode toggle)

## Privacy

Runs fully in the browser. The word list is bundled. No input is sent anywhere.

## How to Play (in-game instructions)

The tool page must display a collapsible "How to Play" panel (collapsed by default, remembers state in `localStorage`) so new users can learn the rules without leaving the page. The panel should be visible near the top of the board, labelled clearly (e.g. a "How to play" link or `?` button).

Suggested panel content:

> **How to play Wordle**
>
> Guess the hidden 5-letter word in 6 tries.
>
> - Type any valid 5-letter word and press **Enter** to submit your guess.
> - After each guess, the colour of the tiles tells you how close you were:
>   - 🟩 **Green** — the letter is in the word and in the **correct** position.
>   - 🟨 **Yellow** — the letter is in the word but in a **different** position.
>   - ⬛ **Grey** — the letter is **not** in the word at all.
> - Use the colours as clues to narrow down the answer with each guess.
>
> In **Daily** mode the answer is the same for everyone and resets at midnight. In **Random** mode a new word is chosen each game.

The panel content is plain text / simple HTML inside the Vue component — no separate component needed.

## Implementation Notes

- Pure game logic in `utils/wordle.ts`:
  - `pickRandomWord(seed?: number): string`
  - `getDailyWord(): string` — derives seed from `new Date()` UTC date
  - `evaluateGuess(guess: string, answer: string): LetterResult[]`
  - `isValidGuess(word: string): boolean`
- Word lists in `utils/wordleWords.ts` (exported as `ANSWERS` and `VALID_GUESSES`)
- Page: `pages/tools/wordle.vue`
- Stats composable: `composables/useWordleStats.ts`
