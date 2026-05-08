<template>
  <div class="flex justify-center">
    <span
      :class="[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
      ]"
    >
      <CheckIcon v-if="pass" class="w-3 h-3" />
      <XIcon v-else class="w-3 h-3" />
      {{ pass ? 'Pass' : 'Fail' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Check as CheckIcon, X as XIcon } from 'lucide-vue-next'

defineProps<{ pass: boolean }>()
</script>
