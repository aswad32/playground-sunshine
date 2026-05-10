<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { BarChart2, ChevronDown, ChevronUp, RotateCcw, Share2, X } from 'lucide-vue-next'
import {
  evaluateGuess,
  isValidGuess,
  pickRandomWord,
  getDailyWord,
  dailyStateKey,
  type GuessResult,
} from '~/utils/wordle'
import { useWordleStats } from '~/composables/useWordleStats'

useSeoMeta({
  title: 'Wordle Clone - Playground Sunshine',
  description: 'Play an unlimited Wordle-style word game in your browser. Guess the 5-letter word in 6 tries — free, unlimited, and fully private.',
})

// ── Game mode ───────────────────────────────────────────────────────────────

type Mode = 'random' | 'daily'
const mode = ref<Mode>('random')

// ── Board state ─────────────────────────────────────────────────────────────

const MAX_GUESSES = 6
const WORD_LENGTH = 5

const answer = ref('')
// Each row is a GuessResult[] once submitted, or null while in-progress
const submittedGuesses = ref<GuessResult[][]>([])
const currentInput = ref('')
const gameStatus = ref<'playing' | 'won' | 'lost'>('playing')

// ── Stats ──────────────────────────────────────────────────────────────────

const { stats, refresh: refreshStats, recordResult, winPercent, maxDistribution } = useWordleStats()
const showStats = ref(false)

// ── Toast ──────────────────────────────────────────────────────────────────

const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2000)
}

// ── Shake ──────────────────────────────────────────────────────────────────

const shakeRow = ref(false)
function triggerShake() {
  shakeRow.value = false
  requestAnimationFrame(() => { shakeRow.value = true })
  setTimeout(() => { shakeRow.value = false }, 600)
}

// ── Flip animation tracking ────────────────────────────────────────────────

// Track which rows have been revealed (flip animation played)
const flippedRows = ref<Set<number>>(new Set())
function markFlipped(rowIndex: number) {
  flippedRows.value = new Set([...flippedRows.value, rowIndex])
}

// ── Countdown timer (daily mode) ──────────────────────────────────────────

const countdown = ref('')
let countdownHandle: ReturnType<typeof setInterval> | null = null

function updateCountdown() {
  const now = new Date()
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  const diff = Math.max(0, Math.floor((midnight.getTime() - Date.now()) / 1000))
  const h = Math.floor(diff / 3600).toString().padStart(2, '0')
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
  const s = (diff % 60).toString().padStart(2, '0')
  countdown.value = `${h}:${m}:${s}`
}

function startCountdown() {
  stopCountdown()
  updateCountdown()
  countdownHandle = setInterval(updateCountdown, 1000)
}

function stopCountdown() {
  if (countdownHandle) { clearInterval(countdownHandle); countdownHandle = null }
}

onUnmounted(() => { stopCountdown(); if (toastTimer) clearTimeout(toastTimer) })

// ── How to play ────────────────────────────────────────────────────────────

const showHelp = ref(false)
const HELP_KEY = 'ps-wordle-help-open'
onMounted(() => { showHelp.value = localStorage.getItem(HELP_KEY) === 'true' })
watch(showHelp, (v) => localStorage.setItem(HELP_KEY, String(v)))

// ── Game init ──────────────────────────────────────────────────────────────

function initRandom() {
  answer.value = pickRandomWord()
  submittedGuesses.value = []
  currentInput.value = ''
  gameStatus.value = 'playing'
  flippedRows.value = new Set()
  stopCountdown()
}

interface DailyState {
  guesses: GuessResult[][]
  status: 'playing' | 'won' | 'lost'
}

function initDaily() {
  answer.value = getDailyWord()
  flippedRows.value = new Set()
  stopCountdown()

  // Load saved daily state
  try {
    const raw = localStorage.getItem(dailyStateKey())
    if (raw) {
      const saved = JSON.parse(raw) as DailyState
      submittedGuesses.value = saved.guesses
      gameStatus.value = saved.status
      // Mark all rows as flipped (no animation on resume)
      for (let i = 0; i < saved.guesses.length; i++) markFlipped(i)
      if (saved.status !== 'playing') startCountdown()
      currentInput.value = ''
      return
    }
  } catch { /* ignore */ }

  submittedGuesses.value = []
  currentInput.value = ''
  gameStatus.value = 'playing'
}

