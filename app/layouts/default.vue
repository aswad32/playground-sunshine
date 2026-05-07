<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import tools from '~/data/tools'

const route = useRoute()

const isToolPage = computed(() => route.path.startsWith('/tools/'))

const currentTool = computed(() =>
  isToolPage.value ? tools.find((t) => t.route === route.path) ?? null : null,
)
</script>

<template>
  <div>
    <!-- Top bar -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 h-12 flex items-center gap-2 text-sm">
        <!-- Site name / home link -->
        <NuxtLink
          to="/"
          class="font-semibold text-gray-900 hover:text-yellow-500 transition-colors shrink-0"
        >
          Playground Sunshine ☀️
        </NuxtLink>

        <!-- Breadcrumb — only on tool pages -->
        <template v-if="isToolPage">
          <ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
          <NuxtLink
            to="/"
            class="text-gray-500 hover:text-indigo-600 transition-colors"
          >
            All Tools
          </NuxtLink>
          <template v-if="currentTool">
            <ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="text-gray-700 font-medium truncate">{{ currentTool.name }}</span>
          </template>
        </template>
      </div>
    </header>

    <!-- Page content -->
    <slot />
  </div>
</template>
