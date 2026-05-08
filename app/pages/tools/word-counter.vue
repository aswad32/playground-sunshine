<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Word &amp; Character Counter</h1>
      <p class="mt-2 text-gray-600">
        Instantly count words, characters, sentences, paragraphs, and reading time as you type.
      </p>
    </div>

    <!-- Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="input" class="text-sm font-medium text-gray-700">Text</label>
        <div class="flex gap-3">
          <button
            v-if="input"
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            @click="copyText"
          >
            <span v-if="copied">Copied!</span>
            <span v-else>Copy</span>
          </button>
          <button
            v-if="input"
            class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            @click="clear"
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        id="input"
        v-model="input"
        rows="10"
        placeholder="Paste or type your text here…"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
      />
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <StatCard label="Words" :value="stats.words" />
      <StatCard label="Characters" description="with spaces" :value="stats.charsWithSpaces" />
      <StatCard label="Characters" description="without spaces" :value="stats.charsWithoutSpaces" />
      <StatCard label="Sentences" :value="stats.sentences" />
      <StatCard label="Paragraphs" :value="stats.paragraphs" />
      <StatCard
        label="Reading Time"
        :value="readingTimeLabel"
        :is-text="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { countText } from '~/utils/wordCounter'
import StatCard from '~/components/tools/WordCounterStatCard.vue'

useSeoMeta({
  title: 'Word & Character Counter - Playground Sunshine',
  description:
    'Count words, characters, sentences, paragraphs, and reading time for any text — free, instant, runs entirely in your browser.',
})

const input = ref('')
const debouncedInput = ref('')
const copied = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(input, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { debouncedInput.value = val }, 150)
})

const stats = computed(() => countText(debouncedInput.value))

const readingTimeLabel = computed(() => {
  const min = stats.value.readingTimeMin
  if (min === 0) return '0 min'
  if (min < 1) return '< 1 min'
  return `${min} min`
})

function clear() {
  input.value = ''
  debouncedInput.value = ''
}

async function copyText() {
  if (!input.value) return
  await navigator.clipboard.writeText(input.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>
