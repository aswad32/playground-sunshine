<template>
  <div class="max-w-4xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">CSV ↔ JSON Converter</h1>
      <p class="mt-2 text-gray-600">
        Convert CSV to JSON or JSON to CSV directly in your browser. Handles quoted fields, commas
        inside values, and complex structures.
      </p>
    </div>

    <!-- Direction toggle -->
    <div class="flex items-center gap-2">
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          direction === 'csv-to-json'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',
        ]"
        @click="direction = 'csv-to-json'"
      >
        CSV → JSON
      </button>
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          direction === 'json-to-csv'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',
        ]"
        @click="direction = 'json-to-csv'"
      >
        JSON → CSV
      </button>
    </div>

    <!-- Input / Output columns -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Input -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="input" class="text-sm font-medium text-gray-700">
            {{ direction === 'csv-to-json' ? 'CSV Input' : 'JSON Input' }}
          </label>
          <button
            v-if="input"
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            @click="clear"
          >
            Clear
          </button>
        </div>
        <textarea
          id="input"
          v-model="input"
          rows="16"
          :placeholder="inputPlaceholder"
          class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
        />
      </div>

      <!-- Output -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">
            {{ direction === 'csv-to-json' ? 'JSON Output' : 'CSV Output' }}
          </label>
          <div class="flex gap-3">
            <button
              v-if="result.output"
              class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              @click="copyOutput"
            >
              <span v-if="copied">Copied!</span>
              <span v-else>Copy</span>
            </button>
            <button
              v-if="result.output"
              class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              @click="download"
            >
              Download
            </button>
          </div>
        </div>
        <div
          v-if="result.error"
          class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          {{ result.error }}
        </div>
        <textarea
          v-else
          :value="result.output"
          rows="16"
          readonly
          :placeholder="outputPlaceholder"
          class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-700 placeholder-gray-400 outline-none resize-y"
        />
      </div>
    </div>

    <!-- Convert button -->
    <div class="flex gap-3">
      <button
        class="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!input.trim()"
        @click="runConvert"
      >
        Convert
      </button>
    </div>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">
      Your data is processed locally in your browser and never sent to a server.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { convert, type ConversionDirection, type ConversionResult } from '~/utils/csvJsonConverter'

useSeoMeta({
  title: 'CSV ↔ JSON Converter - Playground Sunshine',
  description:
    'Convert CSV to JSON or JSON to CSV directly in your browser — free, private, handles quoted fields and complex values.',
})

const direction = ref<ConversionDirection>('csv-to-json')
const input = ref('')
const result = ref<ConversionResult>({ output: '', error: null })
const copied = ref(false)

const inputPlaceholder = computed(() =>
  direction.value === 'csv-to-json'
    ? 'name,age,city\nAlice,30,London\nBob,25,Paris'
    : '[{"name":"Alice","age":30},{"name":"Bob","age":25}]',
)

const outputPlaceholder = computed(() =>
  direction.value === 'csv-to-json' ? 'JSON output will appear here…' : 'CSV output will appear here…',
)

function runConvert() {
  result.value = convert(input.value, direction.value)
}

function clear() {
  input.value = ''
  result.value = { output: '', error: null }
}

async function copyOutput() {
  if (!result.value.output) return
  await navigator.clipboard.writeText(result.value.output)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function download() {
  if (!result.value.output) return
  const ext = direction.value === 'csv-to-json' ? 'json' : 'csv'
  const mime = direction.value === 'csv-to-json' ? 'application/json' : 'text/csv'
  const blob = new Blob([result.value.output], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
