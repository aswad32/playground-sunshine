<script setup lang="ts">
import { encodeHtmlEntities, decodeHtmlEntities } from '~/utils/htmlEntityEncoder'

useSeoMeta({
  title: 'HTML Entity Encoder / Decoder - Playground Sunshine',
  description:
    'Encode special characters to HTML entities or decode them back to plain text — free and private, runs entirely in your browser.',
})

const input = ref('')
const output = ref('')
const warning = ref<string | null>(null)

const { copy, copied } = useClipboard()

function runEncode() {
  output.value = encodeHtmlEntities(input.value)
  warning.value = null
}

function runDecode() {
  const result = decodeHtmlEntities(input.value)
  output.value = result.output
  warning.value = result.hadUnknown
    ? 'Some entities could not be decoded and were left as-is.'
    : null
}

function clear() {
  input.value = ''
  output.value = ''
  warning.value = null
}

const COMMON_ENTITIES = [
  { char: '&', entity: '&amp;', desc: 'Ampersand' },
  { char: '<', entity: '&lt;', desc: 'Less than' },
  { char: '>', entity: '&gt;', desc: 'Greater than' },
  { char: '"', entity: '&quot;', desc: 'Double quote' },
  { char: "'", entity: '&#39;', desc: 'Single quote' },
  { char: '\u00a0', entity: '&nbsp;', desc: 'Non-breaking space' },
  { char: '©', entity: '&copy;', desc: 'Copyright' },
  { char: '®', entity: '&reg;', desc: 'Registered trademark' },
]
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">HTML Entity Encoder / Decoder</h1>
      <p class="text-gray-500 text-sm">
        Encode special characters to HTML entities or decode them back to plain text — runs entirely in your browser.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Input -->
      <div class="flex flex-col gap-2">
        <label for="html-input" class="text-sm font-medium text-gray-700">Input</label>
        <textarea
          id="html-input"
          v-model="input"
          placeholder='Paste text or HTML here, e.g. <h1>Hello "world"</h1>'
          class="w-full h-72 rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
          spellcheck="false"
        />
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 transition-colors"
            @click="runEncode"
          >
            Encode
          </button>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            @click="runDecode"
          >
            Decode
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            @click="clear"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Output -->
      <div class="flex flex-col gap-2">
        <label for="html-output" class="text-sm font-medium text-gray-700">Output</label>
        <textarea
          id="html-output"
          :value="output"
          readonly
          placeholder="Encoded or decoded output will appear here"
          class="w-full h-72 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none"
          spellcheck="false"
        />

        <!-- Warning -->
        <p
          v-if="warning"
          role="status"
          aria-live="polite"
          class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
        >
          {{ warning }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :disabled="!output"
            class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            @click="copy(output)"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reference table -->
    <div class="mt-10">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Common HTML Entities</h2>
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-4 py-2 font-medium">Character</th>
              <th class="px-4 py-2 font-medium">Entity</th>
              <th class="px-4 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 font-mono">
            <tr
              v-for="row in COMMON_ENTITIES"
              :key="row.entity"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-2 text-gray-900">{{ row.char }}</td>
              <td class="px-4 py-2 text-yellow-700">{{ row.entity }}</td>
              <td class="px-4 py-2 text-gray-500 font-sans">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
