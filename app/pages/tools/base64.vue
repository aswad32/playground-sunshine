<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, RotateCcw, Check } from 'lucide-vue-next'
import { encodeBase64, decodeBase64 } from '~/utils/base64'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Base64 Encoder / Decoder - Playground Sunshine',
  description:
    'Encode text to Base64 or decode Base64 back to plain text directly in your browser with this free, privacy-friendly tool.',
})

const input = ref('')
const mode = ref<'encode' | 'decode'>('encode')
const { copy, copied } = useClipboard()

const result = computed(() => {
  if (!input.value) return { output: '', error: null }
  return mode.value === 'encode' ? encodeBase64(input.value) : decodeBase64(input.value)
})

function clearAll() {
  input.value = ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Base64 Encoder / Decoder</h1>
      <p class="mt-1 text-gray-500">Encode text to Base64 or decode Base64 back to plain text.</p>
    </div>

    <!-- Mode toggle -->
    <div class="flex gap-2">
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'encode'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'encode'"
      >
        Encode
      </button>
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'decode'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'decode'"
      >
        Decode
      </button>
    </div>

    <!-- Input -->
    <div class="space-y-1">
      <label for="b64-input" class="block text-sm font-medium text-gray-700">
        {{ mode === 'encode' ? 'Plain Text' : 'Base64 String' }}
      </label>
      <textarea
        id="b64-input"
        v-model="input"
        rows="5"
        :placeholder="mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 to decode...'"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      />
      <div class="flex justify-end">
        <button
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          @click="clearAll"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
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
    <div v-if="result.output" class="space-y-1">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-gray-700">
          {{ mode === 'encode' ? 'Base64 Output' : 'Decoded Text' }}
        </label>
        <button
          class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          @click="copy(result.output)"
        >
          <Check v-if="copied" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <textarea
        readonly
        :value="result.output"
        rows="5"
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-900 resize-y"
      />
    </div>

    <!-- Privacy note -->
    <p class="text-xs text-gray-400">
      Your input is processed locally and never sent to a server.
    </p>
  </div>
</template>
