// All IPv6 math uses BigInt to handle 128-bit values without overflow.

export type Ipv6AddressType =
  | 'Unspecified'
  | 'Loopback'
  | 'IPv4-mapped'
  | 'IPv4-IPv6 translation'
  | 'Discard-only'
  | 'Documentation'
  | 'ORCHIDv2'
  | '6to4'
  | 'Unique local'
  | 'Link-local'
  | 'Multicast'
  | 'Global unicast'

export interface Ipv6CidrResult {
  cidr: string
  networkAddress: string
  firstAddress: string
  lastAddress: string
  prefixLength: number
  hostBits: number
  totalAddresses: string
  addressType: Ipv6AddressType
  compressedAddress: string
  expandedAddress: string
  expandedNetwork: string
  subnetMask: string
  wildcardMask: string
  reverseDnsZone: string
}

// --- Low-level helpers ---

/**
 * Expand a full or compressed IPv6 address (without prefix) to 32 lowercase hex chars.
 * Throws if the address is not valid.
 */
export function expandIpv6(address: string): string {
  // Handle embedded IPv4 (e.g. ::ffff:192.0.2.1)
  const embeddedIpv4 = address.match(/^(.*):(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
  if (embeddedIpv4) {
    const prefix = embeddedIpv4[1]
    const ipv4Part = embeddedIpv4[2]
    const octets = ipv4Part.split('.').map(Number)
    if (octets.length !== 4 || octets.some(o => o < 0 || o > 255 || !Number.isInteger(o))) {
      throw new Error('The embedded IPv4 address must contain four octets from 0-255.')
    }
    const hi = (octets[0]! << 8 | octets[1]!).toString(16).padStart(4, '0')
    const lo = (octets[2]! << 8 | octets[3]!).toString(16).padStart(4, '0')
    // Replace the last IPv4 portion with hex groups
    const newAddress = prefix + ':' + hi + ':' + lo
    return expandIpv6(newAddress)
  }

  const doubleColonCount = (address.match(/::/g) || []).length
  if (doubleColonCount > 1) {
    throw new Error('IPv6 addresses can only contain one :: shorthand.')
  }

  let groups: string[]

  if (address.includes('::')) {
    const [left, right] = address.split('::')
    const leftGroups = left ? left.split(':') : []
    const rightGroups = right ? right.split(':') : []
    const missing = 8 - leftGroups.length - rightGroups.length
    if (missing < 0) {
      throw new Error('IPv6 addresses must expand to 8 groups.')
    }
    groups = [...leftGroups, ...Array(missing).fill('0'), ...rightGroups]
  } else {
    groups = address.split(':')
  }

  if (groups.length !== 8) {
    throw new Error('IPv6 addresses must expand to 8 groups.')
  }

  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) {
      throw new Error('Each IPv6 group must be 1-4 hexadecimal characters.')
    }
  }

  return groups.map(g => g.padStart(4, '0').toLowerCase()).join('')
}

/** Convert a 32-char hex string to a BigInt. */
export function hexToBigInt(hex: string): bigint {
  return BigInt('0x' + hex)
}

/** Convert a BigInt to a 32-char lowercase hex string. */
export function bigIntToHex(n: bigint): string {
  return n.toString(16).padStart(32, '0')
}

/** Format 32 hex chars as 8 colon-separated groups of 4. */
export function hexToExpandedAddress(hex: string): string {
  return hex.match(/.{4}/g)!.join(':')
}

/** Compress an expanded IPv6 address (colon-separated 8 groups of 4 hex chars). */
export function compressIpv6(expanded: string): string {
  const groups = expanded.split(':')

  // Find the longest run of consecutive all-zero groups
  let bestStart = -1
  let bestLen = 0
  let curStart = -1
  let curLen = 0

  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0000') {
      if (curStart === -1) { curStart = i; curLen = 1 }
      else curLen++
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen }
    } else {
      curStart = -1; curLen = 0
    }
  }

  let result: string
  if (bestLen >= 2) {
    const left = groups.slice(0, bestStart).map(g => parseInt(g, 16).toString(16))
    const right = groups.slice(bestStart + bestLen).map(g => parseInt(g, 16).toString(16))
    result = left.join(':') + '::' + right.join(':')
    // Clean up leading/trailing colons from empty sides
    result = result.replace(/^:([^:])/, '$1').replace(/([^:]):$/, '$1')
    if (result === ':') result = '::'
  } else {
    result = groups.map(g => parseInt(g, 16).toString(16)).join(':')
  }

  return result
}

/** Build the subnet mask BigInt from prefix length. */
function prefixToMaskBigInt(prefix: number): bigint {
  if (prefix === 0) return 0n
  return ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - prefix)) - 1n)
}

/** Format a BigInt address as expanded colon notation (8 groups of 4 hex). */
function bigIntToExpandedAddress(n: bigint): string {
  return hexToExpandedAddress(bigIntToHex(n))
}

/** Format a BigInt as a compressed IPv6 address. */
function bigIntToCompressedAddress(n: bigint): string {
  return compressIpv6(bigIntToExpandedAddress(n))
}

// --- Address type detection ---

interface Ipv6Range {
  base: bigint
  mask: bigint
  type: Ipv6AddressType
}

