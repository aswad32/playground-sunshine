<script setup lang="ts">
import { parseCidr, parseIpMask, isValidIp, isValidMask } from '~/utils/cidrCalculator'
import type { CidrResult } from '~/utils/cidrCalculator'

useSeoMeta({
  title: 'CIDR Calculator - Playground Sunshine',
  description: 'Calculate network address, broadcast, subnet mask, host range, and more from any IPv4 CIDR block — directly in your browser.',
})

type Mode = 'cidr' | 'mask'

const mode = ref<Mode>('cidr')

// CIDR mode
const cidrInput = ref('')

// Mask mode
const ipInput = ref('')
const maskInput = ref('')

const result = ref<CidrResult | null>(null)
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

    if (mode.value === 'cidr') {
      if (!cidrInput.value.trim()) return
      const r = parseCidr(cidrInput.value)
      if (!r) {
        error.value = validateCidrInput(cidrInput.value)
      } else {
        result.value = r
      }
    } else {
      if (!ipInput.value.trim() && !maskInput.value.trim()) return
      const r = parseIpMask(ipInput.value, maskInput.value)
      if (!r) {
        error.value = validateMaskInput(ipInput.value, maskInput.value)
      } else {
        result.value = r
      }
    }
  }, 200)
}

function validateCidrInput(input: string): string {
  const match = input.trim().match(/^([0-9.]+)\/(\d+)$/)
  if (!match) return 'Enter a valid CIDR, e.g. 192.168.1.0/24.'
  const prefix = Number(match[2])
  if (!isValidIp(match[1])) return 'Invalid IP address. Each octet must be 0–255.'
  if (prefix < 0 || prefix > 32) return 'Prefix length must be between 0 and 32.'
  return 'Invalid CIDR notation.'
}

function validateMaskInput(ip: string, mask: string): string {
  if (!isValidIp(ip)) return 'Invalid IP address. Each octet must be 0–255.'
  if (!isValidMask(mask)) return "That doesn't look like a valid subnet mask."
  return 'Invalid input.'
}

function switchMode(m: Mode) {
  mode.value = m
  result.value = null
  error.value = null
  cidrInput.value = ''
  ipInput.value = ''
  maskInput.value = ''
}

function clear() {
  cidrInput.value = ''
  ipInput.value = ''
  maskInput.value = ''
  result.value = null
  error.value = null
}

function copyAll() {
  if (!result.value) return
  const r = result.value
  const text = [
    `CIDR Notation:     ${r.cidr}`,
    `Network Address:   ${r.networkAddress}`,
    `Broadcast Address: ${r.broadcastAddress}`,
    `Subnet Mask:       ${r.subnetMask}`,
    `Wildcard Mask:     ${r.wildcardMask}`,
    `First Usable Host: ${r.firstHost}`,
    `Last Usable Host:  ${r.lastHost}`,
    `Usable Hosts:      ${r.usableHosts.toLocaleString()}`,
    `Total Addresses:   ${r.totalAddresses.toLocaleString()}`,
    `IP Class:          ${r.ipClass}`,
    `Address Type:      ${r.addressType}`,
    `Binary Mask:       ${r.binaryMask}`,
  ].join('\n')
  copy(text)
}

const fields: { key: keyof CidrResult; label: string }[] = [
  { key: 'cidr', label: 'CIDR Notation' },
  { key: 'networkAddress', label: 'Network Address' },
  { key: 'broadcastAddress', label: 'Broadcast Address' },
  { key: 'subnetMask', label: 'Subnet Mask' },
  { key: 'wildcardMask', label: 'Wildcard Mask' },
  { key: 'firstHost', label: 'First Usable Host' },
  { key: 'lastHost', label: 'Last Usable Host' },
  { key: 'usableHosts', label: 'Usable Hosts' },
  { key: 'totalAddresses', label: 'Total Addresses' },
  { key: 'ipClass', label: 'IP Class' },
  { key: 'addressType', label: 'Address Type' },
  { key: 'binaryMask', label: 'Binary Subnet Mask' },
]

const addressTypeColour: Record<string, string> = {
  'Private': 'bg-green-50 text-green-700',
  'Public': 'bg-blue-50 text-blue-700',
  'Loopback': 'bg-purple-50 text-purple-700',
  'Link-local': 'bg-orange-50 text-orange-700',
  'Multicast': 'bg-pink-50 text-pink-700',
  'Reserved': 'bg-red-50 text-red-700',
  'Limited broadcast': 'bg-red-50 text-red-700',
  'Default route': 'bg-gray-100 text-gray-600',
  'Documentation / Test-Net': 'bg-yellow-50 text-yellow-700',
  'Carrier-grade NAT': 'bg-teal-50 text-teal-700',
  'Unspecified': 'bg-gray-100 text-gray-500',
  'IETF Protocol': 'bg-indigo-50 text-indigo-700',
}
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">CIDR Calculator</h1>
      <p class="text-gray-500 text-sm">
        Calculate network address, broadcast, subnet mask, host range, and more from any IPv4 CIDR block.
      </p>
    </header>

    <!-- Mode toggle -->
    <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 mb-6">
      <button
        type="button"
        :class="mode === 'cidr'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
        @click="switchMode('cidr')"
      >
        CIDR Notation
      </button>
      <button
        type="button"
        :class="mode === 'mask'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
        class="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
        @click="switchMode('mask')"
      >
        Subnet Mask
      </button>
    </div>

    <!-- Input — CIDR mode -->
    <div v-if="mode === 'cidr'" class="flex flex-col gap-2 mb-6">
      <label for="cidr-input" class="text-sm font-medium text-gray-700">CIDR Notation</label>
      <input
        id="cidr-input"
        v-model="cidrInput"
        type="text"
        placeholder="e.g. 192.168.1.0/24"
        spellcheck="false"
        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
        @input="calculate"
        @blur="calculate"
      />
    </div>

    <!-- Input — Subnet Mask mode -->
    <div v-else class="grid sm:grid-cols-2 gap-4 mb-6">
      <div class="flex flex-col gap-2">
        <label for="ip-input" class="text-sm font-medium text-gray-700">IP Address</label>
        <input
          id="ip-input"
          v-model="ipInput"
          type="text"
          placeholder="e.g. 192.168.1.0"
          spellcheck="false"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
          @input="calculate"
          @blur="calculate"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="mask-input" class="text-sm font-medium text-gray-700">Subnet Mask</label>
        <input
          id="mask-input"
          v-model="maskInput"
          type="text"
          placeholder="e.g. 255.255.255.0"
          spellcheck="false"
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

    <!-- Results -->
    <div v-if="result" class="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div
        v-for="field in fields"
        :key="field.key"
        class="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
      >
        <span class="text-sm text-gray-500 shrink-0 w-40">{{ field.label }}</span>
        <span
          v-if="field.key === 'addressType'"
          :class="addressTypeColour[result.addressType] ?? 'bg-gray-100 text-gray-600'"
          class="text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {{ result[field.key] }}
        </span>
        <span
          v-else-if="field.key === 'usableHosts' || field.key === 'totalAddresses'"
          class="font-mono text-sm text-gray-800 flex-1 text-right"
        >
          {{ Number(result[field.key]).toLocaleString() }}
        </span>
        <span v-else class="font-mono text-sm text-gray-800 flex-1 break-all text-right">
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
      IP addresses are processed locally and never sent to a server.
    </p>
  </main>
</template>
