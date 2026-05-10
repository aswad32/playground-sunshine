<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronDown, ChevronUp, RotateCcw, Shuffle, ArrowLeft } from 'lucide-vue-next'
import {
  checkLine,
  checkWin,
  generatePuzzle,
  createPlayerGrid,
  type NonogramPuzzle,
  type PlayerGrid,
  type CellValue,
} from '~/utils/nonogram'
import PUZZLES from '~/utils/nonogramPuzzles'

useSeoMeta({
  title: 'Nonogram (Picross) - Playground Sunshine',
  description: 'Solve Nonogram / Picross puzzles in your browser. Fill in the grid using the row and column clues — free and fully private.',
})

// ── Views ──────────────────────────────────────────────────────────────────

type View = 'picker' | 'play'
const view = ref<View>('picker')
const activePuzzle = ref<NonogramPuzzle | null>(null)
const isGenerated = ref(false)

// ── Picker ─────────────────────────────────────────────────────────────────

type SizeFilter = 'all' | '5' | '10' | '15'
const sizeFilter = ref<SizeFilter>('all')

const filteredPuzzles = computed(() => {
  if (sizeFilter.value === 'all') return PUZZLES
  const w = parseInt(sizeFilter.value, 10)
  return PUZZLES.filter((p) => p.width === w)
})

function difficultyLabel(p: NonogramPuzzle): string {
  if (p.width <= 5) return 'Easy'
  if (p.width <= 10) return 'Medium'
  return 'Hard'
}

// ── Random puzzle generator ────────────────────────────────────────────────

type GenSize = '5' | '10' | '15'
const genSize = ref<GenSize>('10')

function startRandom() {
  const s = parseInt(genSize.value, 10)
  activePuzzle.value = generatePuzzle(s, s)
  isGenerated.value = true
  startPlay()
}

// ── Play state ─────────────────────────────────────────────────────────────

const playerGrid = ref<PlayerGrid>([])
const gameWon = ref(false)
const firstInteraction = ref(false)

// ── Timer ──────────────────────────────────────────────────────────────────

const elapsed = ref(0)
let timerHandle: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)
}
function stopTimer() {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
}
onUnmounted(stopTimer)

