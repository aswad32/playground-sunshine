<script setup lang="ts">
import { ChevronRight, Github } from 'lucide-vue-next'
import tools from '~/data/tools'

const route = useRoute()

const isToolPage = computed(() => route.path.startsWith('/tools/'))

const currentTool = computed(() =>
  isToolPage.value ? tools.find((t) => t.route === route.path) ?? null : null,
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
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
    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between text-sm text-gray-400">
        <div class="flex items-center gap-4">
          <span>© {{ new Date().getFullYear() }} Playground Sunshine. Open source and free to use.</span>
          <NuxtLink to="/privacy" class="hover:text-gray-700 transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-gray-700 transition-colors">Terms of Use</NuxtLink>
        </div>
        <a
          href="https://github.com/aswad32/playground-sunshine"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
          aria-label="View source on GitHub"
        >
          <Github class="w-4 h-4" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  </div>
</template>
