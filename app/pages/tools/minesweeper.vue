<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronDown, ChevronUp, Bomb, Flag, RotateCcw } from 'lucide-vue-next'
import {
  createEmptyBoard,
  placeMines,
  floodReveal,
  chordReveal,
  checkWin,
  revealAll,
  type Board,
  type Position,
} from '~/utils/minesweeper'

useSeoMeta({
  title: 'Minesweeper - Playground Sunshine',
  description: 'Play Minesweeper in your browser. Choose a difficulty, reveal safe tiles, and avoid the mines — free and fully private.',
})

// ── Difficulty ─────────────────────────────────────────────────────────────

interface Preset {
  label: string
  width: number
  height: number
  mines: number
}

const PRESETS: Preset[] = [
  { label: 'Beginner', width: 9, height: 9, mines: 10 },
  { label: 'Intermediate', width: 16, height: 16, mines: 40 },
  { label: 'Expert', width: 30, height: 16, mines: 99 },
]

const selectedPreset = ref<string>('Beginner')
const customWidth = ref(10)
const customHeight = ref(10)
const customMines = ref(15)

const isCustom = computed(() => selectedPreset.value === 'Custom')

const activeConfig = computed<Preset>(() => {
  if (isCustom.value) {
    const w = Math.min(50, Math.max(5, customWidth.value))
    const h = Math.min(30, Math.max(5, customHeight.value))
    const maxMines = w * h - 9
    return { label: 'Custom', width: w, height: h, mines: Math.min(maxMines, Math.max(1, customMines.value)) }
  }
  return PRESETS.find((p) => p.label === selectedPreset.value) ?? PRESETS[0]
})

// ── Game state ─────────────────────────────────────────────────────────────

type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

const board = ref<Board>(createEmptyBoard(9, 9))
const status = ref<GameStatus>('idle')
const minesPlaced = ref(false)

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

const timerDisplay = computed(() => String(elapsed.value).padStart(3, '0'))

// ── Mine counter ───────────────────────────────────────────────────────────

const flagCount = computed(() => board.value.flat().filter((c) => c.state === 'flagged').length)
const mineCounter = computed(() => activeConfig.value.mines - flagCount.value)

// ── Best times ─────────────────────────────────────────────────────────────

function bestTimeKey(label: string) { return `ps-minesweeper-best-${label.toLowerCase()}` }

function getBestTime(label: string): number | null {
  const raw = localStorage.getItem(bestTimeKey(label))
  return raw ? parseInt(raw, 10) : null
}

function saveBestTime(label: string, time: number) {
  const existing = getBestTime(label)
  if (existing === null || time < existing) {
    localStorage.setItem(bestTimeKey(label), String(time))
  }
}

const bestTime = computed(() => getBestTime(activeConfig.value.label))

// ── New game ───────────────────────────────────────────────────────────────

function newGame() {
  stopTimer()
  const { width, height } = activeConfig.value
  board.value = createEmptyBoard(width, height)
  status.value = 'idle'
  minesPlaced.value = false
  elapsed.value = 0
}

// Start fresh when preset changes
watch(selectedPreset, newGame)
watch([customWidth, customHeight, customMines], () => { if (isCustom.value) newGame() })

// ── Cell interactions ──────────────────────────────────────────────────────

function handleCellClick(pos: Position) {
  if (status.value === 'won' || status.value === 'lost') return
  const cell = board.value[pos.row][pos.col]
  if (cell.state === 'flagged') return

  // Chord click on a revealed numbered cell
  if (cell.state === 'revealed' && cell.adjacent > 0) {
    const result = chordReveal(board.value, pos)
    if (result) {
      board.value = result
      checkGameState(pos)
    }
    return
  }

  if (cell.state !== 'hidden') return

  // First click — place mines now to guarantee safety
  if (!minesPlaced.value) {
    board.value = placeMines(board.value, activeConfig.value.mines, pos)
    minesPlaced.value = true
    status.value = 'playing'
    startTimer()
  }

  // Reveal (and check if it's a mine)
  if (board.value[pos.row][pos.col].mine) {
    // Hit a mine
    board.value = revealAll(board.value)
    status.value = 'lost'
    stopTimer()
    return
  }

  board.value = floodReveal(board.value, pos)
  checkGameState(pos)
}

function handleCellRightClick(event: MouseEvent, pos: Position) {
  event.preventDefault()
  if (status.value === 'won' || status.value === 'lost') return
  const cell = board.value[pos.row][pos.col]
  if (cell.state === 'revealed') return

  const next = board.value.map((row) => row.map((c) => ({ ...c })))
  next[pos.row][pos.col] = {
    ...cell,
    state: cell.state === 'flagged' ? 'hidden' : 'flagged',
  }
  board.value = next
}

