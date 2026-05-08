<template>
  <div class="max-w-3xl mx-auto px-4 py-10 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">String Case Converter</h1>
      <p class="mt-2 text-gray-600">
        Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE,
        and Title Case — live as you type.
      </p>
    </div>

    <!-- Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label for="input" class="text-sm font-medium text-gray-700">Input</label>
        <button
          v-if="input"
          class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          @click="clear"
        >
          Clear
        </button>
      </div>
      <textarea
        id="input"
        v-model="input"
        rows="4"
        placeholder="Type or paste any text, camelCase, snake_case, kebab-case…"
        class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
      />
    </div>

    <!-- Outputs -->
    <div class="space-y-3">
      <OutputRow
        v-for="row in outputRows"
        :key="row.label"
        :label="row.label"
        :value="row.value"
        :description="row.description"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { convertAllCases } from '~/utils/stringCaseConverter'
import OutputRow from '~/components/tools/StringCaseOutputRow.vue'

useSeoMeta({
  title: 'String Case Converter - Playground Sunshine',
  description:
    'Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and Title Case — free, instant, runs in your browser.',
})

const input = ref('')

const conversions = computed(() => convertAllCases(input.value))

const outputRows = computed(() => [
  { label: 'camelCase', description: 'Used in JavaScript, Java variables', value: conversions.value.camel },
  { label: 'PascalCase', description: 'Used in class names, React components', value: conversions.value.pascal },
  { label: 'snake_case', description: 'Used in Python, Ruby, SQL', value: conversions.value.snake },
  { label: 'kebab-case', description: 'Used in CSS, URLs, HTML attributes', value: conversions.value.kebab },
  { label: 'SCREAMING_SNAKE_CASE', description: 'Used for constants and environment variables', value: conversions.value.screaming },
  { label: 'Title Case', description: 'Used in headings and titles', value: conversions.value.title },
])

function clear() {
  input.value = ''
}
</script>
