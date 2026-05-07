<script setup lang="ts">
import { Download, Trash2, Copy, Check } from 'lucide-vue-next'
import { generateQRCode } from '~/utils/qrCode'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'QR Code Generator - Playground Sunshine',
  description:
    'Turn any text or URL into a QR code instantly. Download as PNG — runs entirely in your browser, no server involved.',
})

const input = ref('')
const qrDataUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const isGenerating = ref(false)

const { copy, copied } = useClipboard()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function generate() {
  if (debounceTimer) clearTimeout(debounceTimer)
  isGenerating.value = true
  const result = await generateQRCode(input.value)
  qrDataUrl.value = result.dataUrl
  error.value = result.error
  isGenerating.value = false
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(generate, 300)
}

function clear() {
  input.value = ''
  qrDataUrl.value = null
  error.value = null
  if (debounceTimer) clearTimeout(debounceTimer)
}

function download() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = 'qr-code.png'
  a.click()
}
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">QR Code Generator</h1>
      <p class="mt-1 text-gray-500">Turn any text or URL into a scannable QR code.</p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      Your input is processed locally and never sent to a server.
    </div>

    <!-- Input -->
    <div>
      <label for="qr-input" class="block text-sm font-medium text-gray-700 mb-1">Text or URL</label>
      <textarea
        id="qr-input"
        v-model="input"
        rows="4"
        placeholder="Enter text or a URL to generate a QR code..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @input="onInput"
      />
    </div>

    <!-- Actions row -->
    <div class="flex gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
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

    <!-- Empty state -->
    <div
      v-else-if="!qrDataUrl && !isGenerating"
      class="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm"
    >
      Enter text or a URL above to generate a QR code.
    </div>

    <!-- QR Code output -->
    <div v-else-if="qrDataUrl" class="flex flex-col items-center gap-4">
      <img
        :src="qrDataUrl"
        alt="Generated QR code"
        class="w-64 h-64 rounded-xl border border-gray-200 shadow-sm"
      />
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="download"
        >
          <Download class="w-4 h-4" />
          Download PNG
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="copy(input)"
        >
          <Check v-if="copied" class="w-4 h-4 text-green-500" />
          <Copy v-else class="w-4 h-4" />
          {{ copied ? 'Copied!' : 'Copy input' }}
        </button>
      </div>
    </div>
  </div>
</template>