function handleCellDoubleClick(pos: Position) {
  if (status.value === 'won' || status.value === 'lost') return
  const cell = board.value[pos.row][pos.col]
  if (cell.state !== 'revealed' || cell.adjacent === 0) return
  const result = chordReveal(board.value, pos)
  if (result) {
    board.value = result
    checkGameState(pos)
  }
}

function handleCellKeydown(event: KeyboardEvent, pos: Position) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    handleCellClick(pos)
  }
  if (event.key === 'f' || event.key === 'F') {
    event.preventDefault()
    handleCellRightClick(event as unknown as MouseEvent, pos)
  }
}

function checkGameState(_pos: Position) {
  if (checkWin(board.value)) {
    // Auto-flag remaining mines
    board.value = board.value.map((row) =>
      row.map((cell) => cell.mine && cell.state === 'hidden' ? { ...cell, state: 'flagged' } : cell),
    )
    status.value = 'won'
    stopTimer()
    saveBestTime(activeConfig.value.label, elapsed.value)
  }
}

// ── Long-press for mobile (flag) ───────────────────────────────────────────

let longPressTimer: ReturnType<typeof setTimeout> | null = null

function handleTouchStart(pos: Position) {
  longPressTimer = setTimeout(() => {
    handleCellRightClick({ preventDefault: () => {} } as MouseEvent, pos)
  }, 500)
}

function handleTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
}

// ── Cell display helpers ───────────────────────────────────────────────────

const NUMBER_COLOURS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-500',
  4: 'text-blue-900',
  5: 'text-red-900',
  6: 'text-cyan-600',
  7: 'text-gray-800',
  8: 'text-gray-500',
}

function cellClass(row: number, col: number): string {
  const cell = board.value[row][col]
  const base = 'flex items-center justify-center select-none cursor-pointer border border-gray-300 text-sm font-bold transition-colors'
  if (cell.state === 'hidden') return `${base} bg-gray-200 hover:bg-gray-300 active:bg-gray-400`
  if (cell.state === 'flagged') return `${base} bg-gray-200`
  // revealed
  if (cell.mine && status.value === 'lost') return `${base} bg-red-200`
  return `${base} bg-gray-100`
}

function cellLabel(row: number, col: number): string {
  const cell = board.value[row][col]
  if (cell.state === 'hidden') return `Row ${row + 1}, Column ${col + 1}, hidden`
  if (cell.state === 'flagged') return `Row ${row + 1}, Column ${col + 1}, flagged`
  if (cell.mine) return `Row ${row + 1}, Column ${col + 1}, mine`
  if (cell.adjacent > 0) return `Row ${row + 1}, Column ${col + 1}, ${cell.adjacent}`
  return `Row ${row + 1}, Column ${col + 1}, blank`
}

// ── How to Play panel ──────────────────────────────────────────────────────

const showHelp = ref(false)
const HELP_KEY = 'ps-minesweeper-help-open'

watch(showHelp, (v) => localStorage.setItem(HELP_KEY, String(v)))

// ── Flat cell list for rendering ───────────────────────────────────────────

const flatCells = computed(() =>
  board.value.flatMap((row, r) => row.map((_, c) => ({ r, c }))),
)

// ── Initialise ─────────────────────────────────────────────────────────────

