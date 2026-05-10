<script setup lang="ts">
import { Download, FolderOpen } from 'lucide-vue-next'
import { formatJson, minifyJson } from '~/utils/jsonFormatter'
import { useJq } from '~/composables/useJq'

useSeoMeta({
  title: 'JSON Formatter - Playground Sunshine',
  description: 'Format, validate, and minify JSON directly in your browser with this free, privacy-friendly tool.',
})

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const sortKeys = ref(false)
const showQuery = ref(false)
const jqExpr = ref('.')
const jqError = ref<string | null>(null)

const { copy, copied } = useClipboard()
const { run: runJq, loading: jqLoading } = useJq()

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    input.value = reader.result as string
    runFormat()
  }
  reader.onerror = () => {
    error.value = 'Could not read the file. Please try again.'
  }
  reader.readAsText(file)

  // Reset so the same file can be re-selected if needed
  ;(event.target as HTMLInputElement).value = ''
}

function runFormat() {
  const result = formatJson(input.value, { sortKeys: sortKeys.value })
  output.value = result.output
  error.value = result.error
  jqError.value = null
}

function runMinify() {
  const result = minifyJson(input.value, { sortKeys: sortKeys.value })
  output.value = result.output
  error.value = result.error
  jqError.value = null
}

async function runQuery() {
  if (!input.value.trim()) {
    jqError.value = 'Enter some JSON in the input area first.'
    return
  }
  jqError.value = null
  error.value = null
  try {
    output.value = await runJq(input.value, jqExpr.value)
  } catch (e) {
    jqError.value = e instanceof Error ? e.message : String(e)
    output.value = ''
  }
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = null
  jqError.value = null
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
        <div class="flex flex-wrap items-center gap-2">
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
            class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            @click="openFilePicker"
          >
            <FolderOpen :size="14" />
            Open File
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            aria-hidden="true"
            @change="onFileSelected"
          />
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            @click="clear"
          >
            Clear
          </button>
          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-600">
            <input
              v-model="sortKeys"
              type="checkbox"
              class="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
            />
            Sort Keys
          </label>
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

    <!-- jq Query section -->
    <div class="mt-6">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        @click="showQuery = !showQuery"
      >
        <span>jq Query</span>
        <span class="text-xs text-gray-400">{{ showQuery ? '▲' : '▼' }}</span>
      </button>

      <div v-if="showQuery" class="mt-3 rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3">
        <p class="text-xs text-gray-500">
          Filter or transform the input JSON using a
          <a href="https://jqlang.org" target="_blank" rel="noopener noreferrer" class="underline hover:text-gray-700">jq expression</a>.
          The result appears in the Output area.
        </p>
        <div class="flex gap-2 items-center">
          <label for="jq-expr" class="sr-only">jq expression</label>
          <input
            id="jq-expr"
            v-model="jqExpr"
            type="text"
            placeholder=". (identity)"
            spellcheck="false"
            class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
            @keydown.enter="runQuery"
          />
          <button
            type="button"
            :disabled="jqLoading"
            class="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="runQuery"
          >
            {{ jqLoading ? 'Running…' : 'Run' }}
          </button>
        </div>
        <p
          v-if="jqError"
          role="alert"
          aria-live="polite"
          class="text-sm text-red-600"
        >
          {{ jqError }}
        </p>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400">
      Your JSON is processed locally and never sent to a server. jq queries run entirely in your browser using WebAssembly.
    </p>
  </main>
</template>
