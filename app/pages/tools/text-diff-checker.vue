<script setup lang="ts">
import { ArrowLeftRight, Copy, Check, Trash2 } from 'lucide-vue-next'
import { computeDiff, diffToText, type DiffResult } from '~/utils/textDiff'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Text Diff Checker - Playground Sunshine',
  description:
    'Compare two blocks of text and see the differences highlighted line by line. Works with code, JSON, SQL, Markdown, or any plain text — runs entirely in your browser.',
})

const original = ref('')
const modified = ref('')

const { copy, copied } = useClipboard()

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const result = ref<DiffResult | null>(null)

function runDiff() {
  if (!original.value && !modified.value) {
    result.value = null
    return
  }
  result.value = computeDiff(original.value, modified.value)
}

function runDiffDebounced() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runDiff, 300)
}

watch([original, modified], runDiffDebounced)

function swap() {
  const tmp = original.value
  original.value = modified.value
  modified.value = tmp
}

function clear() {
  original.value = ''
  modified.value = ''
  result.value = null
  if (debounceTimer) clearTimeout(debounceTimer)
}

const diffText = computed(() => (result.value ? diffToText(result.value) : ''))
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Text Diff Checker</h1>
      <p class="mt-1 text-gray-500">
        Compare two blocks of text and see the differences highlighted line by line. Works with code, JSON, SQL,
        Markdown, or any plain text.
      </p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      Your text is compared locally and never sent to a server.
    </div>

    <!-- Input panes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Original -->
      <div class="flex flex-col">
        <label for="diff-original" class="block text-sm font-medium text-gray-700 mb-1">Original</label>
        <textarea
          id="diff-original"
          v-model="original"
          class="flex-1 min-h-56 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          placeholder="Paste the original text here..."
          spellcheck="false"
        />
      </div>

      <!-- Modified -->
      <div class="flex flex-col">
        <label for="diff-modified" class="block text-sm font-medium text-gray-700 mb-1">Modified</label>
        <textarea
          id="diff-modified"
          v-model="modified"
          class="flex-1 min-h-56 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          placeholder="Paste the modified text here..."
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Action bar -->
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="swap"
      >
        <ArrowLeftRight class="w-4 h-4" />
        Swap
      </button>
      <button
        type="button"
        :disabled="!result || result.identical"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="copy(diffText)"
      >
        <Check v-if="copied" class="w-4 h-4 text-green-500" />
        <Copy v-else class="w-4 h-4" />
        {{ copied ? 'Copied!' : 'Copy Diff' }}
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

    <!-- Diff output -->
    <div v-if="result" class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <!-- Summary bar -->
      <div class="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50 text-sm">
        <template v-if="result.identical">
          <span class="text-gray-500">No differences found — the two texts are identical.</span>
        </template>
        <template v-else>
          <span class="font-medium text-green-700">+{{ result.additions }} addition{{ result.additions !== 1 ? 's' : '' }}</span>
          <span class="text-gray-300">|</span>
          <span class="font-medium text-red-600">−{{ result.removals }} removal{{ result.removals !== 1 ? 's' : '' }}</span>
        </template>
      </div>

      <!-- Line-by-line diff -->
      <div class="overflow-x-auto">
        <div
          v-for="(line, index) in result.lines"
          :key="index"
          class="flex font-mono text-sm"
          :class="{
            'bg-green-50': line.type === 'added',
            'bg-red-50': line.type === 'removed',
          }"
        >
          <!-- Gutter -->
          <span
            class="shrink-0 w-10 text-right pr-3 py-0.5 text-xs select-none border-r"
            :class="{
              'text-green-400 border-green-200 bg-green-100': line.type === 'added',
              'text-red-400 border-red-200 bg-red-100': line.type === 'removed',
              'text-gray-300 border-gray-100': line.type === 'unchanged',
            }"
          >
            <template v-if="line.type !== 'added'">{{ line.lineNumber }}</template>
          </span>

          <!-- Prefix -->
          <span
            class="shrink-0 w-6 text-center py-0.5 select-none font-bold"
            :class="{
              'text-green-600': line.type === 'added',
              'text-red-500': line.type === 'removed',
              'text-transparent': line.type === 'unchanged',
            }"
          >
            {{ line.type === 'added' ? '+' : line.type === 'removed' ? '−' : '·' }}
          </span>

          <!-- Content -->
          <span
            class="flex-1 py-0.5 px-2 whitespace-pre"
            :class="{
              'text-green-900': line.type === 'added',
              'text-red-900': line.type === 'removed',
              'text-gray-600': line.type === 'unchanged',
            }"
          >{{ line.value }}</span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
      <p class="text-sm">Paste text into both fields above to see the diff.</p>
    </div>
  </div>
</template>
