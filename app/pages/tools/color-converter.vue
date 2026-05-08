<template>
  <div class="max-w-2xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Color Picker &amp; Converter</h1>
      <p class="mt-2 text-gray-600">
        Convert colors between HEX, RGB, HSL, and HSB. Edit any field or use the color picker — all
        formats update in real time.
      </p>
    </div>

    <!-- Color swatch + picker -->
    <div class="flex items-center gap-5">
      <div
        class="w-20 h-20 rounded-xl border border-gray-200 shadow-sm shrink-0"
        :style="{ backgroundColor: previewHex }"
      />
      <div class="space-y-1">
        <label for="colorPicker" class="text-sm font-medium text-gray-700">Pick a color</label>
        <input
          id="colorPicker"
          type="color"
          :value="previewHex"
          class="block h-9 w-24 cursor-pointer rounded border border-gray-300"
          @input="onPickerInput"
        />
      </div>
      <button
        class="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
        @click="resetToDefault"
      >
        Reset
      </button>
    </div>

    <!-- Format fields -->
    <div class="space-y-4">
      <ColorFormatRow
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :value="field.value"
        :error="errors[field.key]"
        @update="(v) => onFieldUpdate(field.key, v)"
        @blur="onFieldBlur(field.key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  parseHex, parseRgb, parseHsl, parseHsb,
  rgbToAllFormats, hslToRgb, hsbToRgb,
  type RGB,
} from '~/utils/colorConverter'
import ColorFormatRow from '~/components/tools/ColorFormatRow.vue'

useSeoMeta({
  title: 'Color Picker & Converter - Playground Sunshine',
  description:
    'Convert colors between HEX, RGB, HSL, and HSB instantly — free color picker and converter that runs entirely in your browser.',
})

const DEFAULT_COLOR = '#3B82F6'
type FieldKey = 'hex' | 'rgb' | 'hsl' | 'hsb'

// Canonical color stored as RGB
const currentRgb = ref<RGB>(parseHex(DEFAULT_COLOR)!)

// Per-field display values (string)
const fieldValues = ref({
  hex: DEFAULT_COLOR,
  rgb: 'rgb(59, 130, 246)',
  hsl: 'hsl(217, 91%, 60%)',
  hsb: 'hsb(217, 76%, 96%)',
})

// Per-field error messages
const errors = ref<Record<FieldKey, string | null>>({
  hex: null, rgb: null, hsl: null, hsb: null,
})

const previewHex = computed(() => {
  const formats = rgbToAllFormats(currentRgb.value)
  return formats.hex
})

const fields = computed(() => [
  { key: 'hex' as FieldKey, label: 'HEX', value: fieldValues.value.hex },
  { key: 'rgb' as FieldKey, label: 'RGB', value: fieldValues.value.rgb },
  { key: 'hsl' as FieldKey, label: 'HSL', value: fieldValues.value.hsl },
  { key: 'hsb' as FieldKey, label: 'HSB', value: fieldValues.value.hsb },
])

function applyRgb(rgb: RGB) {
  currentRgb.value = rgb
  const formats = rgbToAllFormats(rgb)
  fieldValues.value = { hex: formats.hex, rgb: formats.rgb, hsl: formats.hsl, hsb: formats.hsb }
  errors.value = { hex: null, rgb: null, hsl: null, hsb: null }
}

function onPickerInput(event: Event) {
  const hex = (event.target as HTMLInputElement).value
  const rgb = parseHex(hex)
  if (rgb) applyRgb(rgb)
}

function onFieldUpdate(key: FieldKey, value: string) {
  fieldValues.value[key] = value
  const parsed = tryParse(key, value)
  if (parsed) {
    errors.value[key] = null
    // Update all OTHER fields
    const formats = rgbToAllFormats(parsed)
    currentRgb.value = parsed
    const keys: FieldKey[] = ['hex', 'rgb', 'hsl', 'hsb']
    for (const k of keys) {
      if (k !== key) fieldValues.value[k] = formats[k]
      if (k !== key) errors.value[k] = null
    }
  } else {
    errors.value[key] = `Invalid ${key.toUpperCase()} color value.`
  }
}

function onFieldBlur(key: FieldKey) {
  if (errors.value[key]) {
    // Revert to last valid value
    const formats = rgbToAllFormats(currentRgb.value)
    fieldValues.value[key] = formats[key]
    errors.value[key] = null
  }
}

function tryParse(key: FieldKey, value: string): RGB | null {
  if (key === 'hex') return parseHex(value)
  if (key === 'rgb') return parseRgb(value)
  if (key === 'hsl') { const hsl = parseHsl(value); return hsl ? hslToRgb(hsl) : null }
  if (key === 'hsb') { const hsb = parseHsb(value); return hsb ? hsbToRgb(hsb) : null }
  return null
}

function resetToDefault() {
  applyRgb(parseHex(DEFAULT_COLOR)!)
}
</script>
