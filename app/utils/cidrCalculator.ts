export type AddressType =
  | 'Private'
  | 'Public'
  | 'Loopback'
  | 'Link-local'
  | 'Multicast'
  | 'Reserved'
  | 'Limited broadcast'
  | 'Default route'
  | 'Documentation / Test-Net'
  | 'Carrier-grade NAT'
  | 'Unspecified'
  | 'IETF Protocol'

export interface CidrResult {
  cidr: string
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstHost: string
  lastHost: string
  usableHosts: number
  totalAddresses: number
  ipClass: string
  addressType: AddressType
  binaryMask: string
}

// --- Low-level helpers ---

export function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0)
}

export function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.')
}

export function cidrToMask(prefix: number): string {
  if (prefix === 0) return '0.0.0.0'
  const mask = (0xffffffff << (32 - prefix)) >>> 0
  return intToIp(mask)
}

export function maskToCidr(mask: string): number {
  const n = ipToInt(mask)
  // Count leading 1-bits
  let bits = 0
  for (let i = 31; i >= 0; i--) {
    if ((n >>> i) & 1) bits++
    else break
  }
  return bits
}

export function maskToBinary(mask: string): string {
  return mask
    .split('.')
    .map((o) => Number(o).toString(2).padStart(8, '0'))
    .join('.')
}

// --- Address classification ---

type Range = { base: number; mask: number; type: AddressType }

// Checked in order — first match wins
const ADDRESS_RANGES: Range[] = [
  // Default route — must come before Unspecified
  { base: ipToInt('0.0.0.0'), mask: (0xffffffff << 32) >>> 0, type: 'Default route' }, // /0 exact: base 0, mask 0
  { base: ipToInt('0.0.0.0'), mask: cidrToMaskInt(8), type: 'Unspecified' },
  { base: ipToInt('10.0.0.0'), mask: cidrToMaskInt(8), type: 'Private' },
  { base: ipToInt('100.64.0.0'), mask: cidrToMaskInt(10), type: 'Carrier-grade NAT' },
  { base: ipToInt('127.0.0.0'), mask: cidrToMaskInt(8), type: 'Loopback' },
  { base: ipToInt('169.254.0.0'), mask: cidrToMaskInt(16), type: 'Link-local' },
  { base: ipToInt('172.16.0.0'), mask: cidrToMaskInt(12), type: 'Private' },
  { base: ipToInt('192.0.0.0'), mask: cidrToMaskInt(24), type: 'IETF Protocol' },
  { base: ipToInt('192.0.2.0'), mask: cidrToMaskInt(24), type: 'Documentation / Test-Net' },
  { base: ipToInt('192.168.0.0'), mask: cidrToMaskInt(16), type: 'Private' },
  { base: ipToInt('198.18.0.0'), mask: cidrToMaskInt(15), type: 'Carrier-grade NAT' },
  { base: ipToInt('198.51.100.0'), mask: cidrToMaskInt(24), type: 'Documentation / Test-Net' },
  { base: ipToInt('203.0.113.0'), mask: cidrToMaskInt(24), type: 'Documentation / Test-Net' },
  { base: ipToInt('224.0.0.0'), mask: cidrToMaskInt(4), type: 'Multicast' },
  { base: ipToInt('255.255.255.255'), mask: 0xffffffff, type: 'Limited broadcast' },
  { base: ipToInt('240.0.0.0'), mask: cidrToMaskInt(4), type: 'Reserved' },
]

function cidrToMaskInt(prefix: number): number {
  if (prefix === 0) return 0
  return (0xffffffff << (32 - prefix)) >>> 0
}

export function getAddressType(ip: string): AddressType {
  const n = ipToInt(ip)
  for (const range of ADDRESS_RANGES) {
    if (range.mask === 0) {
      // /0 — matches everything; we use it only for 0.0.0.0 default route
      if (n === 0) return 'Default route'
      continue
    }
    if ((n & range.mask) >>> 0 === range.base) return range.type
  }
  return 'Public'
}

// --- IP Class ---

export function getIpClass(ip: string): string {
  const first = Number(ip.split('.')[0])
  if (first === 127) return 'Loopback'
  if (first >= 1 && first <= 126) return 'A'
  if (first >= 128 && first <= 191) return 'B'
  if (first >= 192 && first <= 223) return 'C'
  if (first >= 224 && first <= 239) return 'D'
  return 'E'
}

// --- Validation ---

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255)
}

export function isValidMask(mask: string): boolean {
  if (!isValidIp(mask)) return false
  const n = ipToInt(mask)
  // A valid subnet mask has contiguous leading 1s — (n + (n & -n)) must be a power of 2 or 0
  const flipped = (~n) >>> 0
  return (flipped & (flipped + 1)) === 0
}

// --- Core calculators ---

function buildResult(ip: string, prefix: number): CidrResult {
  const prefixMaskInt = cidrToMaskInt(prefix)
  const ipInt = ipToInt(ip)
  const networkInt = (ipInt & prefixMaskInt) >>> 0
  const broadcastInt = (networkInt | (~prefixMaskInt >>> 0)) >>> 0
  const totalAddresses = Math.pow(2, 32 - prefix)
  const usableHosts = prefix >= 31 ? 0 : totalAddresses - 2
  const firstHostInt = prefix >= 31 ? networkInt : (networkInt + 1) >>> 0
  const lastHostInt = prefix >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0
  const subnetMask = cidrToMask(prefix)
  const wildcardInt = (~prefixMaskInt) >>> 0
  const networkIp = intToIp(networkInt)

  return {
    cidr: `${networkIp}/${prefix}`,
    networkAddress: networkIp,
    broadcastAddress: intToIp(broadcastInt),
    subnetMask,
    wildcardMask: intToIp(wildcardInt),
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    usableHosts: Math.max(0, usableHosts),
    totalAddresses,
    ipClass: getIpClass(networkIp),
    addressType: getAddressType(networkIp),
    binaryMask: maskToBinary(subnetMask),
  }
}

export function parseCidr(input: string): CidrResult | null {
  const trimmed = input.trim()
  const match = trimmed.match(/^([0-9.]+)\/(\d+)$/)
  if (!match) return null
  const [, ip, prefixStr] = match
  const prefix = Number(prefixStr)
  if (!isValidIp(ip) || prefix < 0 || prefix > 32) return null
  return buildResult(ip, prefix)
}

export function parseIpMask(ip: string, mask: string): CidrResult | null {
  if (!isValidIp(ip) || !isValidMask(mask)) return null
  const prefix = maskToCidr(mask)
  return buildResult(ip, prefix)
}
