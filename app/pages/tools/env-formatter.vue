<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download } from 'lucide-vue-next'
import { formatEnv, convertEnv, compareEnv, type ConvertTarget } from '~/utils/envFormatter'

useSeoMeta({
  title: '.env Formatter - Playground Sunshine',
  description:
    'Format, validate, and convert .env files to JSON, Docker Compose, GitHub Actions YAML, or .env.example — entirely in your browser.',
})

// ── Shared ─────────────────────────────────────────────────────────────────
type Mode = 'format' | 'compare'
const mode = ref<Mode>('format')

const { copy, copied } = useClipboard()

// ── Format & Convert mode ──────────────────────────────────────────────────
const input = ref('')
const output = ref('')
const warnings = ref<{ line: number; message: string }[]>([])
const target = ref<ConvertTarget>('env')
const sortAlpha = ref(false)

const convertTargets: { value: ConvertTarget; label: string; ext: string }[] = [
  { value: 'env',           label: '.env',                      ext: '.env' },
  { value: 'json',          label: 'JSON',                      ext: '.json' },
  { value: 'docker',        label: 'Docker Compose env block',  ext: '.yml' },
  { value: 'github-actions',label: 'GitHub Actions env: YAML',  ext: '.yml' },
  { value: 'env-example',   label: '.env.example',              ext: '.env.example' },
]

const downloadName = computed(() => {
  const t = convertTargets.find((t) => t.value === target.value)
  return t ? (t.value === 'env' ? '.env' : `output${t.ext}`) : 'output'
})

function runConvert() {
  const result = convertEnv(input.value, target.value, sortAlpha.value)
  output.value = result.output
  warnings.value = result.warnings
}

function runSort() {
  sortAlpha.value = true
  runConvert()
}

function clearFormat() {
  input.value = ''
  output.value = ''
  warnings.value = []
  sortAlpha.value = false
}

function download() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = downloadName.value
  a.click()
  URL.revokeObjectURL(url)
}

// ── Compare mode ───────────────────────────────────────────────────────────
const envInput = ref('')
const exampleInput = ref('')

const compareResult = computed(() => {
  if (!envInput.value.trim() && !exampleInput.value.trim()) return null
  return compareEnv(envInput.value, exampleInput.value)
})

const compareTotal = computed(() => {
  if (!compareResult.value) return null
  const { missing, extra, matching } = compareResult.value
  return `${missing.length} missing, ${extra.length} extra, ${matching.length} matching`
})

function clearCompare() {
  envInput.value = ''
  exampleInput.value = ''
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">.env Formatter</h1>
      <p class="text-gray-500 text-sm">
        Clean up, validate, and convert
        <code class="font-mono text-xs bg-gray-100 px-1 rounded">.env</code> files — or compare
        a <code class="font-mono text-xs bg-gray-100 px-1 rounded">.env</code> against a
        <code class="font-mono text-xs bg-gray-100 px-1 rounded">.env.example</code>. Runs entirely
        in your browser.
      </p>
    </header>

    <!-- Mode tabs -->
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        v-for="tab in [{ value: 'format', label: 'Format & Convert' }, { value: 'compare', label: 'Compare' }]"
        :key="tab.value"
        :class="[
          'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
          mode === tab.value
            ? 'border-yellow-400 text-gray-900'
            : 'border-transparent text-gray-500 hover:text-gray-700',
        ]"
        @click="mode = tab.value as Mode"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Format & Convert ────────────────────────────────────────────── -->
    <div v-if="mode === 'format'">
      <!-- Conversion target selector -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Output format:</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="t in convertTargets"
            :key="t.value"
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              target === t.value
                ? 'bg-yellow-400 border-yellow-400 text-gray-900'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400',
            ]"
            @click="target = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Input -->
        <div class="flex flex-col gap-2">
          <label for="env-input" class="text-sm font-medium text-gray-700">Input</label>
          <textarea
            id="env-input"
            v-model="input"
            placeholder="Paste your .env content here&#10;&#10;# Example&#10;DB_HOST=localhost&#10;API_KEY=your_key_here"
            class="w-full h-72 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
            spellcheck="false"
          />
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors"
              @click="runConvert"
            >
              {{ target === 'env' ? 'Format' : 'Convert' }}
            </button>
            <button
              v-if="target === 'env'"
              type="button"
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              @click="runSort"
            >
              Sort A–Z
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              @click="clearFormat"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Output -->
        <div class="flex flex-col gap-2">
          <label for="env-output" class="text-sm font-medium text-gray-700">Output</label>
          <textarea
            id="env-output"
            :value="output"
            readonly
            placeholder="Output will appear here"
            class="w-full h-72 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none"
            spellcheck="false"
          />

          <!-- Warnings -->
          <ul v-if="warnings.length" role="status" aria-live="polite" class="flex flex-col gap-1">
            <li
              v-for="(w, i) in warnings"
              :key="i"
              class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
            >
              {{ w.message }}
            </li>
          </ul>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :disabled="!output"
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="copy(output)"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
            <button
              type="button"
              :disabled="!output"
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="download"
            >
              <Download :size="14" />
              Download {{ downloadName }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Compare ─────────────────────────────────────────────────────── -->
    <div v-else>
      <div class="grid gap-6 lg:grid-cols-2 mb-6">
        <div class="flex flex-col gap-2">
          <label for="compare-env" class="text-sm font-medium text-gray-700">.env</label>
          <textarea
            id="compare-env"
            v-model="envInput"
            placeholder="Paste your .env content"
            class="w-full h-64 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
            spellcheck="false"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="compare-example" class="text-sm font-medium text-gray-700">.env.example</label>
          <textarea
            id="compare-example"
            v-model="exampleInput"
            placeholder="Paste your .env.example content"
            class="w-full h-64 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
            spellcheck="false"
          />
        </div>
      </div>

      <div class="flex gap-2 mb-6">
        <button
          type="button"
          class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          @click="clearCompare"
        >
          Clear
        </button>
      </div>

      <!-- Empty state -->
      <p v-if="!compareResult" class="text-sm text-gray-400">
        Paste both files above to see a comparison.
      </p>

      <!-- Results -->
      <div v-else class="space-y-4">
        <p class="text-sm font-medium text-gray-700">{{ compareTotal }}</p>

        <div v-if="compareResult.missing.length" class="rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">
            Missing from .env ({{ compareResult.missing.length }})
          </p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="key in compareResult.missing"
              :key="key"
              class="font-mono text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
            >
              {{ key }}
            </li>
          </ul>
        </div>

        <div v-if="compareResult.extra.length" class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-yellow-700 mb-2">
            Extra in .env ({{ compareResult.extra.length }})
          </p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="key in compareResult.extra"
              :key="key"
              class="font-mono text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
            >
              {{ key }}
            </li>
          </ul>
        </div>

        <div v-if="compareResult.matching.length" class="rounded-lg border border-green-200 bg-green-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
            Matching ({{ compareResult.matching.length }})
          </p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="key in compareResult.matching"
              :key="key"
              class="font-mono text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
            >
              {{ key }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400">
      🔒 Your .env content never leaves your browser. Never paste secrets into tools you don't trust.
    </p>
  </main>
</template>