function rangeFromCidr(cidrStr: string): { base: bigint; mask: bigint } {
  const [addr, prefix] = cidrStr.split('/')
  const p = Number(prefix)
  const hex = expandIpv6(addr!)
  const base = hexToBigInt(hex)
  const mask = prefixToMaskBigInt(p)
  return { base: base & mask, mask }
}

const ADDRESS_RANGES: Ipv6Range[] = [
  { ...rangeFromCidr('::/128'), type: 'Unspecified' },
  { ...rangeFromCidr('::1/128'), type: 'Loopback' },
  { ...rangeFromCidr('::ffff:0:0/96'), type: 'IPv4-mapped' },
  { ...rangeFromCidr('64:ff9b::/96'), type: 'IPv4-IPv6 translation' },
  { ...rangeFromCidr('100::/64'), type: 'Discard-only' },
  { ...rangeFromCidr('2001:db8::/32'), type: 'Documentation' },
  { ...rangeFromCidr('2001:20::/28'), type: 'ORCHIDv2' },
  { ...rangeFromCidr('2002::/16'), type: '6to4' },
  { ...rangeFromCidr('fc00::/7'), type: 'Unique local' },
  { ...rangeFromCidr('fe80::/10'), type: 'Link-local' },
  { ...rangeFromCidr('ff00::/8'), type: 'Multicast' },
]

export function getIpv6AddressType(addressBigInt: bigint): Ipv6AddressType {
  for (const range of ADDRESS_RANGES) {
    if ((addressBigInt & range.mask) === range.base) {
      return range.type
    }
  }
  return 'Global unicast'
}

// --- Reverse DNS zone ---

/**
 * For prefixes divisible by 4, return the ip6.arpa zone for the network prefix.
 * Otherwise return null.
 */
export function getReverseDnsZone(networkHex: string, prefix: number): string | null {
  if (prefix % 4 !== 0) return null
  const nibbles = networkHex.split('').reverse()
  // Number of nibbles to include = prefix / 4
  const count = prefix / 4
  const zone = nibbles.slice(32 - count).join('.') + '.ip6.arpa'
  return zone
}

// --- Main parse function ---

/**
 * Parse an IPv6 CIDR string like "2001:db8::1/64".
 * Returns a result object or throws a user-friendly error message.
 */
export function parseIpv6Cidr(input: string): Ipv6CidrResult {
  const trimmed = input.trim().toLowerCase()
  const slashIdx = trimmed.lastIndexOf('/')
  if (slashIdx === -1) throw new Error('Invalid IPv6 address. Check the groups, hex characters, and :: shorthand.')

  const addrPart = trimmed.slice(0, slashIdx)
  const prefixStr = trimmed.slice(slashIdx + 1)

  if (!/^\d+$/.test(prefixStr)) throw new Error('Prefix length must be between 0 and 128.')
  const prefix = Number(prefixStr)
  if (prefix < 0 || prefix > 128) throw new Error('Prefix length must be between 0 and 128.')

  // Expand address — may throw descriptive errors
  const hex = expandIpv6(addrPart)
  const addrBigInt = hexToBigInt(hex)

  const maskBigInt = prefixToMaskBigInt(prefix)
  const max128 = (1n << 128n) - 1n
  const wildcardBigInt = max128 ^ maskBigInt

  const networkBigInt = addrBigInt & maskBigInt
  const lastBigInt = networkBigInt | wildcardBigInt

  const networkHex = bigIntToHex(networkBigInt)
  const networkExpanded = bigIntToExpandedAddress(networkBigInt)
  const networkCompressed = bigIntToCompressedAddress(networkBigInt)

  const addrExpanded = bigIntToExpandedAddress(addrBigInt)
  const addrCompressed = bigIntToCompressedAddress(addrBigInt)

  const lastExpanded = bigIntToExpandedAddress(lastBigInt)
  const lastCompressed = bigIntToCompressedAddress(lastBigInt)

  const maskExpanded = bigIntToExpandedAddress(maskBigInt)
  const wildcardExpanded = bigIntToExpandedAddress(wildcardBigInt)

  const totalAddresses = wildcardBigInt + 1n
  const hostBits = 128 - prefix

  const addressType = getIpv6AddressType(addrBigInt)

  const reverseDns = getReverseDnsZone(networkHex, prefix)
  const reverseDnsZone = reverseDns ?? 'Not aligned on a DNS nibble boundary'

  return {
    cidr: networkCompressed + '/' + prefix,
    networkAddress: networkCompressed,
    firstAddress: networkCompressed,
    lastAddress: lastCompressed,
    prefixLength: prefix,
    hostBits,
    totalAddresses: totalAddresses.toLocaleString('en-US'),
    addressType,
    compressedAddress: addrCompressed,
    expandedAddress: addrExpanded,
    expandedNetwork: networkExpanded,
    subnetMask: compressIpv6(maskExpanded),
    wildcardMask: compressIpv6(wildcardExpanded),
    reverseDnsZone,
  }
}

/**
 * Parse from separate address + prefix length fields.
 */
export function parseIpv6AddressPrefix(address: string, prefix: string): Ipv6CidrResult {
  return parseIpv6Cidr(address.trim() + '/' + prefix.trim())
}
