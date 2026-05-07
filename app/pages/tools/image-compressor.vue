<script setup lang="ts">
import { Upload, Download, Trash2 } from 'lucide-vue-next'
import { compressImage, formatBytes, isSupported } from '~/utils/imageCompressor'

useSeoMeta({
  title: 'Image Compressor / Resizer - Playground Sunshine',
  description:
    'Compress and resize JPEG, PNG, and WebP images directly in your browser. See before/after file size — no server upload required.',
})

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const outputUrl = ref<string | null>(null)
const quality = ref(80)
const targetWidth = ref<number | ''>('')
const targetHeight = ref<number | ''>('')
const maintainAspectRatio = ref(true)
const isProcessing = ref(false)
const error = ref<string | null>(null)

interface ResultInfo {
  originalWidth: number
  originalHeight: number
  outputWidth: number
  outputHeight: number
  originalSize: number
  outputSize: number
  outputBlob: Blob
}
const result = ref<ResultInfo | null>(null)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const picked = target.files?.[0] ?? null
  selectFile(picked)
}

function onDrop(e: DragEvent) {
  const picked = e.dataTransfer?.files?.[0] ?? null
  selectFile(picked)
}

function selectFile(picked: File | null) {
  if (!picked) return
  if (!isSupported(picked)) {
    error.value = 'Please upload a JPEG, PNG, or WebP image.'
    return
  }
  error.value = null
  result.value = null
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value)
  outputUrl.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  file.value = picked
  previewUrl.value = URL.createObjectURL(picked)
}

async function compress() {
  if (!file.value) return
  isProcessing.value = true
  error.value = null

  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value)
  outputUrl.value = null

  const w = targetWidth.value === '' ? undefined : Number(targetWidth.value)
  const h = targetHeight.value === '' ? undefined : Number(targetHeight.value)

  const res = await compressImage({
    file: file.value,
    quality: quality.value / 100,
    targetWidth: w,
    targetHeight: h,
    maintainAspectRatio: maintainAspectRatio.value,
  })

  isProcessing.value = false

  if (res.error) {
    error.value = res.error
    return
  }

  result.value = {
    originalWidth: res.originalWidth,
    originalHeight: res.originalHeight,
    outputWidth: res.outputWidth,
    outputHeight: res.outputHeight,
    originalSize: res.originalSize,
    outputSize: res.outputSize,
    outputBlob: res.blob!,
  }
  outputUrl.value = URL.createObjectURL(res.blob!)
}

function download() {
  if (!outputUrl.value || !result.value) return
  const ext = result.value.outputBlob.type.split('/')[1] ?? 'jpg'
  const a = document.createElement('a')
  a.href = outputUrl.value
  a.download = `compressed.${ext}`
  a.click()
}

function clear() {
  file.value = null
  error.value = null
  result.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value)
  outputUrl.value = null
  targetWidth.value = ''
  targetHeight.value = ''
  quality.value = 80
  if (fileInput.value) fileInput.value.value = ''
}

const savingsPercent = computed(() => {
  if (!result.value || result.value.originalSize === 0) return 0
  return Math.round((1 - result.value.outputSize / result.value.originalSize) * 100)
})

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value)
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Image Compressor / Resizer</h1>
      <p class="mt-1 text-gray-500">Reduce image file size and resize dimensions directly in your browser.</p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      Images are processed locally using the Canvas API and never uploaded to a server.
    </div>

    <!-- Drop zone / file picker -->
    <div
      class="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-10 transition-colors hover:border-indigo-400 cursor-pointer"
      @click="fileInput?.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <Upload class="w-8 h-8 text-gray-400" />
      <p class="text-sm text-gray-500">
        <span class="font-medium text-indigo-600">Click to upload</span> or drag and drop
      </p>
      <p class="text-xs text-gray-400">JPEG, PNG, WebP</p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Selected file name -->
    <p v-if="file" class="text-sm text-gray-600 truncate">
      <span class="font-medium">Selected:</span> {{ file.name }}
      ({{ formatBytes(file.size) }})
    </p>

    <!-- Options -->
    <div v-if="file" class="space-y-4">
      <!-- Quality slider -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Quality: <span class="text-indigo-600 font-semibold">{{ quality }}%</span>
        </label>
        <input
          v-model.number="quality"
          type="range"
          min="1"
          max="100"
          class="w-full accent-indigo-600"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>Smaller file</span>
          <span>Higher quality</span>
        </div>
      </div>

      <!-- Resize -->
      <div class="flex flex-wrap gap-4 items-end">
        <div>
          <label for="target-width" class="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
          <input
            id="target-width"
            v-model.number="targetWidth"
            type="number"
            min="1"
            placeholder="auto"
            class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label for="target-height" class="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
          <input
            id="target-height"
            v-model.number="targetHeight"
            type="number"
            min="1"
            placeholder="auto"
            class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer pb-2">
          <input
            v-model="maintainAspectRatio"
            type="checkbox"
            class="rounded accent-indigo-600"
          />
          Maintain aspect ratio
        </label>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          :disabled="isProcessing"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="compress"
        >
          {{ isProcessing ? 'Processing…' : 'Compress / Resize' }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="clear"
        >
          <Trash2 class="w-4 h-4" />
          Clear
        </button>
      </div>
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

    <!-- Result -->
    <div v-if="result && outputUrl" class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p class="text-xs text-gray-500 mb-0.5">Original size</p>
          <p class="text-sm font-semibold text-gray-800">{{ formatBytes(result.originalSize) }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p class="text-xs text-gray-500 mb-0.5">Compressed size</p>
          <p class="text-sm font-semibold text-indigo-600">{{ formatBytes(result.outputSize) }}</p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p class="text-xs text-gray-500 mb-0.5">Savings</p>
          <p
            class="text-sm font-semibold"
            :class="savingsPercent > 0 ? 'text-green-600' : 'text-gray-600'"
          >
            {{ savingsPercent > 0 ? `−${savingsPercent}%` : '0%' }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
          <p class="text-xs text-gray-500 mb-0.5">Dimensions</p>
          <p class="text-sm font-semibold text-gray-800">
            {{ result.outputWidth }}×{{ result.outputHeight }}
          </p>
          <p v-if="result.outputWidth !== result.originalWidth || result.outputHeight !== result.originalHeight" class="text-xs text-gray-400">
            was {{ result.originalWidth }}×{{ result.originalHeight }}
          </p>
        </div>
      </div>

      <!-- Preview -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Preview</p>
        <img
          :src="outputUrl"
          alt="Compressed image preview"
          class="max-w-full rounded-xl border border-gray-200 shadow-sm"
        />
      </div>

      <!-- Download -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="download"
      >
        <Download class="w-4 h-4" />
        Download
      </button>
    </div>
  </div>
</template>