function saveDailyState() {
  if (mode.value !== 'daily') return
  const state: DailyState = { guesses: submittedGuesses.value, status: gameStatus.value }
  localStorage.setItem(dailyStateKey(), JSON.stringify(state))
}

onMounted(() => {
  refreshStats()
  initRandom()
})

function setMode(m: Mode) {
  mode.value = m
  if (m === 'daily') initDaily()
  else initRandom()
}

// ── Letter state for keyboard ──────────────────────────────────────────────

type LetterState = 'correct' | 'present' | 'absent' | 'unknown'
const PRIORITY: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, unknown: 0 }

const letterStates = computed<Record<string, LetterState>>(() => {
  const map: Record<string, LetterState> = {}
  for (const row of submittedGuesses.value) {
    for (const { letter, result } of row) {
      const current = map[letter] ?? 'unknown'
      if (PRIORITY[result] > PRIORITY[current]) map[letter] = result
    }
  }
  return map
})

// ── Board display ──────────────────────────────────────────────────────────

interface DisplayTile {
  letter: string
  state: LetterState | 'empty' | 'active'
}

const board = computed<DisplayTile[][]>(() => {
  const rows: DisplayTile[][] = []

  // Submitted rows
  for (const guess of submittedGuesses.value) {
    rows.push(guess.map((g) => ({ letter: g.letter, state: g.result })))
  }

  // Current input row (if still playing)
  if (gameStatus.value === 'playing' && rows.length < MAX_GUESSES) {
    const row: DisplayTile[] = []
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = currentInput.value[i] ?? ''
      row.push({ letter, state: letter ? 'active' : 'empty' })
    }
    rows.push(row)
  }

  // Empty remaining rows
  while (rows.length < MAX_GUESSES) {
    rows.push(Array(WORD_LENGTH).fill({ letter: '', state: 'empty' }))
  }

  return rows
})

// ── Submit guess ───────────────────────────────────────────────────────────

function submitGuess() {
  if (gameStatus.value !== 'playing') return
  const guess = currentInput.value.toUpperCase()

  if (guess.length < WORD_LENGTH) {
    showToast('Not enough letters')
    triggerShake()
    return
  }

  if (!isValidGuess(guess)) {
    showToast('Not a valid word')
    triggerShake()
    return
  }

  const result = evaluateGuess(guess, answer.value)
  const rowIndex = submittedGuesses.value.length
  submittedGuesses.value = [...submittedGuesses.value, result]

  // Mark flipped after animation duration
  setTimeout(() => markFlipped(rowIndex), 350)

  currentInput.value = ''

  if (guess === answer.value) {
    gameStatus.value = 'won'
    recordResult(submittedGuesses.value.length)
    saveDailyState()
    if (mode.value === 'daily') startCountdown()
    refreshStats()
    setTimeout(() => showToast(['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'][submittedGuesses.value.length - 1] ?? 'Nice!'), 400)
    return
  }

  if (submittedGuesses.value.length >= MAX_GUESSES) {
    gameStatus.value = 'lost'
    recordResult(null)
    saveDailyState()
    if (mode.value === 'daily') startCountdown()
    refreshStats()
    setTimeout(() => showToast(answer.value), 400)
    return
  }

  saveDailyState()
}

// ── Key handlers ───────────────────────────────────────────────────────────

function handleKey(key: string) {
  if (gameStatus.value !== 'playing') return
  if (key === 'Enter') { submitGuess(); return }
  if (key === 'Backspace' || key === 'Delete') {
    currentInput.value = currentInput.value.slice(0, -1)
    return
  }
  if (/^[a-zA-Z]$/.test(key) && currentInput.value.length < WORD_LENGTH) {
    currentInput.value += key.toUpperCase()
  }
}

function onPhysicalKey(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  handleKey(e.key)
}

onMounted(() => window.addEventListener('keydown', onPhysicalKey))
onUnmounted(() => window.removeEventListener('keydown', onPhysicalKey))

// ── On-screen keyboard ─────────────────────────────────────────────────────

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Enter','Z','X','C','V','B','N','M','⌫'],
]

