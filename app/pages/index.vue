<script setup lang="ts">
import tools from '~/data/tools'

useSeoMeta({
  title: 'Playground Sunshine — Free Developer Tools',
  description: 'A collection of fast, free, privacy-friendly tools for developers. No login required.',
})
</script>

<template>
  <main class="max-w-5xl mx-auto px-4 py-12">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-3">
        Playground Sunshine ☀️
      </h1>
      <p class="text-lg text-gray-500">
        Fast, free, privacy-friendly tools for developers. Everything runs in your browser.
      </p>
    </header>

    <div v-if="tools.length > 0" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="tool in tools"
        :key="tool.route"
        :to="tool.route"
        class="block rounded-xl border border-gray-200 bg-white p-5 hover:border-yellow-400 hover:shadow-sm transition-all"
      >
        <h2 class="text-base font-semibold text-gray-900 mb-1">{{ tool.name }}</h2>
        <p class="text-sm text-gray-500">{{ tool.description }}</p>
      </NuxtLink>
    </div>

    <div v-else class="text-center text-gray-400 py-24">
      <p class="text-lg">Tools coming soon.</p>
    </div>
  </main>
</template>
