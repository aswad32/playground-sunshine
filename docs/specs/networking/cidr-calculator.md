# CIDR Calculator Spec

## Goal

Allow users to enter an IPv4 address in CIDR notation (e.g. `192.168.1.0/24`) and instantly see all derived network information — network address, broadcast, usable host range, subnet mask, and more. Also support the reverse: enter an IP + dotted subnet mask to get the CIDR notation.

## Route

`/tools/cidr-calculator`

## Category

Networking *(new category — add to `CATEGORY_ORDER` in `data/tools.ts`)*

## Icon

`Network` (lucide-vue-next)

---

## Inputs

### Mode A — CIDR notation (primary)

A single text field accepting an IPv4 CIDR string:

```
192.168.1.0/24
10.0.0.1/8
172.16.0.0/12
```

- Prefix length must be `0–32`
- The host bits of the IP do not need to be zeroed — the tool will normalise to the network address automatically (e.g. `192.168.1.45/24` → network `192.168.1.0`)

### Mode B — IP + Subnet Mask

Two separate fields:

- **IP Address** — dotted-decimal, e.g. `192.168.1.0`
- **Subnet Mask** — dotted-decimal, e.g. `255.255.255.0`

Entering a valid combination auto-populates the CIDR field and shows results.

Modes are toggled with a small segmented control ("CIDR" / "Subnet Mask") above the input.

---

## Output

All fields are read-only, displayed in a clean info grid (2-column on desktop, stacked on mobile).

| Field | Example |
|---|---|
| **CIDR Notation** | `192.168.1.0/24` |
| **Network Address** | `192.168.1.0` |
| **Broadcast Address** | `192.168.1.255` |
| **Subnet Mask** | `255.255.255.0` |
| **Wildcard Mask** | `0.0.0.255` |
| **First Usable Host** | `192.168.1.1` |
| **Last Usable Host** | `192.168.1.254` |
| **Usable Hosts** | `254` |
| **Total Addresses** | `256` |
| **IP Class** | `C` |
| **Address Type** | `Private` |
| **Binary Subnet Mask** | `11111111.11111111.11111111.00000000` |

Each row has a **Copy** button for its value.

### IP Class detection

| Range | Class |
|---|---|
| `1.0.0.0` – `126.255.255.255` | A |
| `128.0.0.0` – `191.255.255.255` | B |
| `192.0.0.0` – `223.255.255.255` | C |
| `224.0.0.0` – `239.255.255.255` | D (Multicast) |
| `240.0.0.0` – `255.255.255.255` | E (Reserved) |
| `127.x.x.x` | Loopback |

### Address Type detection

A single label describing the character of the address, checked in priority order:

| Range | Address Type |
|---|---|
| `0.0.0.0/0` (exact) | Default route |
| `0.0.0.0/8` | Unspecified |
| `10.0.0.0/8` | Private |
| `100.64.0.0/10` | Carrier-grade NAT |
| `127.0.0.0/8` | Loopback |
| `169.254.0.0/16` | Link-local |
| `172.16.0.0/12` | Private |
| `192.0.0.0/24` | IETF Protocol |
| `192.0.2.0/24` | Documentation / Test-Net-1 |
| `192.168.0.0/16` | Private |
| `198.18.0.0/15` | Carrier-grade NAT |
| `198.51.100.0/24` | Documentation / Test-Net-2 |
| `203.0.113.0/24` | Documentation / Test-Net-3 |
| `224.0.0.0/4` | Multicast |
| `240.0.0.0/4` | Reserved |
| `255.255.255.255/32` | Limited broadcast |
| *(everything else)* | Public |

---

## Behaviour

- Results update live as the user types (debounced ~200 ms)
- If the input is incomplete or invalid, results are cleared (not shown)
- No error banner for mid-typing states — only show a validation message after the user blurs the field or presses Enter with an invalid value
- A **Clear** button resets all inputs and output
- A **Copy All** button copies a formatted plain-text summary of all fields to the clipboard

---

## Error Handling

| Condition | Message |
|---|---|
| Invalid IP octet (> 255 or non-numeric) | `Invalid IP address. Each octet must be 0–255.` |
| Prefix length out of range | `Prefix length must be between 0 and 32.` |
| Invalid subnet mask (non-contiguous bits) | `That doesn't look like a valid subnet mask.` |
| Empty input | *(no message — just clear the output)* |

