<script setup lang="ts">
import { parseIpv6Cidr, parseIpv6AddressPrefix } from '~/utils/ipv6CidrCalculator'
import type { Ipv6CidrResult, Ipv6AddressType } from '~/utils/ipv6CidrCalculator'

useSeoMeta({
  title: 'IPv6 CIDR Calculator - Playground Sunshine',
  description: 'Calculate IPv6 network address, range, prefix details, address type, and reverse DNS zone from any IPv6 CIDR block — directly in your browser.',
})

type Mode = 'cidr' | 'address'

const mode = ref<Mode>('cidr')

// CIDR mode
const cidrInput = ref('')

// Address + Prefix mode
const addressInput = ref('')
const prefixInput = ref('')

const result = ref<Ipv6CidrResult | null>(null)
const error = ref<string | null>(null)

const { copy, copied } = useClipboard()
const copiedField = ref<string | null>(null)

async function copyField(key: string, value: string) {
  await copy(value)
  copiedField.value = key
  setTimeout(() => { copiedField.value = null }, 1500)
}

let debounceTimer: ReturnType<typeof setTimeout>

function calculate() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    error.value = null
    result.value = null

    try {
      if (mode.value === 'cidr') {
        if (!cidrInput.value.trim()) return
        result.value = parseIpv6Cidr(cidrInput.value)
      } else {
        if (!addressInput.value.trim() && !prefixInput.value.trim()) return
        result.value = parseIpv6AddressPrefix(addressInput.value, prefixInput.value)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Invalid input.'
    }
  }, 200)
}

function switchMode(m: Mode) {
  mode.value = m
  result.value = null
  error.value = null
  cidrInput.value = ''
  addressInput.value = ''
  prefixInput.value = ''
}

function clear() {
  cidrInput.value = ''
  addressInput.value = ''
  prefixInput.value = ''
  result.value = null
  error.value = null
}

function copyAll() {
  if (!result.value) return
  const r = result.value
  const text = [
    `CIDR Notation:       ${r.cidr}`,
    `Network Address:     ${r.networkAddress}`,
    `First Address:       ${r.firstAddress}`,
    `Last Address:        ${r.lastAddress}`,
    `Prefix Length:       /${r.prefixLength}`,
    `Host Bits:           ${r.hostBits}`,
    `Total Addresses:     ${r.totalAddresses}`,
    `Address Type:        ${r.addressType}`,
    `Compressed Address:  ${r.compressedAddress}`,
    `Expanded Address:    ${r.expandedAddress}`,
    `Expanded Network:    ${r.expandedNetwork}`,
    `Subnet Mask:         ${r.subnetMask}`,
    `Wildcard Mask:       ${r.wildcardMask}`,
    `Reverse DNS Zone:    ${r.reverseDnsZone}`,
  ].join('\n')
  copy(text)
}

interface Field {
  key: keyof Ipv6CidrResult
  label: string
}

const fields: Field[] = [
  { key: 'cidr', label: 'CIDR Notation' },
  { key: 'networkAddress', label: 'Network Address' },
  { key: 'firstAddress', label: 'First Address' },
  { key: 'lastAddress', label: 'Last Address' },
  { key: 'prefixLength', label: 'Prefix Length' },
  { key: 'hostBits', label: 'Host Bits' },
  { key: 'totalAddresses', label: 'Total Addresses' },
  { key: 'addressType', label: 'Address Type' },
  { key: 'compressedAddress', label: 'Compressed Address' },
  { key: 'expandedAddress', label: 'Expanded Address' },
  { key: 'expandedNetwork', label: 'Expanded Network' },
  { key: 'subnetMask', label: 'Subnet Mask' },
  { key: 'wildcardMask', label: 'Wildcard Mask' },
  { key: 'reverseDnsZone', label: 'Reverse DNS Zone' },
]

