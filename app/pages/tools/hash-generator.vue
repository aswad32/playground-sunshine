<script setup lang="ts">
import { ref, watch } from 'vue'
import { Upload, Copy, RotateCcw, Check, AlertTriangle } from 'lucide-vue-next'
import { hashText, hashFile, type HashAlgorithm } from '~/utils/hashGenerator'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Hash Generator - Playground Sunshine',
  description:
    'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files directly in your browser.',
})

const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']
const WEAK_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1']

const algorithm = ref<HashAlgorithm>('SHA-256')
const mode = ref<'text' | 'file'>('text')
const textInput = ref('')
const uploadedFile = ref<File | null>(null)
const hash = ref('')
const error = ref<string | null>(null)
const isComputing = ref(false)
const { copy, copied } = useClipboard()

async function compute() {
  if (mode.value === 'text') {
    if (!textInput.value) {
      error.value = 'Please enter some text or upload a file.'
      hash.value = ''
      return
    }
    isComputing.value = true
    const result = await hashText(textInput.value, algorithm.value)
    hash.value = result.hash
    error.value = result.error
  } else {
    if (!uploadedFile.value) {
      error.value = 'Please enter some text or upload a file.'
      hash.value = ''
      return
    }
    isComputing.value = true
    const result = await hashFile(uploadedFile.value, algorithm.value)
    hash.value = result.hash
    error.value = result.error
  }
  isComputing.value = false
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  uploadedFile.value = input.files?.[0] ?? null
  hash.value = ''
  error.value = null
}

function clearAll() {
  textInput.value = ''
  uploadedFile.value = null
  hash.value = ''
  error.value = null
}

// Auto-compute when text changes
watch([textInput, algorithm], () => {
  if (mode.value === 'text' && textInput.value) {
    compute()
  } else if (!textInput.value) {
    hash.value = ''
    error.value = null
  }
})

watch(mode, () => {
  hash.value = ''
  error.value = null
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Hash Generator</h1>
      <p class="mt-1 text-gray-500">
        Generate cryptographic hashes from text or files in your browser.
      </p>
    </div>

    <!-- Privacy note -->
    <div class="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
      <span>Your text and files are processed locally and never sent to a server.</span>
    </div>

    <!-- Algorithm selector -->
    <div class="space-y-1">
      <p class="text-sm font-medium text-gray-700">Algorithm</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="algo in ALGORITHMS"
          :key="algo"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
            algorithm === algo
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
          ]"
          @click="algorithm = algo"
        >
          {{ algo }}
        </button>
      </div>

      <!-- Weak algorithm warning -->
      <div
        v-if="WEAK_ALGORITHMS.includes(algorithm)"
        class="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800"
      >
        <AlertTriangle class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{{ algorithm }} is not suitable for password hashing or security-critical use. Use SHA-256 or SHA-512 for sensitive data.</span>
      </div>
    </div>

    <!-- Mode toggle -->
    <div class="flex gap-2">
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'text'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'text'"
      >
        Text
      </button>
      <button
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
          mode === 'file'
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="mode = 'file'"
      >
        File
      </button>
    </div>

    <!-- Text input -->
    <div v-if="mode === 'text'" class="space-y-1">
      <label for="hash-input" class="block text-sm font-medium text-gray-700">Input Text</label>
      <textarea
        id="hash-input"
        v-model="textInput"
        rows="4"
        placeholder="Enter text to hash..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      />
    </div>

    <!-- File input -->
    <div v-else class="space-y-1">
      <label for="hash-file" class="block text-sm font-medium text-gray-700">Upload File</label>
      <label
        for="hash-file"
        class="flex flex-col items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 cursor-pointer hover:border-indigo-400 transition-colors"
      >
        <Upload class="w-6 h-6 text-gray-400" />
        <span class="text-sm text-gray-500">
          {{ uploadedFile ? uploadedFile.name : 'Click to choose a file' }}
        </span>
        <span v-if="uploadedFile" class="text-xs text-gray-400">
          {{ (uploadedFile.size / 1024).toFixed(1) }} KB
        </span>
        <input id="hash-file" type="file" class="sr-only" @change="onFileChange" />
      </label>
      <button
        v-if="uploadedFile"
        class="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        :disabled="isComputing"
        @click="compute"
      >
        {{ isComputing ? 'Hashing...' : 'Generate Hash' }}
      </button>
    </div>

    <!-- Actions (text mode) -->
    <div v-if="mode === 'text'" class="flex justify-end">
      <button
        class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        @click="clearAll"
      >
        <RotateCcw class="w-3.5 h-3.5" />
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

    <!-- Hash output -->
    <div v-if="hash" class="space-y-1">
      <div class="flex items-center justify-between">
        <label class="block text-sm font-medium text-gray-700">
          {{ algorithm }} Hash
        </label>
        <button
          class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          @click="copy(hash)"
        >
          <Check v-if="copied" class="w-3.5 h-3.5" />
          <Copy v-else class="w-3.5 h-3.5" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <input
        readonly
        :value="hash"
        class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono text-gray-900"
      />
    </div>

    <!-- One-way note -->
    <p class="text-xs text-gray-400">
      Hashing is a one-way operation — the original input cannot be recovered from the hash.
    </p>
  </div>
</template>
