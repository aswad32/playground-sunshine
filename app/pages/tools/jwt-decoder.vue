<script setup lang="ts">
import { AlertTriangle, ShieldOff } from 'lucide-vue-next'
import { decodeJwt } from '~/utils/jwtDecoder'

useSeoMeta({
  title: 'JWT Decoder - Playground Sunshine',
  description: 'Decode a JWT token and inspect its header and payload directly in your browser with this free, privacy-friendly tool.',
})

const input = ref('')
const result = computed(() => decodeJwt(input.value))

const { copy: copyPayload, copied: copiedPayload } = useClipboard()
const { copy: copyHeader, copied: copiedHeader } = useClipboard()

function clear() {
  input.value = ''
}

const formattedHeader = computed(() =>
  result.value.header ? JSON.stringify(result.value.header, null, 2) : '',
)

const formattedPayload = computed(() =>
  result.value.payload ? JSON.stringify(result.value.payload, null, 2) : '',
)

const expiresLabel = computed(() => {
  if (!result.value.expiresAt) return null
  return result.value.expiresAt.toLocaleString()
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">JWT Decoder</h1>
      <p class="text-gray-500 text-sm">Decode a JWT token and inspect its contents without sending it anywhere.</p>
    </header>

    <!-- Security warning -->
    <div class="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <ShieldOff :size="16" class="mt-0.5 shrink-0" aria-hidden="true" />
      <span>Do not paste production tokens or secrets unless you fully trust this environment. This tool runs entirely in your browser.</span>
    </div>

    <!-- Input -->
    <div class="flex flex-col gap-2 mb-6">
      <label for="jwt-input" class="text-sm font-medium text-gray-700">JWT Token</label>
      <textarea
        id="jwt-input"
        v-model="input"
        placeholder="Paste your JWT here — eyJhbGci..."
        rows="4"
        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none resize-none"
        spellcheck="false"
      />
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          @click="clear"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Error -->
    <p
      v-if="result.error"
      role="alert"
      aria-live="polite"
      class="mb-6 text-sm text-red-600"
    >
      {{ result.error }}
    </p>

    <!-- Expired warning -->
    <div
      v-if="result.isExpired"
      class="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle :size="16" class="shrink-0" aria-hidden="true" />
      <span>This token expired on {{ expiresLabel }}.</span>
    </div>

    <!-- Expiry info (not expired) -->
    <div
      v-else-if="result.expiresAt"
      class="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
    >
      Expires: <span class="font-medium text-gray-800">{{ expiresLabel }}</span>
    </div>

    <!-- Decoded sections -->
    <div v-if="result.header" class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Header</span>
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="copyHeader(formattedHeader)"
          >
            {{ copiedHeader ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <pre class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 overflow-x-auto">{{ formattedHeader }}</pre>
      </div>

      <!-- Payload -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Payload</span>
          <button
            type="button"
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            @click="copyPayload(formattedPayload)"
          >
            {{ copiedPayload ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <pre class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 overflow-x-auto">{{ formattedPayload }}</pre>
      </div>

      <!-- Signature -->
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium text-gray-700">Signature <span class="font-normal text-gray-400">(not verified)</span></span>
        <pre class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-500 break-all whitespace-pre-wrap">{{ result.signature }}</pre>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-10 text-xs text-gray-400">
      Your token is decoded locally and never sent to a server. Signature verification is not performed.
    </p>
  </main>
</template>
