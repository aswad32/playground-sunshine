<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { boardToString, type Difficulty } from '~/utils/sudokuHelpers'
import { generatePuzzle, type GeneratedPuzzle } from '~/utils/sudokuGenerator'
import { exportSudokuPdf } from '~/utils/sudokuPdf'

useSeoMeta({
  title: 'Sudoku Generator - Playground Sunshine',
  description: 'Generate a new Sudoku puzzle at any difficulty — Easy, Medium, Hard, or Expert — instantly in your browser. Free and private.',
})

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
const selectedDifficulty = ref<Difficulty>('medium')
const puzzle = ref<GeneratedPuzzle | null>(null)
const generating = ref(false)

const BOX_BORDERS_ROW = [2, 5]
const BOX_BORDERS_COL = [2, 5]

onMounted(() => {
  run()
})

async function run() {
  generating.value = true
  puzzle.value = null
  // Small timeout so the UI can re-render "Generating…" state
  await new Promise((resolve) => setTimeout(resolve, 10))
  puzzle.value = generatePuzzle(selectedDifficulty.value)
  generating.value = false
}

function cellClass(r: number, c: number): string[] {
  const classes: string[] = []
  if (BOX_BORDERS_ROW.includes(r)) classes.push('border-b-2 border-b-gray-600')
  if (BOX_BORDERS_COL.includes(c)) classes.push('border-r-2 border-r-gray-600')
  const val = puzzle.value?.puzzle[r][c] ?? 0
  if (val === 0) classes.push('text-gray-300')
  else classes.push('text-gray-900 font-bold')
  return classes
}

function displayVal(r: number, c: number): string {
  const v = puzzle.value?.puzzle[r][c] ?? 0
  return v === 0 ? '' : String(v)
}

const puzzleString = computed(() =>
  puzzle.value ? boardToString(puzzle.value.puzzle) : ''
)

const solverLink = computed(() =>
  puzzleString.value ? `/tools/sudoku-solver?puzzle=${puzzleString.value}` : '/tools/sudoku-solver'
)

const playerLink = computed(() =>
  puzzleString.value ? `/tools/sudoku-player?puzzle=${puzzleString.value}` : '/tools/sudoku-player'
)

const difficultyLabel = computed(() => {
  const d = selectedDifficulty.value
  return d.charAt(0).toUpperCase() + d.slice(1)
})

const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  hard: 'text-orange-600 bg-orange-50 border-orange-200',
  expert: 'text-red-600 bg-red-50 border-red-200',
}

const { copy, copied } = useClipboard()

// ── PDF export state ───────────────────────────────────────────────────────
const pdfDifficulty = ref<Difficulty>('medium')
const pdfCount = ref(4)
const pdfExporting = ref(false)
const pdfProgress = ref(0)
const pdfError = ref<string | null>(null)
const PDF_MAX = 10

watch(selectedDifficulty, (d) => { pdfDifficulty.value = d })

