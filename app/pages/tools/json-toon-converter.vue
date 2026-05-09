<script setup lang="ts">
import { ArrowLeftRight, ArrowRight } from 'lucide-vue-next'
import { charSavings, jsonToToon, toonToJson, toPromptBlock } from '~/utils/jsonToonConverter'

useSeoMeta({
  title: 'JSON ↔ TOON Converter - Playground Sunshine',
  description:
    'Convert JSON to TOON (Token-Oriented Object Notation) and back — reduce LLM token costs with this free, in-browser converter.',
})

// --- Example pre-fill ---
const EXAMPLE_JSON = `{
  "user": {
    "name": "Alice",
    "role": "admin"
  },
  "tags": ["typescript", "vue", "nuxt"],
  "permissions": [
    { "id": 1, "resource": "posts", "level": "write" },
    { "id": 2, "resource": "users", "level": "read" }
  ]
}`

const EXAMPLE_TOON = (() => {
  const r = jsonToToon(EXAMPLE_JSON)
  return r.value ?? ''
})()

// --- State ---
type Direction = 'json-to-toon' | 'toon-to-json' | null

const jsonText = ref(EXAMPLE_JSON)
const toonText = ref(EXAMPLE_TOON)
const direction = ref<Direction>('json-to-toon')
const jsonError = ref<string | null>(null)
const toonError = ref<string | null>(null)
const jsonErrorDetail = ref<string | undefined>(undefined)
const toonErrorDetail = ref<string | undefined>(undefined)

const { copy } = useClipboard()
const copiedKey = ref<string | null>(null)
async function copyWith(key: string, text: string) {
  await copy(text)
  copiedKey.value = key
  setTimeout(() => { copiedKey.value = null }, 1500)
}

// --- Stats ---
const jsonChars = computed(() => jsonText.value.length)
const toonChars = computed(() => toonText.value.length)

const savings = computed(() => {
  if (!jsonText.value || !toonText.value) return null
  return charSavings(jsonChars.value, toonChars.value)
})

const savingsBadge = computed(() => {
  const s = savings.value
  if (s === null) return null
  const abs = Math.abs(s)
  if (s > 0) return { label: `✓ ${abs}% fewer chars`, class: 'bg-green-50 text-green-700' }
  if (s < 0) return { label: `↑ ${abs}% more chars`, class: 'bg-amber-50 text-amber-700' }
  return { label: '≈ same size', class: 'bg-gray-100 text-gray-500' }
})

// --- Conversion ---
let debounceTimer: ReturnType<typeof setTimeout>

function convertJsonToToon() {
  direction.value = 'json-to-toon'
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    jsonError.value = null
    jsonErrorDetail.value = undefined
    if (!jsonText.value.trim()) {
      toonText.value = ''
      return
    }
    const result = jsonToToon(jsonText.value)
    if (result.error) {
      jsonError.value = result.error
    } else {
      toonText.value = result.value as string
      toonError.value = null
    }
  }, 300)
}

function convertToonToJson() {
  direction.value = 'toon-to-json'
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    toonError.value = null
    toonErrorDetail.value = undefined
    if (!toonText.value.trim()) {
      jsonText.value = ''
      return
    }
    const result = toonToJson(toonText.value)
    if (result.error) {
      toonError.value = result.error
      toonErrorDetail.value = result.detail
    } else {
      jsonText.value = result.value as string
      jsonError.value = null
    }
  }, 300)
}

function clear() {
  clearTimeout(debounceTimer)
  jsonText.value = ''
  toonText.value = ''
  jsonError.value = null
  toonError.value = null
  direction.value = null
}

function swap() {
  clearTimeout(debounceTimer)
  const toon = toonText.value
  jsonText.value = ''
  toonText.value = toon
  jsonError.value = null
  toonError.value = null
  convertToonToJson()
}

const promptBlock = computed(() => toPromptBlock(toonText.value))
const hasToon = computed(() => toonText.value.trim().length > 0)
</script>

