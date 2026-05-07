<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, RotateCcw, Check } from 'lucide-vue-next'
import { testRegex } from '~/utils/regexTester'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Regex Tester - Playground Sunshine',
  description:
    'Test regular expressions against sample text and visualise matches directly in your browser.',
})

const pattern = ref('')
const flagG = ref(true)
const flagI = ref(false)
const flagM = ref(false)
const testInput = ref('')
const { copy, copied } = useClipboard()

const flags = computed(() => `${flagG.value ? 'g' : ''}${flagI.value ? 'i' : ''}${flagM.value ? 'm' : ''}`)

const result = computed(() => testRegex(pattern.value, flags.value, testInput.value))

const regexDisplay = computed(() => `/${pattern.value || '...'}/${flags.value}`)

function clearAll() {
  pattern.value = ''
  testInput.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Regex Tester</h1>
      <p class="mt-1 text-gray-500">
        Test regular expressions against sample text and visualise matches.
      </p>
    </div>

    <!-- Pattern + flags -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div class="space-y-1">
        <label for="pattern" class="block text-sm font-medium text-gray-700">Pattern</label>
        <div class="flex items-center gap-2">
          <span class="text-gray-400 font-mono text-sm select-none">/</span>
          <input
            id="pattern"
            v-model="pattern"
            type="text"
            placeholder="e.g. \d+"
            class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span class="text-gray-400 font-mono text-sm select-none">/</span>
          <span class="font-mono text-sm text-indigo-600 w-8">{{ flags }}</span>
          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            :aria-label="copied ? 'Copied' : 'Copy regex'"
            @click="copy(regexDisplay)"
          >
            <Check v-if="copied" class="w-4 h-4" />
            <Copy v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Flags -->
      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="flagG" type="checkbox" class="rounded" />
          <span class="font-mono">g</span> — global
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="flagI" type="checkbox" class="rounded" />
          <span class="font-mono">i</span> — case-insensitive
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input v-model="flagM" type="checkbox" class="rounded" />
          <span class="font-mono">m</span> — multiline
        </label>
      </div>
    </div>

    <!-- Test input -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <label for="test-input" class="block text-sm font-medium text-gray-700">Test String</label>
        <button
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          @click="clearAll"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
      <textarea
        id="test-input"
        v-model="testInput"
        rows="5"
        placeholder="Enter text to test against your pattern..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      />
    </div>

    <!-- Error -->
    <p
      v-if="result.error"
      role="alert"
      aria-live="polite"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ result.error }}
    </p>

    <!-- Results -->
    <template v-if="!result.error && pattern && testInput">
      <!-- Highlighted output -->
      <div class="space-y-1">
        <p class="text-sm font-medium text-gray-700">
          Highlighted Matches
          <span class="ml-2 text-xs font-normal text-gray-400">
            {{ result.matches.length }} {{ result.matches.length === 1 ? 'match' : 'matches' }}
          </span>
        </p>
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono text-gray-900 whitespace-pre-wrap break-all min-h-[3rem]"
          aria-live="polite"
        >
          <template v-if="result.matches.length === 0">
            <span class="text-gray-400">No matches found.</span>
          </template>
          <template v-else>
            <span
              v-for="(seg, i) in result.segments"
              :key="i"
              :class="seg.matched ? 'bg-yellow-200 text-yellow-900 rounded px-0.5' : ''"
            >{{ seg.text }}</span>
          </template>
        </div>
      </div>

      <!-- Match list -->
      <div v-if="result.matches.length" class="space-y-2">
        <p class="text-sm font-medium text-gray-700">Match Details</p>
        <ul class="space-y-2">
          <li
            v-for="(match, i) in result.matches"
            :key="i"
            class="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm space-y-1"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5">
                #{{ i + 1 }}
              </span>
              <span class="font-mono text-gray-900">"{{ match.value }}"</span>
              <span class="text-xs text-gray-400">index {{ match.index }}, length {{ match.length }}</span>
            </div>
            <div v-if="match.numberedGroups.filter(Boolean).length" class="pl-8 text-xs text-gray-500 space-y-0.5">
              <div
                v-for="(g, gi) in match.numberedGroups"
                :key="gi"
              >
                Group {{ gi + 1 }}: <span class="font-mono text-gray-700">{{ g ?? 'undefined' }}</span>
              </div>
            </div>
            <div v-if="Object.keys(match.namedGroups).length" class="pl-8 text-xs text-gray-500 space-y-0.5">
              <div
                v-for="(val, name) in match.namedGroups"
                :key="name"
              >
                <span class="font-mono text-indigo-600">{{ name }}</span>: <span class="font-mono text-gray-700">{{ val }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">All processing runs locally in your browser.</p>
  </div>
</template>
