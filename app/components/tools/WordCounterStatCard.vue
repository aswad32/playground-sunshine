<template>
  <div class="rounded-xl border border-gray-200 bg-white px-5 py-4 flex flex-col gap-1">
    <p class="text-2xl font-bold text-gray-900 tabular-nums">{{ isText ? value : value.toLocaleString() }}</p>
    <p class="text-sm font-medium text-gray-600">{{ label }}</p>
    <p v-if="description" class="text-xs text-gray-400">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  description?: string
  isText?: boolean
}>()
</script>
