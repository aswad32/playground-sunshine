<script setup lang="ts">
import { Copy, Check, Trash2 } from 'lucide-vue-next'
import { renderMarkdown } from '~/utils/markdownPreviewer'
import { useClipboard } from '~/composables/useClipboard'

useSeoMeta({
  title: 'Markdown Previewer - Playground Sunshine',
  description:
    'Preview Markdown as formatted HTML in real time. Copy the rendered HTML or raw Markdown — runs entirely in your browser.',
})

const DEFAULT_MARKDOWN = `# Hello, Markdown!

Write **bold**, *italic*, or \`inline code\`.

## Links & Lists

- [Playground Sunshine](https://example.com)
- Item two
- Item three

## Code Block

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`
\`\`\`

> Blockquotes work too.
`

const input = ref(DEFAULT_MARKDOWN)

const { copy, copied } = useClipboard()
const { copy: copyHtml, copied: copiedHtml } = useClipboard()

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const renderedHtml = ref('')

function renderDebounced() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const result = renderMarkdown(input.value)
    renderedHtml.value = result.html
  }, 150)
}

// Render immediately on mount
onMounted(() => {
  const result = renderMarkdown(input.value)
  renderedHtml.value = result.html
})

watch(input, () => {
  renderDebounced()
})

function clear() {
  input.value = ''
  renderedHtml.value = ''
  if (debounceTimer) clearTimeout(debounceTimer)
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Markdown Previewer</h1>
      <p class="mt-1 text-gray-500">Write Markdown on the left, see the live preview on the right.</p>
    </div>

    <!-- Privacy note -->
    <div class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
      Your Markdown is processed locally and never sent to a server.
    </div>

    <!-- Action bar -->
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="copy(input)"
      >
        <Check v-if="copied" class="w-4 h-4 text-green-500" />
        <Copy v-else class="w-4 h-4" />
        {{ copied ? 'Copied!' : 'Copy Markdown' }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        :disabled="!renderedHtml"
        @click="copyHtml(renderedHtml)"
      >
        <Check v-if="copiedHtml" class="w-4 h-4 text-green-500" />
        <Copy v-else class="w-4 h-4" />
        {{ copiedHtml ? 'Copied!' : 'Copy HTML' }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="clear"
      >
        <Trash2 class="w-4 h-4" />
        Clear
      </button>
    </div>

    <!-- Split pane -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="flex flex-col">
        <label for="md-input" class="block text-sm font-medium text-gray-700 mb-1">Markdown</label>
        <textarea
          id="md-input"
          v-model="input"
          class="flex-1 min-h-96 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          placeholder="Type your Markdown here..."
          spellcheck="false"
        />
      </div>

      <!-- Preview -->
      <div class="flex flex-col">
        <span class="block text-sm font-medium text-gray-700 mb-1">Preview</span>
        <div
          v-if="renderedHtml"
          class="flex-1 min-h-96 rounded-lg border border-gray-200 bg-white px-6 py-4 overflow-auto prose prose-sm max-w-none"
          aria-label="Rendered Markdown preview"
          v-html="renderedHtml"
        />
        <div
          v-else
          class="flex-1 min-h-96 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm"
        >
          Your preview will appear here.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Prose-style typography for the preview pane */
:deep(.prose) h1 { @apply text-2xl font-bold mt-6 mb-3 text-gray-900; }
:deep(.prose) h2 { @apply text-xl font-semibold mt-5 mb-2 text-gray-900; }
:deep(.prose) h3 { @apply text-lg font-semibold mt-4 mb-2 text-gray-900; }
:deep(.prose) h4 { @apply text-base font-semibold mt-3 mb-1 text-gray-900; }
:deep(.prose) p  { @apply my-3 text-gray-700 leading-relaxed; }
:deep(.prose) a  { @apply text-indigo-600 underline hover:text-indigo-800; }
:deep(.prose) strong { @apply font-semibold text-gray-900; }
:deep(.prose) em     { @apply italic; }
:deep(.prose) code   { @apply bg-gray-100 text-pink-600 rounded px-1 py-0.5 text-sm font-mono; }
:deep(.prose) pre    { @apply bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4; }
:deep(.prose) pre code { @apply bg-transparent text-gray-100 p-0; }
:deep(.prose) blockquote { @apply border-l-4 border-indigo-300 pl-4 italic text-gray-500 my-4; }
:deep(.prose) ul { @apply list-disc pl-6 my-3 space-y-1 text-gray-700; }
:deep(.prose) ol { @apply list-decimal pl-6 my-3 space-y-1 text-gray-700; }
:deep(.prose) li { @apply leading-relaxed; }
:deep(.prose) hr { @apply border-gray-200 my-6; }
:deep(.prose) table { @apply w-full border-collapse my-4; }
:deep(.prose) th { @apply bg-gray-100 border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700; }
:deep(.prose) td { @apply border border-gray-200 px-3 py-2 text-sm text-gray-700; }
</style>