onMounted(() => {
  const stored = localStorage.getItem(HELP_KEY)
  showHelp.value = stored === 'true'
  newGame()
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <!-- Title -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Minesweeper</h1>
      <p class="text-gray-500 mt-1">Reveal every safe tile without hitting a mine.</p>
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
        <p>The board is a grid of covered tiles. Some tiles hide mines — your job is to uncover every tile that does <strong>not</strong> have a mine.</p>
        <ul class="list-disc list-inside space-y-1">
          <li><strong>Click / tap</strong> a tile to reveal it. A number shows how many of its 8 neighbours are mines. A blank tile auto-reveals all safe neighbours.</li>
          <li><strong>Right-click / long-press</strong> to place a 🚩 flag on a tile you think is a mine. Flagged tiles cannot be accidentally revealed.</li>
          <li><strong>Double-click / chord-click</strong> a revealed number to instantly reveal all unflagged neighbours — only safe when you've flagged exactly the right mines around it.</li>
          <li>Your <strong>first click is always safe</strong> — mines are placed after you click.</li>
        </ul>
        <p>You win when every non-mine tile is revealed. You lose the moment you reveal a mine.</p>
      </div>
    </div>

    <!-- Difficulty selector -->
    <div class="mb-4 flex flex-wrap gap-2 items-center">
      <button
        v-for="p in PRESETS"
        :key="p.label"
        class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
        :class="selectedPreset === p.label ? 'bg-amber-400 border-amber-400 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
        @click="selectedPreset = p.label"
      >
        {{ p.label }}
      </button>
      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
        :class="isCustom ? 'bg-amber-400 border-amber-400 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
        @click="selectedPreset = 'Custom'"
      >
        Custom
      </button>
    </div>

    <!-- Custom inputs -->
    <div v-if="isCustom" class="mb-4 flex flex-wrap gap-3 items-end">
      <label class="flex flex-col gap-1 text-xs text-gray-600 font-medium">
        Width (5–50)
        <input
          v-model.number="customWidth"
          type="number" min="5" max="50"
          class="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
      </label>
      <label class="flex flex-col gap-1 text-xs text-gray-600 font-medium">
        Height (5–30)
        <input
          v-model.number="customHeight"
          type="number" min="5" max="30"
          class="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
      </label>
      <label class="flex flex-col gap-1 text-xs text-gray-600 font-medium">
        Mines
        <input
          v-model.number="customMines"
          type="number" min="1" :max="customWidth * customHeight - 9"
          class="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
      </label>
      <button
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-400 text-white hover:bg-amber-500 transition-colors"
        @click="newGame"
      >
        Apply
      </button>
    </div>

    <!-- Game header: mine counter | reset | timer -->
    <div class="mb-3 flex items-center justify-between bg-gray-100 rounded-xl px-4 py-2 font-mono text-lg font-bold">
      <div class="flex items-center gap-1.5 text-red-600 min-w-[48px]">
        <Bomb class="w-5 h-5" />
        <span>{{ mineCounter }}</span>
      </div>

      <button
        class="px-3 py-1 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        aria-label="New game"
        @click="newGame"
      >
        <RotateCcw class="w-4 h-4" />
        {{ status === 'idle' ? 'New Game' : 'Reset' }}
      </button>

      <div class="flex items-center gap-1.5 text-gray-700 min-w-[48px] justify-end">
        <span>{{ timerDisplay }}</span>
      </div>
    </div>

    <!-- Win / loss banner -->
    <div
      v-if="status === 'won' || status === 'lost'"
      class="mb-4 rounded-xl px-4 py-3 text-center font-semibold text-white"
      :class="status === 'won' ? 'bg-green-500' : 'bg-red-500'"
      role="alert"
      aria-live="assertive"
    >
      <span v-if="status === 'won'">🎉 You win! Cleared in {{ elapsed }}s</span>
      <span v-else>💥 Boom! Better luck next time.</span>
      <button class="ml-3 underline text-sm font-normal" @click="newGame">Play again</button>
    </div>

    <!-- Board -->
    <div class="overflow-x-auto">
      <div
        class="inline-grid gap-px bg-gray-300 border border-gray-300 rounded-lg overflow-hidden"
        :style="`grid-template-columns: repeat(${activeConfig.width}, minmax(0, 1fr))`"
      >
        <div
          v-for="{ r, c } in flatCells"
          :key="`${r}-${c}`"
          role="button"
          tabindex="0"
          :aria-label="cellLabel(r, c)"
          :aria-pressed="board[r][c].state === 'revealed'"
          :class="[cellClass(r, c), 'w-9 h-9 md:w-10 md:h-10']"
          @click="handleCellClick({ row: r, col: c })"
          @dblclick="handleCellDoubleClick({ row: r, col: c })"
          @contextmenu="handleCellRightClick($event, { row: r, col: c })"
          @keydown="handleCellKeydown($event, { row: r, col: c })"
          @touchstart.passive="handleTouchStart({ row: r, col: c })"
          @touchend.passive="handleTouchEnd"
          @touchmove.passive="handleTouchEnd"
        >
          <!-- Hidden -->
          <template v-if="board[r][c].state === 'hidden'" />

          <!-- Flagged -->
          <Flag v-else-if="board[r][c].state === 'flagged'" class="w-4 h-4 text-red-500" />

          <!-- Revealed mine -->
          <Bomb v-else-if="board[r][c].mine" class="w-4 h-4 text-gray-800" />

          <!-- Revealed number -->
          <span
            v-else-if="board[r][c].adjacent > 0"
            :class="NUMBER_COLOURS[board[r][c].adjacent] ?? 'text-gray-700'"
          >
            {{ board[r][c].adjacent }}
          </span>

          <!-- Revealed blank — empty -->
        </div>
      </div>
    </div>

    <!-- Best time -->
    <p v-if="bestTime !== null" class="mt-3 text-xs text-gray-500 text-center">
      Best time ({{ activeConfig.label }}): <strong>{{ bestTime }}s</strong>
    </p>

    <!-- Privacy note -->
    <p class="mt-6 text-xs text-gray-400 text-center">
      Everything runs in your browser — no data is ever sent to a server.
    </p>
  </main>
</template>