function keyClass(key: string): string {
  const base = 'flex items-center justify-center rounded font-bold text-sm select-none cursor-pointer transition-colors'
  const size = key.length > 1 ? 'h-14 px-3 min-w-[42px]' : 'h-14 w-9'
  const state = letterStates.value[key] ?? 'unknown'
  const color =
    state === 'correct' ? 'bg-green-500 text-white' :
    state === 'present' ? 'bg-amber-400 text-white' :
    state === 'absent' ? 'bg-gray-500 text-white' :
    'bg-gray-200 text-gray-900 hover:bg-gray-300'
  return `${base} ${size} ${color}`
}

// ── Tile styling ───────────────────────────────────────────────────────────

function tileClass(rowIndex: number, tile: DisplayTile): string {
  const base = 'w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 uppercase select-none'
  const revealed = flippedRows.value.has(rowIndex)

  if (tile.state === 'correct' && revealed) return `${base} bg-green-500 text-white border-green-500 tile-flip`
  if (tile.state === 'present' && revealed) return `${base} bg-amber-400 text-white border-amber-400 tile-flip`
  if (tile.state === 'absent' && revealed) return `${base} bg-gray-500 text-white border-gray-500 tile-flip`
  if (tile.state === 'active') return `${base} border-gray-500 text-gray-900`
  if (tile.letter && !revealed) return `${base} border-gray-400 text-gray-900 tile-flip`
  return `${base} border-gray-300 text-gray-900`
}

// ── Share ──────────────────────────────────────────────────────────────────

function shareResult() {
  const modeLabel = mode.value === 'daily' ? 'Daily' : 'Random'
  const score = gameStatus.value === 'won' ? `${submittedGuesses.value.length}/6` : 'X/6'
  const grid = submittedGuesses.value.map((row) =>
    row.map((g) => g.result === 'correct' ? '🟩' : g.result === 'present' ? '🟨' : '⬛').join('')
  ).join('\n')
  const text = `Wordle (Playground Sunshine) — ${modeLabel}\n${score}\n\n${grid}`
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!')).catch(() => showToast('Copy failed'))
}

// ── Stats display helpers ──────────────────────────────────────────────────

const DIST_LABELS = [1, 2, 3, 4, 5, 6] as const
</script>