const timerDisplay = computed(() => {
  const m = Math.floor(elapsed.value / 60).toString().padStart(2, '0')
  const s = (elapsed.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// ── Best time ──────────────────────────────────────────────────────────────

function bestKey(id: string) { return `ps-nonogram-best-${id}` }
function getBest(id: string): number | null {
  const v = localStorage.getItem(bestKey(id))
  return v ? parseInt(v, 10) : null
}
function saveBest(id: string, t: number) {
  const e = getBest(id)
  if (e === null || t < e) localStorage.setItem(bestKey(id), String(t))
}
const bestTime = computed(() => activePuzzle.value ? getBest(activePuzzle.value.id) : null)

// ── Progress persistence ───────────────────────────────────────────────────

function progressKey(id: string) { return `ps-nonogram-progress-${id}` }

function saveProgress() {
  if (!activePuzzle.value || isGenerated.value) return
  localStorage.setItem(progressKey(activePuzzle.value.id), JSON.stringify(playerGrid.value))
}

function loadProgress(id: string): PlayerGrid | null {
  try {
    const raw = localStorage.getItem(progressKey(id))
    return raw ? (JSON.parse(raw) as PlayerGrid) : null
  } catch { return null }
}

// ── Line status ────────────────────────────────────────────────────────────

const rowStatuses = computed(() => {
  const p = activePuzzle.value
  if (!p) return []
  return p.rowClues.map((clues, r) => checkLine(playerGrid.value[r] ?? [], clues))
})

const colStatuses = computed(() => {
  const p = activePuzzle.value
  if (!p) return []
  return p.colClues.map((clues, c) => {
    const col = playerGrid.value.map((row) => row[c] ?? null)
    return checkLine(col, clues)
  })
})

// ── Start play ─────────────────────────────────────────────────────────────

const resumePrompt = ref(false)
const pendingProgress = ref<PlayerGrid | null>(null)

function startPlay(withProgress?: PlayerGrid) {
  const p = activePuzzle.value!
  stopTimer()
  elapsed.value = 0
  gameWon.value = false
  firstInteraction.value = false
  playerGrid.value = withProgress ?? createPlayerGrid(p.width, p.height)
  view.value = 'play'
}

function openPuzzle(puzzle: NonogramPuzzle) {
  activePuzzle.value = puzzle
  isGenerated.value = false

  const saved = loadProgress(puzzle.id)
  if (saved && !isGridEmpty(saved)) {
    pendingProgress.value = saved
    resumePrompt.value = true
    view.value = 'play'
    return
  }

  startPlay()
}

function isGridEmpty(grid: PlayerGrid): boolean {
  return grid.every((row) => row.every((c) => c === null))
}

function resumeGame() {
  resumePrompt.value = false
  startPlay(pendingProgress.value ?? undefined)
}

function newGame() {
  resumePrompt.value = false
  pendingProgress.value = null
  startPlay()
}

// ── Drag state ─────────────────────────────────────────────────────────────

type DragMode = 'fill' | 'cross' | null
const dragMode = ref<DragMode>(null)
const dragButton = ref<0 | 2>(0)

function ensureTimerStarted() {
  if (!firstInteraction.value) {
    firstInteraction.value = true
    startTimer()
  }
}

// ── Cell interaction ───────────────────────────────────────────────────────

function applyCell(r: number, c: number, button: 0 | 2) {
  if (gameWon.value) return
  const current = playerGrid.value[r]?.[c] ?? null

  let next: CellValue
  if (button === 0) {
    // left click: unknown → filled → unknown
    next = current === true ? null : true
  } else {
    // right click: unknown → crossed → unknown
    next = current === false ? null : false
  }

  const newGrid = playerGrid.value.map((row, ri) =>
    ri === r ? row.map((cell, ci) => (ci === c ? next : cell)) : row,
  )
  playerGrid.value = newGrid
  saveProgress()
  checkForWin()
}

function handleMouseDown(e: MouseEvent, r: number, c: number) {
  e.preventDefault()
  ensureTimerStarted()
  const btn = e.button === 2 ? 2 : 0
  dragButton.value = btn
  // Determine drag mode based on what this cell will become
  const current = playerGrid.value[r]?.[c] ?? null
  dragMode.value = btn === 0
    ? (current === true ? null : 'fill')
    : (current === false ? null : 'cross')
  applyCell(r, c, btn)
}

function handleMouseEnter(r: number, c: number) {
  if (dragMode.value === null) return
  if (gameWon.value) return
  const btn = dragButton.value
  const current = playerGrid.value[r]?.[c] ?? null
  // Only fill/cross in the drag direction — don't toggle back
  let next: CellValue = current
  if (dragMode.value === 'fill' && current !== true) next = true
  if (dragMode.value === 'cross' && current !== false) next = false
  if (next === current) return

  const newGrid = playerGrid.value.map((row, ri) =>
    ri === r ? row.map((cell, ci) => (ci === c ? next : cell)) : row,
  )
  playerGrid.value = newGrid
  saveProgress()
  checkForWin()
}

function handleMouseUp() {
  dragMode.value = null
}

// ── Touch / long-press ─────────────────────────────────────────────────────

let longPressTimer: ReturnType<typeof setTimeout> | null = null
let touchMoved = false

function handleTouchStart(r: number, c: number) {
  touchMoved = false
  ensureTimerStarted()
  longPressTimer = setTimeout(() => {
    if (!touchMoved) {
      applyCell(r, c, 2)
    }
  }, 500)
}

function handleTouchMove() {
  touchMoved = true
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

function handleTouchEnd(r: number, c: number) {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
    if (!touchMoved) applyCell(r, c, 0)
  }
}

// ── Keyboard navigation ────────────────────────────────────────────────────

const focusedCell = ref<[number, number]>([0, 0])

function handleKeydown(e: KeyboardEvent, r: number, c: number) {
  const p = activePuzzle.value!
  if (e.key === ' ') { e.preventDefault(); ensureTimerStarted(); applyCell(r, c, 0) }
  if (e.key === 'x' || e.key === 'X') { e.preventDefault(); ensureTimerStarted(); applyCell(r, c, 2) }
  if (e.key === 'ArrowRight') { e.preventDefault(); moveFocus(r, Math.min(c + 1, p.width - 1)) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(r, Math.max(c - 1, 0)) }
  if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(Math.min(r + 1, p.height - 1), c) }
  if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(Math.max(r - 1, 0), c) }
}

function moveFocus(r: number, c: number) {
  focusedCell.value = [r, c]
  const el = document.getElementById(`cell-${r}-${c}`)
  el?.focus()
}

// ── Win detection ──────────────────────────────────────────────────────────

function checkForWin() {
  if (!activePuzzle.value) return
  if (checkWin(playerGrid.value, activePuzzle.value.solution)) {
    gameWon.value = true
    stopTimer()
    saveBest(activePuzzle.value.id, elapsed.value)
    // Clear saved progress
    if (!isGenerated.value) {
      localStorage.removeItem(progressKey(activePuzzle.value.id))
    }
  }
}

// ── Auto-save on change ────────────────────────────────────────────────────

watch(playerGrid, saveProgress, { deep: true })

// ── Cell display ───────────────────────────────────────────────────────────

function cellClass(r: number, c: number): string {
  const val = playerGrid.value[r]?.[c] ?? null
  const base = 'w-8 h-8 md:w-9 md:h-9 border border-gray-300 flex items-center justify-center text-xs select-none cursor-pointer transition-colors'
  if (val === true) return `${base} bg-indigo-500`
  if (val === false) return `${base} bg-gray-100 text-gray-400`
  return `${base} bg-white hover:bg-indigo-50`
}

function cellAriaLabel(r: number, c: number): string {
  const val = playerGrid.value[r]?.[c] ?? null
  const state = val === true ? 'filled' : val === false ? 'crossed out' : 'empty'
  return `Row ${r + 1}, Column ${c + 1}, ${state}`
}

// ── Clue display ───────────────────────────────────────────────────────────

function rowClueClass(r: number): string {
  const s = rowStatuses.value[r]
  if (s === 'correct') return 'text-green-600 font-bold'
  if (s === 'invalid') return 'text-red-500 font-bold'
  return 'text-gray-700'
}

function colClueClass(c: number): string {
  const s = colStatuses.value[c]
  if (s === 'correct') return 'text-green-600 font-bold'
  if (s === 'invalid') return 'text-red-500 font-bold'
  return 'text-gray-700'
}

// ── Thumbnail pixel grid for gallery ──────────────────────────────────────

function thumbnailStyle(puzzle: NonogramPuzzle, r: number, c: number): string {
  const filled = puzzle.solution[r]?.[c] ?? false
  return filled ? 'background:#4f46e5' : 'background:#e5e7eb'
}

// ── How to Play ────────────────────────────────────────────────────────────

const showHelp = ref(false)
const HELP_KEY = 'ps-nonogram-help-open'

onMounted(() => {
  const stored = localStorage.getItem(HELP_KEY)
  showHelp.value = stored === 'true'
})
watch(showHelp, (v) => localStorage.setItem(HELP_KEY, String(v)))

// ── Global mouseup to stop drag ─────────────────────────────────────────────

onMounted(() => { window.addEventListener('mouseup', handleMouseUp) })
onUnmounted(() => { window.removeEventListener('mouseup', handleMouseUp) })
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-10" @contextmenu.prevent>

    <!-- ── PUZZLE PICKER ── -->
    <template v-if="view === 'picker'">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Nonogram</h1>
        <p class="text-gray-500 mt-1">Fill in the grid using the row and column clues.</p>
      </div>

      <!-- How to Play -->
      <div class="mb-6 border border-gray-200 rounded-xl overflow-hidden">
        <button
          class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
          @click="showHelp = !showHelp"
        >
          <span>How to play</span>
          <ChevronUp v-if="showHelp" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
        <div v-if="showHelp" class="px-4 py-4 text-sm text-gray-700 space-y-2 bg-white">
          <p>Each number on the left of a row (or above a column) tells you how many cells in a row are filled in that line. Multiple numbers mean multiple groups, separated by at least one empty cell — <strong>in the order shown</strong>.</p>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>Click / tap</strong> a cell to fill it.</li>
            <li><strong>Right-click / long-press</strong> to mark a cell with ✕ if you know it must be empty.</li>
            <li><strong>Click and drag</strong> to fill or mark several cells at once.</li>
            <li>Clue numbers turn <span class="text-green-600 font-semibold">green</span> when that line is solved, and <span class="text-red-500 font-semibold">red</span> if you've made an impossible mistake.</li>
          </ul>
          <p>Start with a row or column that has only one possible arrangement, then work your way inwards!</p>
        </div>
      </div>

      <!-- Random puzzle generator -->
      <div class="mb-6 flex flex-wrap items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span class="text-sm font-medium text-amber-800">Random puzzle</span>
        <div class="flex gap-2">
          <button v-for="s in (['5', '10', '15'] as const)" :key="s"
            class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
            :class="genSize === s ? 'bg-amber-400 border-amber-400 text-white' : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'"
            @click="genSize = s"
          >{{ s }}×{{ s }}</button>
        </div>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-white text-sm font-medium hover:bg-amber-500 transition-colors"
          @click="startRandom"
        >
          <Shuffle class="w-4 h-4" /> Generate
        </button>
        <p class="text-xs text-amber-700 w-full">Note: randomly generated puzzles may have multiple solutions.</p>
      </div>

      <!-- Size filter -->
      <div class="mb-4 flex gap-2">
        <button v-for="f in ([['all', 'All'], ['5', '5×5 Easy'], ['10', '10×10 Medium'], ['15', '15×15 Hard']] as const)" :key="f[0]"
          class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
          :class="sizeFilter === f[0] ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
          @click="sizeFilter = f[0]"
        >{{ f[1] }}</button>
      </div>

      <!-- Gallery -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <button
          v-for="puzzle in filteredPuzzles"
          :key="puzzle.id"
          class="group border border-gray-200 rounded-xl p-3 text-left hover:border-indigo-400 hover:shadow-md transition-all bg-white"
          @click="openPuzzle(puzzle)"
        >
          <!-- Thumbnail -->
          <div
            class="mb-2 mx-auto overflow-hidden rounded"
            :style="`display:grid; grid-template-columns: repeat(${puzzle.width}, 1fr); width: 80px; height: 80px; gap: 1px; background:#d1d5db`"
          >
            <div
              v-for="({ r, c }) in puzzle.solution.flatMap((row, r) => row.map((_, c) => ({ r, c })))"
              :key="`${r}-${c}`"
              :style="thumbnailStyle(puzzle, r, c)"
            />
          </div>
          <p class="text-xs font-semibold text-gray-800 truncate">{{ puzzle.title }}</p>
          <p class="text-xs text-gray-400">{{ puzzle.width }}×{{ puzzle.height }} · {{ difficultyLabel(puzzle) }}</p>
        </button>
      </div>
    </template>

    <!-- ── PLAY VIEW ── -->
    <template v-else-if="view === 'play' && activePuzzle">

      <!-- Header -->
      <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
        <button
          class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          @click="view = 'picker'; stopTimer()"
        >
          <ArrowLeft class="w-4 h-4" /> Back to library
        </button>
        <h2 class="text-lg font-bold text-gray-900">{{ activePuzzle.title }}</h2>
        <div class="flex items-center gap-3">
          <span class="font-mono text-sm text-gray-600">{{ timerDisplay }}</span>
          <button
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
            @click="newGame"
          >
            <RotateCcw class="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <!-- Resume prompt -->
      <div v-if="resumePrompt" class="mb-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <span class="text-blue-800">You have a saved game for this puzzle.</span>
        <button class="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600" @click="resumeGame">Resume</button>
        <button class="px-3 py-1 rounded-lg bg-white border border-blue-300 text-blue-700 text-xs font-medium hover:bg-blue-50" @click="newGame">New game</button>
      </div>

      <!-- Win banner -->
      <div v-if="gameWon" class="mb-4 rounded-xl px-4 py-3 text-center font-semibold bg-green-500 text-white" role="alert" aria-live="assertive">
        🎉 Puzzle solved in {{ timerDisplay }}!
        <template v-if="bestTime !== null"> Best: {{ Math.floor(bestTime / 60).toString().padStart(2,'0') }}:{{ (bestTime % 60).toString().padStart(2,'0') }}</template>
        <button class="ml-3 underline text-sm font-normal" @click="view = 'picker'">Back to library</button>
        <button class="ml-2 underline text-sm font-normal" @click="newGame">Play again</button>
      </div>

      <!-- How to Play (compact) -->
      <div class="mb-4 border border-gray-200 rounded-xl overflow-hidden">
        <button
          class="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
          @click="showHelp = !showHelp"
        >
          <span>How to play</span>
          <ChevronUp v-if="showHelp" class="w-3 h-3" />
          <ChevronDown v-else class="w-3 h-3" />
        </button>
        <div v-if="showHelp" class="px-4 py-3 text-xs text-gray-600 space-y-1 bg-white">
          <p><strong>Click</strong> to fill · <strong>Right-click / long-press</strong> to cross out · <strong>Drag</strong> for multiple cells · Arrow keys + Space/X on keyboard.</p>
          <p>Clues turn <span class="text-green-600 font-semibold">green</span> when the line is solved, <span class="text-red-500 font-semibold">red</span> when violated.</p>
        </div>
      </div>

      <!-- Generated notice -->
      <p v-if="isGenerated" class="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        This is a randomly generated puzzle and may have multiple solutions.
      </p>

      <!-- Board -->
      <div class="overflow-x-auto pb-4">
        <div class="inline-block">
          <!-- Column clues + grid area -->
          <div class="flex">
            <!-- Top-left spacer (max row clue column width) -->
            <div
              class="flex-shrink-0"
              :style="`width: ${Math.max(...(activePuzzle.rowClues.map((c) => c.length))) * 20}px`"
            />
            <!-- Column clues -->
            <div class="flex">
              <div
                v-for="(clue, c) in activePuzzle.colClues"
                :key="c"
                class="w-8 md:w-9 flex flex-col items-center justify-end pb-0.5"
                :class="colClueClass(c)"
                aria-hidden="true"
              >
                <span v-for="(n, i) in clue" :key="i" class="text-xs leading-4 font-medium">{{ n }}</span>
              </div>
            </div>
          </div>

          <!-- Rows: row clues + cells -->
          <div
            v-for="(rowClue, r) in activePuzzle.rowClues"
            :key="r"
            class="flex items-center"
          >
            <!-- Row clue -->
            <div
              class="flex-shrink-0 flex items-center justify-end gap-0.5 pr-1"
              :style="`width: ${Math.max(...(activePuzzle.rowClues.map((c) => c.length))) * 20}px`"
              :class="rowClueClass(r)"
              aria-hidden="true"
            >
              <span v-for="(n, i) in rowClue" :key="i" class="text-xs font-medium w-4 text-center">{{ n }}</span>
            </div>

            <!-- Cells -->
            <div
              v-for="(_, c) in activePuzzle.colClues"
              :key="c"
              :id="`cell-${r}-${c}`"
              role="checkbox"
              :aria-checked="playerGrid[r]?.[c] === true ? 'true' : 'false'"
              :aria-label="cellAriaLabel(r, c)"
              tabindex="0"
              :class="cellClass(r, c)"
              @mousedown="handleMouseDown($event, r, c)"
              @mouseenter="handleMouseEnter(r, c)"
              @keydown="handleKeydown($event, r, c)"
              @touchstart.passive="handleTouchStart(r, c)"
              @touchmove.passive="handleTouchMove"
              @touchend.passive="handleTouchEnd(r, c)"
            >
              <span v-if="playerGrid[r]?.[c] === false" class="pointer-events-none">✕</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Best time -->
      <p v-if="bestTime !== null && !gameWon" class="mt-2 text-xs text-gray-400 text-center">
        Best time: <strong>{{ Math.floor(bestTime / 60).toString().padStart(2,'0') }}:{{ (bestTime % 60).toString().padStart(2,'0') }}</strong>
      </p>

      <!-- Privacy note -->
      <p class="mt-6 text-xs text-gray-400 text-center">
        Everything runs in your browser — no data is ever sent to a server.
      </p>
    </template>

  </main>
</template>
