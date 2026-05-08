<template>
  <div class="space-y-1">
    <div class="flex items-center gap-3">
      <span class="w-10 text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">{{ label }}</span>
      <input
        :value="value"
        :class="[
          'flex-1 rounded-lg border px-3 py-2 text-sm font-mono text-gray-800 outline-none transition-colors',
          'focus:ring-2',
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-200'
            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200',
        ]"
        :aria-label="`${label} color value`"
        :aria-invalid="!!error"
        @input="$emit('update', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <button
        :aria-label="`Copy ${label}`"
        :disabled="!value || !!error"
        class="shrink-0 p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="copy"
      >
        <component :is="copied ? CheckIcon : CopyIcon" class="w-4 h-4" />
      </button>
    </div>
    <p
      v-if="error"
      class="ml-14 text-xs text-red-600"
      role="alert"
      aria-live="polite"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Copy as CopyIcon, Check as CheckIcon } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  value: string
  error: string | null
}>()

defineEmits<{
  update: [value: string]
  blur: []
}>()

const copied = ref(false)

async function copy() {
  if (!props.value || props.error) return
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>
