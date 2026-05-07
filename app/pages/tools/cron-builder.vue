<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Copy, RotateCcw, Check } from 'lucide-vue-next'
import { explainCron, getNextRuns } from '~/utils/cronBuilder'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Cron Expression Builder - Playground Sunshine',
  description:
    'Build and validate cron expressions with a visual UI, get a human-readable explanation, and preview the next run times.',
})

const fields = reactive({ min: '*', hour: '*', dom: '*', month: '*', dow: '*' })

const rawExpression = computed({
  get: () => `${fields.min} ${fields.hour} ${fields.dom} ${fields.month} ${fields.dow}`,
  set: (val: string) => {
    const parts = val.trim().split(/\s+/)
    if (parts.length === 5) {
      ;[fields.min, fields.hour, fields.dom, fields.month, fields.dow] = parts
    }
  },
})

const { copy, copied } = useClipboard()

const explanation = computed(() => explainCron(rawExpression.value))
const nextRuns = computed(() => getNextRuns(rawExpression.value, 5))
const is6Field = computed(() => rawExpression.value.trim().split(/\s+/).length === 6)

function clearAll() {
  fields.min = '*'
  fields.hour = '*'
  fields.dom = '*'
  fields.month = '*'
  fields.dow = '*'
}

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at 8am', value: '0 8 * * *' },
  { label: 'Every Monday at 8am', value: '0 8 * * 1' },
  { label: 'Every weekday at 9am', value: '0 9 * * 1-5' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: '1st of every month', value: '0 0 1 * *' },
]

function applyPreset(value: string) {
  rawExpression.value = value
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Cron Expression Builder</h1>
      <p class="mt-1 text-gray-500">
        Build, validate, and understand cron expressions with a live explanation and run preview.
      </p>
    </div>

    <!-- Presets -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in PRESETS"
        :key="preset.value"
        class="px-3 py-1.5 text-xs rounded-full border border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
        @click="applyPreset(preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Raw expression input -->
    <div class="space-y-1">
      <label for="raw-expr" class="block text-sm font-medium text-gray-700">Cron Expression</label>
      <div class="flex gap-2">
        <input
          id="raw-expr"
          :value="rawExpression"
          type="text"
          placeholder="* * * * *"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @input="rawExpression = ($event.target as HTMLInputElement).value"
        />
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          @click="copy(rawExpression)"
        >
          <Check v-if="copied" class="w-4 h-4" />
          <Copy v-else class="w-4 h-4" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          @click="clearAll"
        >
          <RotateCcw class="w-4 h-4" />
          Clear
        </button>
      </div>
      <p class="text-xs text-gray-400">
        Format: <span class="font-mono">minute hour day-of-month month day-of-week</span>
      </p>
      <p v-if="is6Field" class="text-xs text-amber-600">
        6-field expressions (with a seconds field) are not supported. Use 5 fields only.
      </p>
    </div>

    <!-- Visual builder -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <p class="text-sm font-medium text-gray-700 mb-3">Visual Builder</p>
      <div class="grid grid-cols-5 gap-3">
        <div v-for="[key, label] in [['min','Minute'],['hour','Hour'],['dom','Day'],['month','Month'],['dow','Weekday']]" :key="key">
          <label :for="`field-${key}`" class="block text-xs text-gray-500 mb-1">{{ label }}</label>
          <input
            :id="`field-${key}`"
            v-model="(fields as Record<string, string>)[key]"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-mono text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Error -->
    <p
      v-if="explanation.error"
      role="alert"
      aria-live="polite"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ explanation.error }}
    </p>

    <!-- Explanation -->
    <div v-if="explanation.explanation" class="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
      <p class="text-sm text-gray-500 mb-0.5">Explanation</p>
      <p class="text-base font-medium text-indigo-900">{{ explanation.explanation }}</p>
    </div>

    <!-- Next runs -->
    <div v-if="nextRuns.runs.length" class="space-y-2">
      <p class="text-sm font-medium text-gray-700">Next 5 Run Times</p>
      <ul class="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <li
          v-for="(run, i) in nextRuns.runs"
          :key="i"
          class="px-4 py-2.5 text-sm font-mono text-gray-800"
        >
          {{ run.toLocaleString() }}
        </li>
      </ul>
    </div>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">All processing runs locally in your browser.</p>
  </div>
</template>
