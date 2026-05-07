<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, Copy, RotateCcw, Check } from 'lucide-vue-next'
import { timestampToDate, dateToTimestamp } from '~/utils/unixTimestamp'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Unix Timestamp Converter - Playground Sunshine',
  description:
    'Convert Unix timestamps to human-readable dates and vice versa directly in your browser.',
})

// Timestamp → Date
const tsInput = ref('')
const tsUnit = ref<'seconds' | 'milliseconds'>('seconds')
const { copy: copyTs, copied: copiedTs } = useClipboard()

const tsResult = computed(() => timestampToDate(tsInput.value, tsUnit.value))

function useNow() {
  tsInput.value = tsUnit.value === 'seconds'
    ? String(Math.floor(Date.now() / 1000))
    : String(Date.now())
}

function clearTs() {
  tsInput.value = ''
}

// Date → Timestamp
const dateInput = ref('')
const { copy: copyDate, copied: copiedDate } = useClipboard()

const dateResult = computed(() => dateToTimestamp(dateInput.value))

function clearDate() {
  dateInput.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Unix Timestamp Converter</h1>
      <p class="mt-1 text-gray-500">
        Convert Unix timestamps to human-readable dates and vice versa.
      </p>
    </div>

    <!-- Section 1: Timestamp → Date -->
    <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h2 class="text-base font-semibold text-gray-800">Timestamp → Date</h2>

      <div class="flex gap-2 flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <input
            id="ts-input"
            v-model="tsInput"
            type="number"
            placeholder="e.g. 1700000000"
            class="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex gap-1.5">
          <button
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
              tsUnit === 'seconds'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50',
            ]"
            @click="tsUnit = 'seconds'"
          >
            s
          </button>
          <button
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
              tsUnit === 'milliseconds'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50',
            ]"
            @click="tsUnit = 'milliseconds'"
          >
            ms
          </button>
        </div>
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="useNow"
        >
          <Clock class="w-4 h-4" />
          Now
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="clearTs"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <p
        v-if="tsResult.error"
        role="alert"
        aria-live="polite"
        class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
      >
        {{ tsResult.error }}
      </p>

      <div v-if="tsResult.utc" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Result</span>
          <button
            class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            @click="copyTs(`UTC: ${tsResult.utc}\nLocal: ${tsResult.local}`)"
          >
            <Check v-if="copiedTs" class="w-3.5 h-3.5" />
            <Copy v-else class="w-3.5 h-3.5" />
            {{ copiedTs ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1 font-mono text-sm text-gray-900">
          <div><span class="text-gray-500">UTC &nbsp;&nbsp;</span>{{ tsResult.utc }}</div>
          <div><span class="text-gray-500">Local </span>{{ tsResult.local }}</div>
        </div>
      </div>
    </div>

    <!-- Section 2: Date → Timestamp -->
    <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h2 class="text-base font-semibold text-gray-800">Date → Timestamp</h2>

      <div class="flex gap-2 flex-wrap">
        <input
          id="date-input"
          v-model="dateInput"
          type="datetime-local"
          class="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          @click="clearDate"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <p
        v-if="dateResult.error"
        role="alert"
        aria-live="polite"
        class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
      >
        {{ dateResult.error }}
      </p>

      <div v-if="!dateResult.error && dateInput" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Result</span>
          <button
            class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            @click="copyDate(`Seconds: ${dateResult.seconds}\nMilliseconds: ${dateResult.milliseconds}`)"
          >
            <Check v-if="copiedDate" class="w-3.5 h-3.5" />
            <Copy v-else class="w-3.5 h-3.5" />
            {{ copiedDate ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1 font-mono text-sm text-gray-900">
          <div><span class="text-gray-500">Seconds &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>{{ dateResult.seconds }}</div>
          <div><span class="text-gray-500">Milliseconds </span>{{ dateResult.milliseconds }}</div>
        </div>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">All conversions run locally in your browser. Nothing is sent to a server.</p>
  </div>
</template>
