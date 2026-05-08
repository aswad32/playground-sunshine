<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'
import { convertBase, type Base } from '~/utils/numberBaseConverter'

useSeoMeta({
  title: 'Number Base Converter - Playground Sunshine',
  description:
    'Convert numbers between binary, octal, decimal, and hexadecimal in real time — free and runs entirely in your browser.',
})

interface Field {
  label: string
  base: Base
  placeholder: string
  pattern: string
}

const FIELDS: Field[] = [
  { label: 'Decimal', base: 10, placeholder: 'e.g. 255', pattern: '[0-9]*' },
  { label: 'Binary', base: 2, placeholder: 'e.g. 11111111', pattern: '[01]*' },
  { label: 'Octal', base: 8, placeholder: 'e.g. 377', pattern: '[0-7]*' },
  { label: 'Hexadecimal', base: 16, placeholder: 'e.g. FF', pattern: '[0-9a-fA-F]*' },
]

const values = reactive<Record<Base, string>>({ 2: '', 8: '', 10: '', 16: '' })
const error = ref<string | null>(null)
const copiedBase = ref<Base | null>(null)

function onInput(fromBase: Base) {
  const result = convertBase(values[fromBase], fromBase)
  error.value = result.error

  if (!result.error) {
    values[2] = result.binary
    values[8] = result.octal
    values[10] = result.decimal
    values[16] = result.hex
  }
}

function clear() {
  values[2] = ''
  values[8] = ''
  values[10] = ''
  values[16] = ''
  error.value = null
  copiedBase.value = null
}

async function copyValue(base: Base) {
  const val = values[base]
  if (!val) return
  await navigator.clipboard.writeText(val)
  copiedBase.value = base
  setTimeout(() => {
    if (copiedBase.value === base) copiedBase.value = null
  }, 1500)
}
</script>

<template>
  <main class="max-w-2xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Number Base Converter</h1>
      <p class="text-gray-500 text-sm">
        Convert numbers between binary, octal, decimal, and hexadecimal in real time.
      </p>
    </header>

    <div class="flex flex-col gap-4">
      <div
        v-for="field in FIELDS"
        :key="field.base"
        class="flex items-center gap-3"
      >
        <div class="w-28 shrink-0">
          <label
            :for="`base-${field.base}`"
            class="block text-sm font-medium text-gray-700"
          >
            {{ field.label }}
          </label>
          <span class="text-xs text-gray-400">Base {{ field.base }}</span>
        </div>
        <input
          :id="`base-${field.base}`"
          v-model="values[field.base]"
          type="text"
          :placeholder="field.placeholder"
          :pattern="field.pattern"
          autocomplete="off"
          spellcheck="false"
          class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
          @input="onInput(field.base)"
        />
        <button
          type="button"
          :disabled="!values[field.base]"
          :aria-label="`Copy ${field.label}`"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="copyValue(field.base)"
        >
          <Check v-if="copiedBase === field.base" :size="14" class="text-green-500" />
          <Copy v-else :size="14" />
        </button>
      </div>
    </div>

    <!-- Error -->
    <p
      v-if="error"
      role="alert"
      aria-live="polite"
      class="mt-4 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <div class="mt-6">
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        @click="clear"
      >
        Clear
      </button>
    </div>

    <!-- Quick reference -->
    <div class="mt-10">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Quick Reference</h2>
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm text-center">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-4 py-2 font-medium">Decimal</th>
              <th class="px-4 py-2 font-medium">Binary</th>
              <th class="px-4 py-2 font-medium">Octal</th>
              <th class="px-4 py-2 font-medium">Hex</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-mono text-gray-700">
            <tr v-for="n in [0,1,2,4,8,10,15,16,255]" :key="n" class="hover:bg-gray-50">
              <td class="px-4 py-1.5">{{ n }}</td>
              <td class="px-4 py-1.5">{{ n.toString(2) }}</td>
              <td class="px-4 py-1.5">{{ n.toString(8) }}</td>
              <td class="px-4 py-1.5">{{ n.toString(16).toUpperCase() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