async function downloadPdf() {
  pdfError.value = null
  pdfExporting.value = true
  pdfProgress.value = 0
  try {
    await exportSudokuPdf(pdfDifficulty.value, pdfCount.value, (done) => {
      pdfProgress.value = done
    })
  } catch {
    pdfError.value = 'Could not generate all puzzles. Try a lower difficulty or fewer puzzles.'
  } finally {
    pdfExporting.value = false
    pdfProgress.value = 0
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Sudoku Generator</h1>
      <p class="text-gray-500 text-sm">
        Generate a fresh puzzle at any difficulty. Each puzzle has exactly one solution.
      </p>
    </header>

    <!-- Difficulty picker -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="d in difficulties"
        :key="d"
        :class="[
          'px-4 py-1.5 rounded-full border text-sm font-medium capitalize transition-colors',
          selectedDifficulty === d
            ? difficultyColors[d]
            : 'border-gray-200 text-gray-500 hover:bg-gray-50',
        ]"
        @click="selectedDifficulty = d"
      >
        {{ d }}
      </button>
    </div>

    <div class="flex flex-col lg:flex-row gap-8 items-start">
      <!-- Board -->
      <div class="shrink-0">
        <div
          v-if="generating"
          class="w-[360px] h-[360px] flex items-center justify-center text-gray-400 text-sm border-2 border-gray-200 rounded-lg"
        >
          Generating…
        </div>

        <template v-else-if="puzzle">
          <div class="inline-grid grid-cols-9 border-2 border-gray-700 rounded-lg overflow-hidden select-none">
            <template v-for="r in 9" :key="r">
              <template v-for="c in 9" :key="c">
                <div
                  :class="[
                    'w-10 h-10 flex items-center justify-center text-base font-mono',
                    'border border-gray-300',
                    ...cellClass(r - 1, c - 1),
                  ]"
                >
                  {{ displayVal(r - 1, c - 1) }}
                </div>
              </template>
            </template>
          </div>

          <p class="mt-2 text-xs text-gray-400">
            <span :class="['font-medium', difficultyColors[selectedDifficulty].split(' ')[0]]">
              {{ difficultyLabel }}
            </span>
            — {{ puzzle.givens }} givens
          </p>
        </template>
      </div>

      <!-- Controls -->
      <div class="flex-1 space-y-5 w-full">
        <div class="flex flex-wrap gap-2">
          <button
            :disabled="generating"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
            @click="run"
          >
            Generate
          </button>
        </div>

        <!-- Cross-links -->
        <div v-if="puzzle" class="flex flex-wrap gap-2">
          <NuxtLink
            :to="playerLink"
            class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            Play this puzzle
          </NuxtLink>
          <NuxtLink
            :to="solverLink"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Solve this puzzle
          </NuxtLink>
        </div>

        <!-- Puzzle string output -->
        <div v-if="puzzle" class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Puzzle string</label>
          <div class="flex gap-2">
            <input
              :value="puzzleString"
              readonly
              class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800 focus:outline-none"
            />
            <button
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              @click="copy(puzzleString)"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <p class="text-xs text-gray-400">81-character string — 0s are empty cells</p>
        </div>
      </div>
    </div>

    <!-- PDF Export section -->
    <div class="mt-10 border-t border-gray-100 pt-8">
      <h2 class="text-base font-semibold text-gray-800 mb-1">Export puzzles as PDF</h2>
      <p class="text-sm text-gray-400 mb-5">
        Generate multiple puzzles and download them as a printable A4 PDF. A solutions page is included at the end.
      </p>

      <div class="flex flex-wrap items-end gap-5">
        <!-- Difficulty -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Difficulty</label>
          <div class="flex gap-1.5">
            <button
              v-for="d in difficulties"
              :key="d"
              :class="[
                'px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-colors',
                pdfDifficulty === d
                  ? difficultyColors[d]
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50',
              ]"
              @click="pdfDifficulty = d"
            >
              {{ d }}
            </button>
          </div>
        </div>

        <!-- Count -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Number of puzzles
            <span class="normal-case text-gray-400">(max {{ PDF_MAX }})</span>
          </label>
          <div class="flex items-center gap-2">
            <button
              :disabled="pdfCount <= 1 || pdfExporting"
              class="w-8 h-8 rounded-lg border border-gray-200 text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              @click="pdfCount = Math.max(1, pdfCount - 1)"
            >−</button>
            <span class="w-6 text-center text-sm font-semibold text-gray-800 tabular-nums">{{ pdfCount }}</span>
            <button
              :disabled="pdfCount >= PDF_MAX || pdfExporting"
              class="w-8 h-8 rounded-lg border border-gray-200 text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              @click="pdfCount = Math.min(PDF_MAX, pdfCount + 1)"
            >+</button>
          </div>
        </div>

        <!-- Download button -->
        <button
          :disabled="pdfExporting"
          class="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-wait"
          @click="downloadPdf"
        >
          <span v-if="pdfExporting">
            Generating {{ pdfProgress }}&thinsp;/&thinsp;{{ pdfCount }}…
          </span>
          <span v-else>Download PDF</span>
        </button>
      </div>

      <!-- Error -->
      <p
        v-if="pdfError"
        role="alert"
        class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
      >
        {{ pdfError }}
      </p>
    </div>
  </main>
</template>
