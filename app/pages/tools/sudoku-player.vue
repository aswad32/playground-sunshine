<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  emptyBoard,
  cloneBoard,
  stringToBoard,
  hasConflict,
  isBoardComplete,
  type Board,
  type Difficulty,
} from '~/utils/sudokuHelpers'
import { generatePuzzle } from '~/utils/sudokuGenerator'

useSeoMeta({
  title: 'Sudoku Player - Playground Sunshine',
  description: 'Play Sudoku in your browser — choose a difficulty, get a new puzzle, and solve it with conflict highlighting, pencil marks, and a timer. Free and private.',
})

// ── Types ──────────────────────────────────────────────────────────────────
interface HistoryEntry {
  board: Board
  notes: string[][][]
}

// ── Constants ──────────────────────────────────────────────────────────────
const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
const BOX_BORDERS_ROW = [2, 5]
const BOX_BORDERS_COL = [2, 5]
const STORAGE_KEY = 'ps-sudoku-player'

// ── Game state ─────────────────────────────────────────────────────────────
const given = ref<Board>(emptyBoard())     // immutable givens (0 = not a given)
const board = ref<Board>(emptyBoard())     // mutable player board
const notes = ref<string[][][]>(           // pencil-mark notes per cell (3×3 grid of '', '1'–'9')
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array(9).fill('')),
  ),
)
const selected = ref<[number, number] | null>(null)
const pencilMode = ref(false)
const difficulty = ref<Difficulty>('medium')
const won = ref(false)
const history = ref<HistoryEntry[]>([])

// ── Timer ──────────────────────────────────────────────────────────────────
const elapsed = ref(0)   // seconds
let timerInterval: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timerInterval = setInterval(() => {
    if (!won.value) elapsed.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const timerDisplay = computed(() => {
  const m = Math.floor(elapsed.value / 60).toString().padStart(2, '0')
  const s = (elapsed.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

onUnmounted(stopTimer)

// ── Derived ────────────────────────────────────────────────────────────────
const conflicts = computed(() => {
  const set = new Set<string>()
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board.value[r][c]
      if (v !== 0 && hasConflict(board.value, r, c, v)) {
        set.add(`${r},${c}`)
      }
    }
  }
  return set
})

const isGiven = (r: number, c: number) => given.value[r][c] !== 0

// ── Generate new puzzle ────────────────────────────────────────────────────
function newPuzzle(d: Difficulty = difficulty.value) {
  difficulty.value = d
  const gen = generatePuzzle(d)
  given.value = gen.puzzle
  board.value = cloneBoard(gen.puzzle)
  notes.value = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array(9).fill('')),
  )
  history.value = []
  won.value = false
  elapsed.value = 0
  selected.value = null
  startTimer()
  save()
}

// ── Load from query param ──────────────────────────────────────────────────
const route = useRoute()
function loadFromQuery() {
  const q = route.query.puzzle
  if (typeof q === 'string' && q.length === 81) {
    const parsed = stringToBoard(q)
    if (parsed) {
      given.value = parsed
      board.value = cloneBoard(parsed)
      notes.value = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => Array(9).fill('')),
      )
      history.value = []
      won.value = false
      elapsed.value = 0
      startTimer()
      return true
    }
  }
  return false
}

