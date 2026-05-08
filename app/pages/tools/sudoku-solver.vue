<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { emptyBoard, stringToBoard, boardToString, isBoardValid, cloneBoard, hasConflict, type Board } from '~/utils/sudokuHelpers'
import { solve } from '~/utils/sudokuSolver'

useSeoMeta({
  title: 'Sudoku Solver - Playground Sunshine',
  description: 'Solve any Sudoku puzzle instantly in your browser — paste an 81-character string or enter the puzzle manually. Free, private, no install.',
})

const BOX_BORDERS_ROW = [2, 5]
const BOX_BORDERS_COL = [2, 5]

// ── State ──────────────────────────────────────────────────────────────────
const given = ref<Board>(emptyBoard())   // cells the user typed (immutable during solve)
const solved = ref<Board | null>(null)
const errorMsg = ref<string | null>(null)
const multiSolution = ref(false)
const puzzleString = ref('')
const { copy, copied } = useClipboard()

// ── Route query pre-fill ───────────────────────────────────────────────────
const route = useRoute()
onMounted(() => {
  const q = route.query.puzzle
  if (typeof q === 'string' && q.length === 81) {
    const board = stringToBoard(q)
    if (board) {
      given.value = board
      puzzleString.value = q
    }
  }
})

// ── Cell conflict highlight (on given board) ───────────────────────────────
const givenConflicts = computed(() => {
  const set = new Set<string>()
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (given.value[r][c] !== 0 && hasConflict(given.value, r, c, given.value[r][c])) {
        set.add(`${r},${c}`)
      }
    }
  }
  return set
})

const hasGivenConflicts = computed(() => givenConflicts.value.size > 0)

// ── Input handlers ─────────────────────────────────────────────────────────
function onCellKey(r: number, c: number, e: KeyboardEvent) {
  if (e.key >= '1' && e.key <= '9') {
    given.value[r][c] = Number(e.key)
    solved.value = null
    errorMsg.value = null
  } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    given.value[r][c] = 0
    solved.value = null
    errorMsg.value = null
  } else if (e.key === 'ArrowRight') focusCell(r, c + 1)
  else if (e.key === 'ArrowLeft')  focusCell(r, c - 1)
  else if (e.key === 'ArrowDown')  focusCell(r + 1, c)
  else if (e.key === 'ArrowUp')    focusCell(r - 1, c)
  e.preventDefault()
}

function focusCell(r: number, c: number) {
  if (r < 0 || r > 8 || c < 0 || c > 8) return
  const el = document.querySelector<HTMLElement>(`[data-cell="${r}-${c}"]`)
  el?.focus()
}

function onStringInput() {
  errorMsg.value = null
  solved.value = null
  const board = stringToBoard(puzzleString.value)
  if (board) given.value = board
}

// ── Solve ──────────────────────────────────────────────────────────────────
function runSolve() {
  if (hasGivenConflicts.value) {
    errorMsg.value = 'Fix the highlighted conflicts before solving.'
    return
  }
  const result = solve(given.value)
  multiSolution.value = result.multiSolution
  if (!result.solved) {
    solved.value = null
    errorMsg.value =
      result.reason === 'timeout'
        ? 'Solving timed out. Try a puzzle with more givens.'
        : 'This puzzle has no solution. Check for conflicting numbers.'
    return
  }
  solved.value = result.solution
  errorMsg.value = null
}

// ── Clear ──────────────────────────────────────────────────────────────────
function clear() {
  given.value = emptyBoard()
  solved.value = null
  errorMsg.value = null
  multiSolution.value = false
  puzzleString.value = ''
}

// ── Display helpers ────────────────────────────────────────────────────────
function displayVal(r: number, c: number): string {
  if (solved.value) return String(solved.value[r][c])
  const v = given.value[r][c]
  return v === 0 ? '' : String(v)
}

function cellClass(r: number, c: number): string[] {
  const classes: string[] = ['sudoku-cell']
  if (BOX_BORDERS_ROW.includes(r)) classes.push('border-b-2 border-b-gray-600')
  if (BOX_BORDERS_COL.includes(c)) classes.push('border-r-2 border-r-gray-600')
  if (givenConflicts.value.has(`${r},${c}`)) classes.push('bg-red-100 text-red-700')
  else if (solved.value && given.value[r][c] === 0) classes.push('text-blue-600')
  else classes.push('text-gray-900')
  if (given.value[r][c] !== 0 && (!solved.value || given.value[r][c] !== 0)) classes.push('font-bold')
  return classes
}

const solutionString = computed(() =>
  solved.value ? boardToString(solved.value) : ''
)
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Sudoku Solver</h1>
      <p class="text-gray-500 text-sm">
        Enter a puzzle manually or paste an 81-character string. Conflicts are highlighted before you solve.
      </p>
    </header>

    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <!-- Board -->
      <div class="shrink-0">
        <div class="inline-grid grid-cols-9 border-2 border-gray-700 rounded-lg overflow-hidden select-none">
          <template v-for="r in 9" :key="r">
            <template v-for="c in 9" :key="c">
              <div
                :data-cell="`${r - 1}-${c - 1}`"
                :class="[
                  'w-10 h-10 flex items-center justify-center text-base font-mono cursor-pointer',
                  'border border-gray-300 focus:outline-none focus:bg-blue-50',
                  ...cellClass(r - 1, c - 1),
                ]"
                tabindex="0"
                @keydown="onCellKey(r - 1, c - 1, $event)"
              >
                {{ displayVal(r - 1, c - 1) }}
              </div>
            </template>
          </template>
        </div>

        <!-- Error / multi-solution notice -->
        <p
          v-if="errorMsg"
          role="alert"
          class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {{ errorMsg }}
        </p>
        <p
          v-if="multiSolution && !errorMsg"
          class="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
        >
          This puzzle has multiple solutions — a valid puzzle should have exactly one. The first solution found is shown.
        </p>
        <p
          v-if="solved && !multiSolution"
          class="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
        >
          Solved! Blue cells are the computed answers.
        </p>
      </div>

      <!-- Controls -->
      <div class="flex-1 space-y-5 w-full">
        <!-- String input -->
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Puzzle string (81 chars)</label>
          <textarea
            v-model="puzzleString"
            rows="3"
            placeholder="530070000600195000098000060800060003400803001700020006060000280000419005000080079"
            spellcheck="false"
            class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none resize-none"
            @input="onStringInput"
          />
          <p class="text-xs text-gray-400">Digits 1–9 for givens, 0 or . for blanks. Spaces and pipes are ignored.</p>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <button
            :disabled="hasGivenConflicts"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="runSolve"
          >
            Solve
          </button>
          <button
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            @click="clear"
          >
            Clear
          </button>
        </div>

        <!-- Solution string output -->
        <div v-if="solved" class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Solution string</label>
          <div class="flex gap-2">
            <input
              :value="solutionString"
              readonly
              class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800 focus:outline-none"
            />
            <button
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              @click="copy(solutionString)"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-400 pt-2">
          Click a cell and press a digit key (1–9) to fill it. Use arrow keys to navigate.
        </p>
      </div>
    </div>
  </main>
</template>
