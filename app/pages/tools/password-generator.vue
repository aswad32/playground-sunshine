<script setup lang="ts">
import { RefreshCw, Copy, Check } from 'lucide-vue-next'
import {
  generatePasswords,
  getStrength,
  CHARSETS,
  type CharsetKey,
  type PasswordStrength,
} from '~/utils/passwordGenerator'

useSeoMeta({
  title: 'Password Generator - Playground Sunshine',
  description:
    'Generate strong, secure passwords with customizable length and character sets — runs entirely in your browser using the Web Crypto API.',
})

const CHARSET_OPTIONS: { key: CharsetKey; label: string; example: string }[] = [
  { key: 'uppercase', label: 'Uppercase', example: 'A–Z' },
  { key: 'lowercase', label: 'Lowercase', example: 'a–z' },
  { key: 'numbers', label: 'Numbers', example: '0–9' },
  { key: 'symbols', label: 'Symbols', example: '!@#$%^…' },
]

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  Weak: 'text-red-500',
  Fair: 'text-amber-500',
  Strong: 'text-blue-500',
  'Very Strong': 'text-green-600',
}

const length = ref(16)
const quantity = ref(1)
const include = ref<CharsetKey[]>(['uppercase', 'lowercase', 'numbers'])

const passwords = ref<string[]>([])
const copiedIndex = ref<number | null>(null)
const copiedAll = ref(false)

const hasCharset = computed(() => include.value.length > 0)

function generate() {
  if (!hasCharset.value) return
  passwords.value = generatePasswords({
    length: length.value,
    include: include.value,
    quantity: quantity.value,
  })
}

async function copyOne(idx: number) {
  await navigator.clipboard.writeText(passwords.value[idx])
  copiedIndex.value = idx
  setTimeout(() => { if (copiedIndex.value === idx) copiedIndex.value = null }, 1500)
}

async function copyAll() {
  await navigator.clipboard.writeText(passwords.value.join('\n'))
  copiedAll.value = true
  setTimeout(() => { copiedAll.value = false }, 1500)
}

function clear() {
  passwords.value = []
  copiedIndex.value = null
  copiedAll.value = false
}

// Auto-generate on mount (client-only — avoids SSR hydration mismatch)
onMounted(() => generate())
</script>

<template>
  <main class="max-w-2xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Password Generator</h1>
      <p class="text-gray-500 text-sm">
        Generate strong, random passwords using your browser's secure random API.
      </p>
    </header>

    <!-- Options -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-5 mb-6">

      <!-- Length -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label for="pwd-length" class="text-sm font-medium text-gray-700">Length</label>
          <input
            id="pwd-length"
            v-model.number="length"
            type="number"
            min="8"
            max="128"
            class="w-16 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm font-mono text-gray-800 focus:border-yellow-400 focus:outline-none"
          />
        </div>
        <input
          type="range"
          min="8"
          max="128"
          v-model.number="length"
          aria-label="Password length"
          class="w-full accent-yellow-400"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>8</span><span>128</span>
        </div>
      </div>

      <!-- Character sets -->
      <div>
        <p class="text-sm font-medium text-gray-700 mb-2">Include</p>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="opt in CHARSET_OPTIONS"
            :key="opt.key"
            class="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :value="opt.key"
              v-model="include"
              class="accent-yellow-400 w-4 h-4"
            />
            <span class="text-sm text-gray-700">{{ opt.label }}</span>
            <span class="text-xs text-gray-400 font-mono">{{ opt.example }}</span>
          </label>
        </div>
        <p
          v-if="!hasCharset"
          role="alert"
          aria-live="polite"
          class="mt-2 text-sm text-red-600"
        >
          Select at least one character type.
        </p>
      </div>

      <!-- Quantity -->
      <div class="flex items-center gap-3">
        <label for="pwd-quantity" class="text-sm font-medium text-gray-700 shrink-0">Quantity</label>
        <input
          id="pwd-quantity"
          v-model.number="quantity"
          type="number"
          min="1"
          max="20"
          class="w-20 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm font-mono text-gray-800 focus:border-yellow-400 focus:outline-none"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        :disabled="!hasCharset"
        class="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="generate"
      >
        Generate
      </button>
      <button
        type="button"
        :disabled="!hasCharset"
        :aria-label="'Re-generate passwords'"
        class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="generate"
      >
        <RefreshCw :size="14" />
      </button>
      <button
        v-if="passwords.length > 0"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        @click="copyAll"
      >
        <Check v-if="copiedAll" :size="14" class="text-green-500" />
        <Copy v-else :size="14" />
        {{ copiedAll ? 'Copied!' : 'Copy All' }}
      </button>
      <button
        v-if="passwords.length > 0"
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        @click="clear"
      >
        Clear
      </button>
    </div>

    <!-- Password list -->
    <ul v-if="passwords.length" class="flex flex-col gap-2">
      <li
        v-for="(pwd, i) in passwords"
        :key="i"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <span class="flex-1 font-mono text-sm text-gray-800 break-all">{{ pwd }}</span>
        <span
          class="text-xs font-medium shrink-0"
          :class="STRENGTH_COLORS[getStrength(pwd, include)]"
        >
          {{ getStrength(pwd, include) }}
        </span>
        <button
          type="button"
          :aria-label="`Copy password ${i + 1}`"
          class="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors shrink-0"
          @click="copyOne(i)"
        >
          <Check v-if="copiedIndex === i" :size="13" class="text-green-500" />
          <Copy v-else :size="13" />
        </button>
      </li>
    </ul>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400">
      Passwords are generated locally using your browser's secure random API and never leave your device.
    </p>
  </main>
</template>