// ── Persistence ────────────────────────────────────────────────────────────
function save() {
  try {
    const state = {
      given: given.value,
      board: board.value,
      notes: notes.value,
      difficulty: difficulty.value,
      elapsed: elapsed.value,
      won: won.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function loadSaved(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const state = JSON.parse(raw)
    given.value = state.given
    board.value = state.board
    notes.value = state.notes
    difficulty.value = state.difficulty ?? 'medium'
    elapsed.value = state.elapsed ?? 0
    won.value = state.won ?? false
    return true
  } catch {
    return false
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  const fromQuery = loadFromQuery()
  if (!fromQuery) {
    const restored = loadSaved()
    if (!restored) newPuzzle()
  } else {
    startTimer()
  }
})

watch([board, notes, elapsed, won], save, { deep: true })

// ── Undo ───────────────────────────────────────────────────────────────────
function pushHistory() {
  history.value.push({
    board: cloneBoard(board.value),
    notes: JSON.parse(JSON.stringify(notes.value)),
  })
  // Keep last 50 states
  if (history.value.length > 50) history.value.shift()
}

function undo() {
  const prev = history.value.pop()
  if (!prev) return
  board.value = prev.board
  notes.value = prev.notes
  won.value = false
}

// ── Input handling ─────────────────────────────────────────────────────────
function selectCell(r: number, c: number) {
  selected.value = [r, c]
}

function placeDigit(r: number, c: number, digit: number) {
  if (isGiven(r, c) || won.value) return
  pushHistory()
  if (pencilMode.value) {
    const noteRow = notes.value[r][c]
    const idx = digit - 1
    noteRow[idx] = noteRow[idx] ? '' : String(digit)
  } else {
    board.value[r][c] = board.value[r][c] === digit ? 0 : digit
    // Clear notes for that cell when placing a digit
    notes.value[r][c] = Array(9).fill('')
  }
  checkWin()
}

function eraseCell(r: number, c: number) {
  if (isGiven(r, c) || won.value) return
  pushHistory()
  board.value[r][c] = 0
  notes.value[r][c] = Array(9).fill('')
}

function checkWin() {
  if (isBoardComplete(board.value)) {
    won.value = true
    stopTimer()
  }
}

function onGridKey(e: KeyboardEvent) {
  if (!selected.value) return
  const [r, c] = selected.value

  if (e.key >= '1' && e.key <= '9') {
    placeDigit(r, c, Number(e.key))
    e.preventDefault()
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    eraseCell(r, c)
    e.preventDefault()
  } else if (e.key === 'ArrowRight') { selectCell(r, Math.min(c + 1, 8)); e.preventDefault() }
  else if (e.key === 'ArrowLeft')  { selectCell(r, Math.max(c - 1, 0)); e.preventDefault() }
  else if (e.key === 'ArrowDown')  { selectCell(Math.min(r + 1, 8), c); e.preventDefault() }
  else if (e.key === 'ArrowUp')    { selectCell(Math.max(r - 1, 0), c); e.preventDefault() }
  else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) { undo(); e.preventDefault() }
}

// ── Cell styling ───────────────────────────────────────────────────────────
function cellClass(r: number, c: number): string[] {
  const classes: string[] = []
  if (BOX_BORDERS_ROW.includes(r)) classes.push('border-b-2 border-b-gray-600')
  if (BOX_BORDERS_COL.includes(c)) classes.push('border-r-2 border-r-gray-600')

  const isSelected = selected.value?.[0] === r && selected.value?.[1] === c
  const [sr, sc] = selected.value ?? [-1, -1]
  const isSameRowOrCol = selected.value && (r === sr || c === sc)
  const isSameBox = selected.value && (
    Math.floor(r / 3) === Math.floor(sr / 3) &&
    Math.floor(c / 3) === Math.floor(sc / 3)
  )
  const isSameValue = selected.value && board.value[sr]?.[sc] !== 0 && board.value[r][c] === board.value[sr][sc]

  if (isSelected) classes.push('bg-blue-200')
  else if (isSameValue) classes.push('bg-blue-100')
  else if (isSameBox || isSameRowOrCol) classes.push('bg-gray-100')

  if (conflicts.value.has(`${r},${c}`)) classes.push('!bg-red-100')

  return classes
}

function digitClass(r: number, c: number): string[] {
  const classes: string[] = []
  if (isGiven(r, c)) classes.push('text-gray-900 font-bold')
  else if (conflicts.value.has(`${r},${c}`)) classes.push('text-red-600 font-medium')
  else classes.push('text-blue-600 font-medium')
  return classes
}

// ── Digit pad ──────────────────────────────────────────────────────────────
function padPress(digit: number) {
  if (!selected.value) return
  const [r, c] = selected.value
  if (digit === 0) eraseCell(r, c)
  else placeDigit(r, c, digit)
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  hard: 'text-orange-600 bg-orange-50 border-orange-200',
  expert: 'text-red-600 bg-red-50 border-red-200',
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10" @keydown="onGridKey" tabindex="-1">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Sudoku</h1>
      <p class="text-gray-500 text-sm">Click a cell, then press 1–9 to fill it. Arrow keys navigate. Ctrl/Cmd+Z to undo.</p>
    </header>

    <!-- Top bar: difficulty + timer -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex gap-1.5">
        <button
          v-for="d in difficulties"
          :key="d"
          :class="[
            'px-3 py-1 rounded-full border text-xs font-medium capitalize transition-colors',
            difficulty === d ? difficultyColors[d] : 'border-gray-200 text-gray-400 hover:bg-gray-50',
          ]"
          @click="newPuzzle(d)"
        >
          {{ d }}
        </button>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <span class="font-mono text-sm text-gray-600 tabular-nums">{{ timerDisplay }}</span>
        <button
          class="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          @click="newPuzzle()"
        >
          New puzzle
        </button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <!-- Board -->
      <div class="shrink-0">
        <div
          class="inline-grid grid-cols-9 border-2 border-gray-700 rounded-lg overflow-hidden select-none"
          role="grid"
          aria-label="Sudoku board"
        >
          <template v-for="r in 9" :key="r">
            <template v-for="c in 9" :key="c">
              <div
                role="gridcell"
                :aria-label="`Row ${r}, column ${c}`"
                :class="[
                  'w-10 h-10 border border-gray-200 cursor-pointer relative overflow-hidden',
                  'focus:outline-none',
                  ...cellClass(r - 1, c - 1),
                ]"
                tabindex="0"
                @click="selectCell(r - 1, c - 1)"
                @focus="selectCell(r - 1, c - 1)"
              >
                <!-- Main digit -->
                <template v-if="board[r - 1][c - 1] !== 0">
                  <span
                    :class="[
                      'absolute inset-0 flex items-center justify-center text-base font-mono',
                      ...digitClass(r - 1, c - 1),
                    ]"
                  >
                    {{ board[r - 1][c - 1] }}
                  </span>
                </template>

                <!-- Pencil marks (3×3 mini grid) -->
                <template v-else>
                  <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5">
                    <span
                      v-for="n in 9"
                      :key="n"
                      class="flex items-center justify-center text-gray-400"
                      style="font-size: 7px; line-height: 1;"
                    >
                      {{ notes[r - 1][c - 1][n - 1] }}
                    </span>
                  </div>
                </template>
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Side panel -->
      <div class="space-y-4">
        <!-- Pencil mode toggle -->
        <div class="flex items-center gap-2">
          <button
            :class="[
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              pencilMode
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50',
            ]"
            @click="pencilMode = !pencilMode"
          >
            ✏️ Pencil marks {{ pencilMode ? 'ON' : 'OFF' }}
          </button>
          <button
            :disabled="history.length === 0"
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
            @click="undo"
          >
            Undo
          </button>
        </div>

        <!-- Digit pad -->
        <div class="grid grid-cols-3 gap-1.5 w-36">
          <button
            v-for="d in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="d"
            class="h-10 rounded-lg border border-gray-200 text-base font-mono font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            @click="padPress(d)"
          >
            {{ d }}
          </button>
          <button
            class="col-span-3 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors"
            @click="padPress(0)"
          >
            Erase
          </button>
        </div>
      </div>
    </div>

    <!-- Win banner -->
    <div
      v-if="won"
      role="status"
      aria-live="polite"
      class="mt-6 rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-800"
    >
      <p class="font-semibold text-lg">Puzzle solved! 🎉</p>
      <p class="text-sm mt-1">Completed in {{ timerDisplay }}.</p>
      <button
        class="mt-3 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        @click="newPuzzle()"
      >
        Play another
      </button>
    </div>
  </main>
</template>
