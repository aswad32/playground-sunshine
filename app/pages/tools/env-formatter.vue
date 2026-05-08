<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { formatEnv } from '~/utils/envFormatter'

useSeoMeta({
  title: '.env Formatter - Playground Sunshine',
  description:
    'Format, validate, and clean up .env files directly in your browser. Detect duplicate keys and fix formatting without sending your secrets anywhere.',
})

const input = ref('')
const output = ref('')
const warnings = ref<{ line: number; message: string }[]>([])

const { copy, copied } = useClipboard()

function runFormat(sortAlpha = false) {
  const result = formatEnv(input.value, sortAlpha)
  output.value = result.output
  warnings.value = result.warnings
}

function clear() {
  input.value = ''
  output.value = ''
  warnings.value = []
}

function download() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '.env'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">.env Formatter</h1>
      <p class="text-gray-500 text-sm">
        Clean up and validate <code class="font-mono text-xs bg-gray-100 px-1 rounded">.env</code> files — trim whitespace, detect duplicates, and sort keys. Runs entirely in your browser.
      </p>
    </header>

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
            @click="runFormat(false)"
          >
            Format
          </button>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            @click="runFormat(true)"
          >
            Sort A–Z
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            @click="clear"
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
          placeholder="Formatted .env content will appear here"
          class="w-full h-72 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none"
          spellcheck="false"
        />

        <!-- Warnings -->
        <ul
          v-if="warnings.length"
          role="status"
          aria-live="polite"
          class="flex flex-col gap-1"
        >
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
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400">
      🔒 Your .env content never leaves your browser. Never paste secrets into tools you don't trust.
    </p>
  </main>
</template>
