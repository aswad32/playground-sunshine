<template>
  <div class="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ label }}</span>
        <span v-if="description" class="text-xs text-gray-400">— {{ description }}</span>
      </div>
      <p
        class="font-mono text-sm text-gray-800 break-all"
        :class="{ 'text-gray-400 italic': !value }"
      >
        {{ value || 'empty' }}
      </p>
    </div>
    <button
      :aria-label="`Copy ${label}`"
      :disabled="!value"
      class="shrink-0 mt-0.5 p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="copy"
    >
      <component :is="copied ? CheckIcon : CopyIcon" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Copy as CopyIcon, Check as CheckIcon } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  value: string
  description?: string
}>()

const copied = ref(false)

async function copy() {
  if (!props.value) return
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>