<template>
  <main class="max-w-6xl mx-auto px-4 py-10">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">JSON ↔ TOON Converter</h1>
      <p class="text-gray-500 text-sm max-w-2xl">
        Convert JSON to
        <a
          href="https://github.com/toon-format/toon"
          target="_blank"
          rel="noopener noreferrer"
          class="text-yellow-600 hover:underline"
        >TOON (Token-Oriented Object Notation)</a>
        and back. TOON is a compact, human-readable format that uses ~40% fewer tokens than JSON —
        ideal for LLM prompts and structured AI pipelines.
      </p>
    </header>

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        @click="clear"
      >
        Clear
      </button>
      <button
        type="button"
        :disabled="!hasToon"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="swap"
      >
        Swap
      </button>
    </div>

    <!-- Panels -->
    <div class="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">

      <!-- JSON panel -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">JSON</span>
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="copyWith('json', jsonText)"
          >
            {{ copiedKey === 'json' ? 'Copied!' : 'Copy JSON' }}
          </button>
        </div>
        <textarea
          v-model="jsonText"
          spellcheck="false"
          placeholder="Paste or type JSON here…"
          class="w-full h-80 rounded-xl border border-gray-200 bg-white px-3 py-3 font-mono text-sm text-gray-800 placeholder:text-gray-300 resize-y focus:border-yellow-400 focus:outline-none"
          @input="convertJsonToToon"
        />
        <div class="flex items-center justify-between min-h-[1.5rem]">
          <p
            v-if="jsonError"
            role="alert"
            aria-live="polite"
            class="text-xs text-red-500"
          >
            {{ jsonError }}
          </p>
          <span v-if="jsonChars > 0" class="text-xs text-gray-400 ml-auto">{{ jsonChars.toLocaleString() }} chars</span>
        </div>
      </div>

      <!-- Direction indicator -->
      <div class="flex lg:flex-col items-center justify-center gap-1 pt-8 lg:pt-36">
        <component
          :is="ArrowRight"
          v-if="direction === 'json-to-toon'"
          class="w-5 h-5 text-yellow-500 rotate-0 lg:rotate-0"
        />
        <component
          :is="ArrowRight"
          v-else-if="direction === 'toon-to-json'"
          class="w-5 h-5 text-yellow-500 rotate-180"
        />
        <component
          :is="ArrowLeftRight"
          v-else
          class="w-5 h-5 text-gray-300"
        />
        <!-- Savings badge -->
        <span
          v-if="savingsBadge"
          :class="savingsBadge.class"
          class="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
        >
          {{ savingsBadge.label }}
        </span>
      </div>

      <!-- TOON panel -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">TOON</span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              :disabled="!hasToon"
              class="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              @click="copyWith('toon', toonText)"
            >
              {{ copiedKey === 'toon' ? 'Copied!' : 'Copy TOON' }}
            </button>
            <button
              type="button"
              :disabled="!hasToon"
              class="text-xs font-medium text-yellow-600 hover:text-yellow-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :title="'Copy as ```toon fenced block for LLM prompts'"
              @click="copyWith('prompt', promptBlock)"
            >
              {{ copiedKey === 'prompt' ? 'Copied!' : 'Copy as prompt block' }}
            </button>
          </div>
        </div>
        <textarea
          v-model="toonText"
          spellcheck="false"
          placeholder="TOON output appears here, or paste TOON to convert to JSON…"
          class="w-full h-80 rounded-xl border border-gray-200 bg-white px-3 py-3 font-mono text-sm text-gray-800 placeholder:text-gray-300 resize-y focus:border-yellow-400 focus:outline-none"
          @input="convertToonToJson"
        />
        <div class="flex items-center justify-between min-h-[1.5rem]">
          <div v-if="toonError" class="flex-1">
            <p
              role="alert"
              aria-live="polite"
              class="text-xs text-red-500"
            >
              {{ toonError }}
            </p>
            <details v-if="toonErrorDetail" class="mt-0.5">
              <summary class="text-xs text-gray-400 cursor-pointer select-none">Details</summary>
              <p class="text-xs text-gray-500 mt-1 font-mono break-all">{{ toonErrorDetail }}</p>
            </details>
          </div>
          <span v-if="toonChars > 0" class="text-xs text-gray-400 ml-auto">{{ toonChars.toLocaleString() }} chars</span>
        </div>
      </div>
    </div>

    <!-- What is TOON -->
    <section class="mt-12 rounded-xl border border-gray-100 bg-gray-50 px-6 py-5 max-w-3xl">
      <h2 class="text-sm font-semibold text-gray-700 mb-2">What is TOON?</h2>
      <p class="text-sm text-gray-500 leading-relaxed">
        TOON (Token-Oriented Object Notation) is a compact, lossless encoding of the JSON data model.
        It uses YAML-style indentation for nested objects and CSV-style tabular rows for uniform arrays —
        achieving up to 60% fewer characters than formatted JSON. It's designed as a drop-in replacement
        for JSON in LLM prompts, reducing token costs while keeping structure clear for models to follow.
        Learn more at the
        <a
          href="https://github.com/toon-format/toon"
          target="_blank"
          rel="noopener noreferrer"
          class="text-yellow-600 hover:underline"
        >official TOON project on GitHub</a>.
      </p>
    </section>

    <!-- Privacy -->
    <p class="mt-6 text-xs text-gray-400">
      JSON and TOON data is processed locally in your browser and never sent to a server.
    </p>
  </main>
</template>
