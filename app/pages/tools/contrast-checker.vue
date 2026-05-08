<template>
  <div class="max-w-2xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Contrast Checker</h1>
      <p class="mt-2 text-gray-600">
        Check WCAG AA and AAA color contrast ratios for foreground and background colors. Instantly
        see if your colors are accessible.
      </p>
    </div>

    <!-- Color inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <!-- Foreground -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Foreground color</label>
        <div class="flex items-center gap-3">
          <input
            type="color"
            :value="fgHex"
            class="h-10 w-14 cursor-pointer rounded border border-gray-300"
            @input="onPickerInput('fg', $event)"
          />
          <input
            v-model="fgInput"
            type="text"
            maxlength="7"
            placeholder="#111827"
            :class="[
              'flex-1 rounded-lg border px-3 py-2 text-sm font-mono text-gray-800 outline-none',
              fgError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            ]"
            aria-label="Foreground HEX color"
            @input="onTextInput('fg', ($event.target as HTMLInputElement).value)"
            @blur="onBlur('fg')"
          />
        </div>
        <p v-if="fgError" class="text-xs text-red-600" role="alert">{{ fgError }}</p>
      </div>

      <!-- Background -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Background color</label>
        <div class="flex items-center gap-3">
          <input
            type="color"
            :value="bgHex"
            class="h-10 w-14 cursor-pointer rounded border border-gray-300"
            @input="onPickerInput('bg', $event)"
          />
          <input
            v-model="bgInput"
            type="text"
            maxlength="7"
            placeholder="#FFFFFF"
            :class="[
              'flex-1 rounded-lg border px-3 py-2 text-sm font-mono text-gray-800 outline-none',
              bgError ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            ]"
            aria-label="Background HEX color"
            @input="onTextInput('bg', ($event.target as HTMLInputElement).value)"
            @blur="onBlur('bg')"
          />
        </div>
        <p v-if="bgError" class="text-xs text-red-600" role="alert">{{ bgError }}</p>
      </div>
    </div>

    <!-- Swap button -->
    <div class="flex justify-center">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        @click="swap"
      >
        <ArrowUpDown class="w-4 h-4" />
        Swap colors
      </button>
    </div>

    <!-- Preview panel -->
    <div
      class="rounded-xl border border-gray-200 overflow-hidden"
      :style="{ backgroundColor: bgHex }"
    >
      <div class="px-6 py-5 space-y-3">
        <p class="text-base" :style="{ color: fgHex }">
          The quick brown fox jumps over the lazy dog. (Normal text)
        </p>
        <p class="text-2xl font-bold" :style="{ color: fgHex }">
          The quick brown fox. (Large text)
        </p>
      </div>
    </div>

    <!-- Ratio display -->
    <div class="rounded-xl border border-gray-200 bg-white px-6 py-5">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-4xl font-bold text-gray-900 tabular-nums">{{ wcag.ratioLabel }}</p>
          <p class="text-sm text-gray-500 mt-1">Contrast ratio</p>
        </div>
        <button
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          @click="copyRatio"
        >
          <span v-if="ratioCopied">Copied!</span>
          <span v-else>Copy ratio</span>
        </button>
      </div>

      <!-- WCAG badges table -->
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span />
          <span class="text-center">AA</span>
          <span class="text-center">AAA</span>
        </div>
        <BadgeRow label="Normal text" :aa="wcag.aa.normalText" :aaa="wcag.aaa.normalText" />
        <BadgeRow label="Large text" :aa="wcag.aa.largeText" :aaa="wcag.aaa.largeText" />
        <BadgeRow label="UI components" :aa="wcag.aa.uiComponents" :aaa="null" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowUpDown } from 'lucide-vue-next'
import { parseHex, checkContrast } from '~/utils/contrastChecker'
import BadgeRow from '~/components/tools/ContrastBadgeRow.vue'

useSeoMeta({
  title: 'Contrast Checker - Playground Sunshine',
  description:
    'Check WCAG AA and AAA color contrast ratios instantly — free accessibility contrast checker that runs entirely in your browser.',
})

const DEFAULT_FG = '#111827'
const DEFAULT_BG = '#FFFFFF'

const fgRgb = ref(parseHex(DEFAULT_FG)!)
const bgRgb = ref(parseHex(DEFAULT_BG)!)

const fgInput = ref(DEFAULT_FG)
const bgInput = ref(DEFAULT_BG)
const fgError = ref<string | null>(null)
const bgError = ref<string | null>(null)
const ratioCopied = ref(false)

const fgHex = computed(() => {
  const r = fgRgb.value
  return `#${r.r.toString(16).padStart(2,'0')}${r.g.toString(16).padStart(2,'0')}${r.b.toString(16).padStart(2,'0')}`.toUpperCase()
})

const bgHex = computed(() => {
  const r = bgRgb.value
  return `#${r.r.toString(16).padStart(2,'0')}${r.g.toString(16).padStart(2,'0')}${r.b.toString(16).padStart(2,'0')}`.toUpperCase()
})

const wcag = computed(() => checkContrast(fgRgb.value, bgRgb.value))

function onPickerInput(target: 'fg' | 'bg', event: Event) {
  const hex = (event.target as HTMLInputElement).value
  const rgb = parseHex(hex)
  if (!rgb) return
  if (target === 'fg') { fgRgb.value = rgb; fgInput.value = hex.toUpperCase(); fgError.value = null }
  else { bgRgb.value = rgb; bgInput.value = hex.toUpperCase(); bgError.value = null }
}

function onTextInput(target: 'fg' | 'bg', value: string) {
  const rgb = parseHex(value)
  if (target === 'fg') {
    fgInput.value = value
    if (rgb) { fgRgb.value = rgb; fgError.value = null }
    else fgError.value = 'Invalid HEX color.'
  } else {
    bgInput.value = value
    if (rgb) { bgRgb.value = rgb; bgError.value = null }
    else bgError.value = 'Invalid HEX color.'
  }
}

function onBlur(target: 'fg' | 'bg') {
  if (target === 'fg' && fgError.value) { fgInput.value = fgHex.value; fgError.value = null }
  if (target === 'bg' && bgError.value) { bgInput.value = bgHex.value; bgError.value = null }
}

function swap() {
  const tempRgb = fgRgb.value
  const tempInput = fgInput.value
  fgRgb.value = bgRgb.value; fgInput.value = bgInput.value
  bgRgb.value = tempRgb; bgInput.value = tempInput
  fgError.value = null; bgError.value = null
}

async function copyRatio() {
  await navigator.clipboard.writeText(wcag.value.ratioLabel)
  ratioCopied.value = true
  setTimeout(() => (ratioCopied.value = false), 1500)
}
</script>