<template>
  <main class="max-w-lg mx-auto px-4 py-6 flex flex-col items-center" @keydown.stop>

    <!-- Header -->
    <div class="w-full flex items-center justify-between mb-3">
      <h1 class="text-2xl font-bold text-gray-900 tracking-widest">WORDLE</h1>
      <div class="flex items-center gap-2">
        <!-- Mode toggle -->
        <div class="flex rounded-lg border border-gray-300 overflow-hidden text-xs font-medium">
          <button
            class="px-3 py-1.5 transition-colors"
            :class="mode === 'random' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
            @click="setMode('random')"
          >Random</button>
          <button
            class="px-3 py-1.5 transition-colors"
            :class="mode === 'daily' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
            @click="setMode('daily')"
          >Daily</button>
        </div>
        <button
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Statistics"
          @click="showStats = true; refreshStats()"
        >
          <BarChart2 class="w-5 h-5" />
        </button>
        <button
          v-if="mode === 'random'"
          class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="New game"
          @click="initRandom()"
        >
          <RotateCcw class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- How to play -->
    <div class="w-full mb-3 border border-gray-200 rounded-xl overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
        @click="showHelp = !showHelp"
      >
        <span>How to play</span>
        <ChevronUp v-if="showHelp" class="w-3 h-3" />
        <ChevronDown v-else class="w-3 h-3" />
      </button>
      <div v-if="showHelp" class="px-4 py-3 text-xs text-gray-700 space-y-1.5 bg-white">
        <p class="font-semibold">Guess the hidden 5-letter word in 6 tries.</p>
        <ul class="space-y-1">
          <li>Type any valid 5-letter word and press <strong>Enter</strong> to submit.</li>
          <li>After each guess, the tile colours tell you how close you were:</li>
        </ul>
        <div class="space-y-1 pl-2">
          <p>🟩 <strong>Green</strong> — right letter, right position.</p>
          <p>🟨 <strong>Yellow</strong> — letter is in the word but wrong position.</p>
          <p>⬛ <strong>Grey</strong> — letter is not in the word at all.</p>
        </div>
        <p>In <strong>Daily</strong> mode the answer resets at midnight UTC. In <strong>Random</strong> mode a new word is chosen each game.</p>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toastMessage"
      role="alert"
      aria-live="assertive"
      class="mb-3 px-5 py-2 rounded-xl bg-gray-800 text-white font-semibold text-sm text-center"
    >
      {{ toastMessage }}
    </div>

    <!-- Board -->
    <div class="mb-4">
      <div
        v-for="(row, rowIndex) in board"
        :key="rowIndex"
        class="flex gap-1.5 mb-1.5"
        :class="rowIndex === submittedGuesses.length && shakeRow ? 'tile-shake' : ''"
      >
        <div
          v-for="(tile, colIndex) in row"
          :key="colIndex"
          :class="tileClass(rowIndex, tile)"
          :aria-label="`Row ${rowIndex + 1}, position ${colIndex + 1}: ${tile.letter || 'empty'} — ${tile.state}`"
          role="img"
        >
          {{ tile.letter }}
        </div>
      </div>
    </div>

    <!-- Game over actions -->
    <div v-if="gameStatus !== 'playing'" class="mb-4 flex flex-col items-center gap-2">
      <p v-if="gameStatus === 'won'" class="font-semibold text-green-600 text-center">
        Well done! 🎉
      </p>
      <p v-else class="font-semibold text-gray-700 text-center">
        The word was <strong class="text-indigo-600">{{ answer }}</strong>
      </p>
      <div class="flex gap-2 flex-wrap justify-center">
        <button
          v-if="mode === 'random'"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-colors"
          @click="initRandom()"
        >
          <RotateCcw class="w-4 h-4" /> Play again
        </button>
        <button
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 text-white font-medium text-sm hover:bg-gray-700 transition-colors"
          @click="shareResult()"
        >
          <Share2 class="w-4 h-4" /> Share
        </button>
      </div>
      <p v-if="mode === 'daily'" class="text-xs text-gray-500 mt-1">Next word in <strong>{{ countdown }}</strong></p>
    </div>

    <!-- On-screen keyboard -->
    <div class="w-full max-w-sm space-y-1.5">
      <div
        v-for="(row, ri) in KEYBOARD_ROWS"
        :key="ri"
        class="flex justify-center gap-1"
      >
        <button
          v-for="key in row"
          :key="key"
          :class="keyClass(key)"
          :aria-label="key === '⌫' ? 'Backspace' : key"
          @click="handleKey(key === '⌫' ? 'Backspace' : key)"
        >
          {{ key }}
        </button>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400 text-center">
      Everything runs in your browser — no data is ever sent to a server.
    </p>

    <!-- Stats modal -->
    <Teleport to="body">
      <div
        v-if="showStats"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="showStats = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 relative">
          <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700" @click="showStats = false">
            <X class="w-5 h-5" />
          </button>
          <h2 class="text-lg font-bold text-gray-900 mb-4 text-center tracking-widest">STATISTICS</h2>

          <div class="flex justify-around mb-6">
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900">{{ stats.played }}</p>
              <p class="text-xs text-gray-500">Played</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900">{{ winPercent }}</p>
              <p class="text-xs text-gray-500">Win %</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900">{{ stats.currentStreak }}</p>
              <p class="text-xs text-gray-500">Streak</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900">{{ stats.maxStreak }}</p>
              <p class="text-xs text-gray-500">Max streak</p>
            </div>
          </div>

          <h3 class="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3 text-center">Guess distribution</h3>
          <div class="space-y-1">
            <div
              v-for="n in DIST_LABELS"
              :key="n"
              class="flex items-center gap-2 text-xs"
            >
              <span class="w-3 text-gray-700 font-medium">{{ n }}</span>
              <div class="flex-1 bg-gray-100 rounded overflow-hidden h-5 relative">
                <div
                  class="h-full bg-indigo-500 flex items-center justify-end pr-1.5 text-white font-bold text-xs min-w-[24px] transition-all duration-500"
                  :style="`width: ${Math.max(12, Math.round((stats.distribution[n] / maxDistribution) * 100))}%`"
                >
                  {{ stats.distribution[n] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </main>
</template>

<style scoped>
@keyframes tile-flip {
  0% { transform: rotateX(0deg); }
  50% { transform: rotateX(-90deg); }
  100% { transform: rotateX(0deg); }
}

@keyframes tile-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.tile-flip {
  animation: tile-flip 0.35s ease-in-out;
}

.tile-shake {
  animation: tile-shake 0.5s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .tile-flip, .tile-shake { animation: none; }
}
</style>