const addressTypeColour: Record<Ipv6AddressType, string> = {
  'Loopback': 'bg-purple-50 text-purple-700',
  'Link-local': 'bg-orange-50 text-orange-700',
  'Unique local': 'bg-green-50 text-green-700',
  'Multicast': 'bg-pink-50 text-pink-700',
  'Documentation': 'bg-yellow-50 text-yellow-700',
  'IPv4-mapped': 'bg-teal-50 text-teal-700',
  'IPv4-IPv6 translation': 'bg-teal-50 text-teal-700',
  'Discard-only': 'bg-red-50 text-red-700',
  'ORCHIDv2': 'bg-indigo-50 text-indigo-700',
  '6to4': 'bg-blue-50 text-blue-700',
  'Unspecified': 'bg-gray-100 text-gray-500',
  'Global unicast': 'bg-blue-50 text-blue-700',
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">IPv6 CIDR Calculator</h1>
      <p class="text-gray-500 text-sm">
        Calculate network address, range, prefix details, address type, and reverse DNS zone from any IPv6 CIDR block.
      </p>
    </header>

    <!-- Mode toggle -->
    <div
      class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 mb-6"
      role="group"
      aria-label="Input mode"
    >
      <button
        type="button"
        :class="mode === 'cidr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
        :aria-pressed="mode === 'cidr'"
        @click="switchMode('cidr')"
      >
        CIDR
      </button>
      <button
        type="button"
        :class="mode === 'address' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
        :aria-pressed="mode === 'address'"
        @click="switchMode('address')"
      >
        Address + Prefix
      </button>
    </div>

    <!-- Input — CIDR mode -->
    <div v-if="mode === 'cidr'" class="flex flex-col gap-2 mb-6">
      <label for="cidr-input" class="text-sm font-medium text-gray-700">IPv6 CIDR Notation</label>
      <input
        id="cidr-input"
        v-model="cidrInput"
        type="text"
        placeholder="e.g. 2001:db8::1/64"
        spellcheck="false"
        autocomplete="off"
        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
        @input="calculate"
        @blur="calculate"
      />
    </div>

    <!-- Input — Address + Prefix mode -->
    <div v-else class="grid sm:grid-cols-2 gap-4 mb-6">
      <div class="flex flex-col gap-2">
        <label for="address-input" class="text-sm font-medium text-gray-700">IPv6 Address</label>
        <input
          id="address-input"
          v-model="addressInput"
          type="text"
          placeholder="e.g. 2001:db8::1"
          spellcheck="false"
          autocomplete="off"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
          @input="calculate"
          @blur="calculate"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="prefix-input" class="text-sm font-medium text-gray-700">Prefix Length (0–128)</label>
        <input
          id="prefix-input"
          v-model="prefixInput"
          type="number"
          min="0"
          max="128"
          placeholder="e.g. 64"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
          @input="calculate"
          @blur="calculate"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 mb-6">
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        @click="clear"
      >
        Clear
      </button>
      <button
        v-if="result"
        type="button"
        class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        @click="copyAll"
      >
        {{ copied ? 'Copied!' : 'Copy All' }}
      </button>
    </div>

    <!-- Error -->
    <p
      v-if="error"
      role="alert"
      aria-live="polite"
      class="mb-6 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <!-- Empty state -->
    <p
      v-if="!result && !error"
      class="text-sm text-gray-400"
    >
      Enter an IPv6 CIDR block to calculate subnet details.
    </p>

    <!-- Results -->
    <div v-if="result" class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div
        v-for="field in fields"
        :key="field.key"
        class="flex items-start justify-between gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
      >
        <span class="text-sm text-gray-500 shrink-0 w-44">{{ field.label }}</span>

        <span
          v-if="field.key === 'addressType'"
          :class="addressTypeColour[result.addressType] ?? 'bg-gray-100 text-gray-600'"
          class="text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {{ result[field.key] }}
        </span>

        <span
          v-else-if="field.key === 'prefixLength'"
          class="font-mono text-sm text-gray-800 flex-1 text-right break-all"
        >
          /{{ result[field.key] }}
        </span>

        <span
          v-else
          class="font-mono text-sm text-gray-800 flex-1 text-right break-all"
        >
          {{ result[field.key] }}
        </span>

        <button
          type="button"
          class="shrink-0 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          :aria-label="`Copy ${field.label}`"
          @click="copyField(field.key, String(result[field.key]))"
        >
          {{ copiedField === field.key ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>

    <!-- Privacy note -->
    <p class="mt-8 text-xs text-gray-400">
      IPv6 addresses are processed locally and never sent to a server.
    </p>
  </main>
</template>
