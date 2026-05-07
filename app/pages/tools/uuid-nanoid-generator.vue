<script setup lang="ts">
import { ref, computed } from 'vue'
import { Shuffle, Copy, RotateCcw, Check } from 'lucide-vue-next'
import { generateUUIDs, generateNanoIDs } from '~/utils/uuidNanoid'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'UUID / NanoID Generator - Playground Sunshine',
  description:
    'Generate UUID v4 and NanoID values instantly in your browser with this free, privacy-friendly tool.',
})

const mode = ref<'uuid' | 'nanoid'>('uuid')
const quantity = ref(5)
const nanoidAlphabet = ref('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
const nanoidLength = ref(21)
const result = ref<{ ids: string[]; error: string | null }>({ ids: [], error: null })
const { copy, copied } = useClipboard()

const clampedQuantity = computed(() => Math.max(1, Math.min(100, quantity.value || 1)))

function generate() {
  if (mode.value === 'uuid') {
    result.value = generateUUIDs(clampedQuantity.value)
  } else {
    result.value = generateNanoIDs(clampedQuantity.value, nanoidAlphabet.value, nanoidLength.value)
  }
}

function clearAll() {
  result.value = { ids: [], error: null }
}

const outputText = computed(() => result.value.ids.join('\n'))

// Generate some on load
generate()
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">UUID / NanoID Generator</h1>
      <p class="mt-1 text-gray-500">Generate unique IDs for use in development and testing.</p>
    </div>

    <!-- Mode toggle -->
    <div class="flex gap-2">
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'uuid'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'uuid'; generate()"
      >
        UUID v4
      </button>
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'nanoid'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'nanoid'; generate()"
      >
        NanoID
      </button>
    </div>

    <!-- Options -->
    <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <!-- Quantity -->
      <div class="flex items-center gap-4">
        <label for="quantity" class="text-sm font-medium text-gray-700 w-28">Quantity</label>
        <input
          id="quantity"
          v-model.number="quantity"
          type="number"
          min="1"
          max="100"
          class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span class="text-xs text-gray-400">1 – 100</span>
      </div>

      <!-- NanoID-specific options -->
      <template v-if="mode === 'nanoid'">
        <div class="flex items-center gap-4">
          <label for="nanoid-length" class="text-sm font-medium text-gray-700 w-28">Length</label>
          <input
            id="nanoid-length"
            v-model.number="nanoidLength"
            type="number"
            min="1"
            max="256"
            class="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-start gap-4">
          <label for="nanoid-alphabet" class="text-sm font-medium text-gray-700 w-28 pt-1.5">
            Alphabet
          </label>
          <input
            id="nanoid-alphabet"
            v-model="nanoidAlphabet"
            type="text"
            class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </template>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        @click="generate"
      >
        <Shuffle class="w-4 h-4" />
        Generate
      </button>
      <button
        v-if="result.ids.length"
        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        @click="clearAll"
      >
        <RotateCcw class="w-4 h-4" />
        Clear
      </button>
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

    <!-- Output -->
    <div v-if="result.ids.length" class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">
          {{ result.ids.length }} {{ result.ids.length === 1 ? 'ID' : 'IDs' }} generated
        </span>
        <button
          class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          @click="copy(outputText)"
        >
          <Check v-if="copied" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copied ? 'Copied!' : 'Copy all' }}
        </button>
      </div>
      <textarea
        readonly
        :value="outputText"
        :rows="Math.min(result.ids.length, 15)"
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-900 resize-y"
      />
    </div>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">IDs are generated locally in your browser. Nothing is sent to a server.</p>
  </div>
</template>
