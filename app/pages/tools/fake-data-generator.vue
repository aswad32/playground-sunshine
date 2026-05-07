<script setup lang="ts">
import { RefreshCw, Copy, Trash2, Check } from 'lucide-vue-next'
import { generateFakeData, DATA_TYPE_LABELS, type DataType, type OutputFormat } from '~/utils/fakeData'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Fake Data Generator - Playground Sunshine',
  description:
    'Generate realistic fake data for names, emails, addresses, and more — directly in your browser with this free, privacy-friendly tool.',
})

const ALL_TYPES: DataType[] = [
  'name', 'email', 'phone', 'address', 'company',
  'uuid', 'date', 'lorem', 'number', 'url',
]

const selectedTypes = ref<DataType[]>(['name', 'email'])
const rows = ref(10)
const format = ref<OutputFormat>('json')
const output = ref('')
const error = ref<string | null>(null)

const { copy, copied } = useClipboard()

function toggleType(type: DataType) {
  const idx = selectedTypes.value.indexOf(type)
  if (idx === -1) {
    selectedTypes.value = [...selectedTypes.value, type]
  } else {
    selectedTypes.value = selectedTypes.value.filter((t) => t !== type)
  }
}

function isSelected(type: DataType): boolean {
  return selectedTypes.value.includes(type)
}

function generate() {
  const result = generateFakeData({
    types: selectedTypes.value,
    rows: rows.value,
    format: format.value,
  })
  output.value = result.output
  error.value = result.error
}

function clear() {
  output.value = ''
  error.value = null
}

function clampRows() {
  rows.value = Math.max(1, Math.min(100, rows.value || 1))
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Fake Data Generator</h1>
      <p class="mt-1 text-gray-500">Generate realistic mock data for prototypes, tests, and demos.</p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      All data is generated locally in your browser and never sent to a server.
    </div>

    <!-- Data type selector -->
    <div>
      <p class="text-sm font-medium text-gray-700 mb-2">Data Types</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in ALL_TYPES"
          :key="type"
          type="button"
          class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          :class="
            isSelected(type)
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
          "
          @click="toggleType(type)"
        >
          {{ DATA_TYPE_LABELS[type] }}
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap gap-4 items-end">
      <!-- Row count -->
      <div>
        <label for="row-count" class="block text-sm font-medium text-gray-700 mb-1">Rows (1–100)</label>
        <input
          id="row-count"
          v-model.number="rows"
          type="number"
          min="1"
          max="100"
          class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @blur="clampRows"
        />
      </div>

      <!-- Format toggle -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-1">Format</p>
        <div class="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            v-for="f in (['json', 'csv', 'list'] as OutputFormat[])"
            :key="f"
            type="button"
            class="px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
            :class="
              format === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            "
            @click="format = f"
          >
            {{ f.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Generate button -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="generate"
      >
        <RefreshCw class="w-4 h-4" />
        Generate
      </button>
    </div>

    <!-- Error -->
    <p
      v-if="error"
      role="alert"
      aria-live="polite"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ error }}
    </p>

    <!-- Output -->
    <div v-if="output">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-medium text-gray-700">Output</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            @click="copy(output)"
          >
            <Check v-if="copied" class="w-4 h-4 text-green-500" />
            <Copy v-else class="w-4 h-4" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            @click="clear"
          >
            <Trash2 class="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      <textarea
        readonly
        :value="output"
        aria-label="Generated data output"
        class="w-full h-80 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  </div>
</template>
