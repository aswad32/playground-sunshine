<script setup lang="ts">
import {
  Braces, KeyRound, Binary, Fingerprint, Clock, Link, CalendarClock,
  Search, Hash, Database, QrCode, FileText, Table2, Image, GitCompare,
  AlignLeft, FileKey, Code, ShieldCheck, CaseSensitive, AlignJustify, ArrowLeftRight, Pipette, Contrast,
  Grid3x3, LayoutGrid, Gamepad2, Network, Sparkles, Bomb,
} from 'lucide-vue-next'
import tools, { CATEGORY_ORDER } from '~/data/tools'

const iconMap: Record<string, unknown> = {
  Braces, KeyRound, Binary, Fingerprint, Clock, Link, CalendarClock,
  Search, Hash, Database, QrCode, FileText, Table2, Image, GitCompare,
  AlignLeft, FileKey, Code, ShieldCheck, CaseSensitive, AlignJustify, ArrowLeftRight, Pipette, Contrast,
  Grid3x3, LayoutGrid, Gamepad2, Network, Sparkles, Bomb,
}

const groups = computed(() =>
  CATEGORY_ORDER
    .map((cat) => ({ category: cat, tools: tools.filter((t) => t.category === cat) }))
    .filter((g) => g.tools.length > 0),
)

function catToId(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function scrollTo(category: string) {
  document.getElementById(catToId(category))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

useSeoMeta({
  title: 'Playground Sunshine — Free Developer Tools',
  description: 'A collection of fast, free, privacy-friendly tools for developers. No login required.',
})
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-12">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-3">
        Playground Sunshine ☀️
      </h1>
      <p class="text-lg text-gray-500">
        Fast, free, privacy-friendly tools for developers. Everything runs in your browser.
      </p>
    </header>

    <!-- Category pills -->
    <nav aria-label="Jump to category" class="mb-10 -mx-4 px-4 overflow-x-auto">
      <ul class="flex gap-2 w-max mx-auto">
        <li v-for="group in groups" :key="group.category">
          <button
            type="button"
            class="whitespace-nowrap rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
            @click="scrollTo(group.category)"
          >
            {{ group.category }}
          </button>
        </li>
      </ul>
    </nav>

    <div v-if="groups.length > 0" class="space-y-10">
      <section v-for="group in groups" :key="group.category" :id="catToId(group.category)" class="scroll-mt-6">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          {{ group.category }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="tool in group.tools"
            :key="tool.route"
            :to="tool.route"
            class="group block rounded-xl border border-gray-200 bg-white p-5 hover:border-yellow-400 hover:shadow-sm transition-all"
          >
            <div class="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-50 text-yellow-500 group-hover:bg-yellow-100 transition-colors">
              <component :is="iconMap[tool.icon]" class="w-5 h-5" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">{{ tool.name }}</h3>
            <p class="text-sm text-gray-500">{{ tool.description }}</p>
          </NuxtLink>
        </div>
      </section>
    </div>

    <div v-else class="text-center text-gray-400 py-24">
      <p class="text-lg">Tools coming soon.</p>
    </div>
  </main>
</template>
