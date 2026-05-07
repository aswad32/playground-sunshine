<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { formatJson, minifyJson } from '~/utils/jsonFormatter'

useSeoMeta({
  title: 'JSON Formatter - Playground Sunshine',
  description: 'Format, validate, and minify JSON directly in your browser with this free, privacy-friendly tool.',
})

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)

const { copy, copied } = useClipboard()

function runFormat() {
  const result = formatJson(input.value)
  output.value = result.output
  error.value = result.error
}

function runMinify() {
  const result = minifyJson(input.value)
  output.value = result.output
  error.value = result.error
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = null
}

function download() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'output.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">JSON Formatter</h1>
      <p class="text-gray-500 text-sm">Format, validate, and minify JSON directly in your browser.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Input -->
      <div class="flex flex-col gap-2">
        <label for="json-input" class="text-sm font-medium text-gray-700">Input</label>
        <textarea
          id="json-input"
          v-model="input"
          placeholder='Paste your JSON here, e.g. {"name":"Alice"}'
          class="w-full h-72 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
          spellcheck="false"
        />
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors"
            @click="runFormat"
          >
            Format
          </button>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            @click="runMinify"
          >
            Minify
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
        <label for="json-output" class="text-sm font-medium text-gray-700">Output</label>
        <textarea
          id="json-output"
          :value="output"
          readonly
          placeholder="Formatted output will appear here"
          class="w-full h-72 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none"
          spellcheck="false"
        />

        <!-- Error -->
        <p
          v-if="error"
          role="alert"
          aria-live="polite"
          class="text-sm text-red-600"
        >
          {{ error }}
        </p>

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
      Your JSON is processed locally and never sent to a server.
    </p>
  </main>
</template>