---

## Privacy

This tool performs all calculations in the browser. No IP addresses are sent to any server.

---

## Utility (`utils/cidrCalculator.ts`)

Pure functions, no Vue reactivity.

```ts
type AddressType =
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

interface CidrResult {
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

function parseCidr(input: string): CidrResult   // "192.168.1.0/24"
function parseIpMask(ip: string, mask: string): CidrResult
function ipToInt(ip: string): number             // must return unsigned 32-bit int — see note below
function intToIp(n: number): string
function maskToCidr(mask: string): number        // "255.255.255.0" → 24
function cidrToMask(prefix: number): string      // 24 → "255.255.255.0"
function maskToBinary(mask: string): string      // "255.255.255.0" → "11111111.11111111.11111111.00000000"
function getAddressType(ip: string): AddressType
```

### Implementation note — unsigned-safe IPv4 math

JavaScript bitwise operators work on **signed 32-bit integers**. Shifting a high-octet IP like `192.x.x.x` sets bit 31, which makes the result negative:

```ts
// WRONG — returns a negative number for IPs ≥ 128.x.x.x
(192 << 24) // -1073741824

// CORRECT — force unsigned interpretation with >>> 0
(192 << 24) >>> 0 // 3221225472
```

All bitwise operations in `ipToInt`, `cidrToMask`, and any masking arithmetic **must** apply `>>> 0` to force an unsigned result. Functions must never return a negative integer for a valid IPv4 address.

```ts
// Reference implementations
function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) | Number(octet)) >>> 0, 0)
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8)  & 0xff,
    n          & 0xff,
  ].join('.')
}
```
```

---

## Tests (`tests/cidrCalculator.test.ts`)

- `parseCidr('192.168.1.0/24')` returns correct network, broadcast, hosts, mask
- `ipToInt('192.168.1.0')` returns `3232235776` (not a negative number)
- `parseCidr('10.0.0.1/8')` normalises to `10.0.0.0`, returns class A, private
- `parseCidr('0.0.0.0/0')` handles default route (0 usable hosts edge case)
- `parseCidr('192.168.1.1/32')` handles /32 (single host: 1 total, 0 usable)
- `parseCidr('10.0.0.0/31')` handles /31 (point-to-point: 2 total, 0 usable)
- `maskToCidr('255.255.255.0')` returns `24`
- `cidrToMask(24)` returns `'255.255.255.0'`
- `maskToBinary('255.255.255.0')` returns `'11111111.11111111.11111111.00000000'`
- Invalid CIDR throws or returns null
- `parseIpMask('192.168.1.0', '255.255.255.0')` matches `parseCidr('192.168.1.0/24')`
- `getAddressType('192.168.1.0')` returns `'Private'`
- `getAddressType('8.8.8.8')` returns `'Public'`
- `getAddressType('127.0.0.1')` returns `'Loopback'`
- `getAddressType('169.254.0.1')` returns `'Link-local'`
- `getAddressType('224.0.0.1')` returns `'Multicast'`
- `getAddressType('100.64.0.1')` returns `'Carrier-grade NAT'`
- `getAddressType('192.0.2.1')` returns `'Documentation / Test-Net'`
- `getAddressType('255.255.255.255')` returns `'Limited broadcast'`
- `getAddressType('0.0.0.0')` returns `'Default route'`

---

## SEO

```ts
useSeoMeta({
  title: 'CIDR Calculator - Playground Sunshine',
  description: 'Calculate network address, broadcast, subnet mask, host range, and more from any IPv4 CIDR block — directly in your browser.',
})
```

---

## Quality Checklist

- [ ] Works on desktop and mobile
- [ ] Live calculation as user types
- [ ] Copy button per row + Copy All
- [ ] Clear/reset
- [ ] Handles edge cases: /0, /31, /32
- [ ] Address Type shown for all 12 defined types
- [ ] Shows IP class
- [ ] Validation messages are human-readable
- [ ] No IP data sent to server
- [ ] SEO metadata set
- [ ] Tests cover core utility functions
- [ ] Listed in `data/tools.ts` under Networking
