<script setup lang="ts">
import { Copy, Check, Trash2, WandSparkles } from 'lucide-vue-next'
import { formatSql, DIALECT_LABELS, type SqlDialect } from '~/utils/sqlFormatter'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'SQL Formatter - Playground Sunshine',
  description:
    'Format and beautify SQL queries with consistent indentation and keyword casing. Supports MySQL, PostgreSQL, SQLite, T-SQL — runs entirely in your browser.',
})

const DIALECTS = Object.keys(DIALECT_LABELS) as SqlDialect[]

const input = ref('')
const output = ref('')
const error = ref<string | null>(null)
const dialect = ref<SqlDialect>('sql')

const { copy, copied } = useClipboard()

function format() {
  const result = formatSql(input.value, dialect.value)
  output.value = result.output
  error.value = result.error
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = null
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">SQL Formatter</h1>
      <p class="mt-1 text-gray-500">
        Beautify SQL queries with consistent indentation and keyword casing.
      </p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      Your SQL is processed locally and never sent to a server.
    </div>

    <!-- Input -->
    <div>
      <label for="sql-input" class="block text-sm font-medium text-gray-700 mb-1">SQL Input</label>
      <textarea
        id="sql-input"
        v-model="input"
        rows="10"
        placeholder="Paste your SQL query here..."
        spellcheck="false"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap items-end gap-4">
      <!-- Dialect select -->
      <div>
        <label for="dialect" class="block text-sm font-medium text-gray-700 mb-1">Dialect</label>
        <select
          id="dialect"
          v-model="dialect"
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option v-for="d in DIALECTS" :key="d" :value="d">{{ DIALECT_LABELS[d] }}</option>
        </select>
      </div>

      <!-- Format button -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="format"
      >
        <WandSparkles class="w-4 h-4" />
        Format
      </button>

      <!-- Clear button -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="clear"
      >
        <Trash2 class="w-4 h-4" />
        Clear
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
        <span class="text-sm font-medium text-gray-700">Formatted SQL</span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="copy(output)"
        >
          <Check v-if="copied" class="w-4 h-4 text-green-500" />
          <Copy v-else class="w-4 h-4" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <textarea
        readonly
        :value="output"
        aria-label="Formatted SQL output"
        class="w-full h-72 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  </div>
</template>
