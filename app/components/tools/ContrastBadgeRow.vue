<template>
  <div class="grid grid-cols-3 gap-2 items-center">
    <span class="text-sm text-gray-700">{{ label }}</span>
    <PassBadge :pass="aa" />
    <PassBadge v-if="aaa !== null" :pass="aaa" />
    <span v-else class="text-center text-xs text-gray-400">—</span>
  </div>
</template>

<script setup lang="ts">
import PassBadge from './ContrastPassBadge.vue'

defineProps<{
  label: string
  aa: boolean
  aaa: boolean | null
}>()
</script>
