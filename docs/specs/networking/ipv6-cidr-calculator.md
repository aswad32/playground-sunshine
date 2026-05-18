# IPv6 CIDR Calculator Spec

## Goal

Allow users to enter an IPv6 address in CIDR notation and instantly see derived subnet information, including the normalized network address, first and last address in the range, total address count, expanded/compressed forms, reverse DNS zone, and address type. This helps developers, network engineers, and students inspect IPv6 subnets without sending IP data to a server.

## Route

`/tools/ipv6-cidr-calculator`

## Category

Networking

## Icon

`Network` (lucide-vue-next)

---

## Inputs

### Mode A - IPv6 CIDR notation (primary)

A single text field accepting an IPv6 address with prefix length:

```text
2001:db8::1/64
2001:db8:abcd:12::/56
fe80::1234/64
::1/128
::/0
```

- Prefix length must be `0-128`.
- The host bits do not need to be zeroed. The tool normalizes the network address automatically, e.g. `2001:db8::1234/64` -> `2001:db8::/64`.
- Support compressed IPv6 syntax using `::`.
- Support full expanded IPv6 syntax with 8 groups.
- Support embedded IPv4 syntax, e.g. `::ffff:192.0.2.128/128`, but display normalized IPv6 hex output.

### Mode B - IPv6 address + prefix length

Two separate fields:

- **IPv6 Address** - e.g. `2001:db8::1`
- **Prefix Length** - number input `0-128`

Entering a valid combination auto-populates the CIDR field and shows results.

Modes are toggled with a segmented control: "CIDR" / "Address + Prefix".

---

## Actions

- **Calculate** - optional explicit action; results also update live as the user types
- **Copy** - copy individual output row values
- **Copy All** - copy a formatted plain-text summary
- **Clear** - reset inputs and output

---

## Output

All fields are read-only, displayed in a clean info grid with copy buttons. Use 2 columns on desktop and a single column on mobile.

| Field | Example |
|---|---|
| **CIDR Notation** | `2001:db8::/64` |
| **Network Address** | `2001:db8::` |
| **First Address** | `2001:db8::` |
| **Last Address** | `2001:db8::ffff:ffff:ffff:ffff` |
| **Prefix Length** | `64` |
| **Host Bits** | `64` |
| **Total Addresses** | `18,446,744,073,709,551,616` |
| **Address Type** | `Documentation` |
| **Compressed Address** | `2001:db8::1` |
| **Expanded Address** | `2001:0db8:0000:0000:0000:0000:0000:0001` |
| **Expanded Network** | `2001:0db8:0000:0000:0000:0000:0000:0000` |
| **Subnet Mask** | `ffff:ffff:ffff:ffff::` |
| **Wildcard Mask** | `::ffff:ffff:ffff:ffff` |
| **Reverse DNS Zone** | `8.b.d.0.1.0.0.2.ip6.arpa` for `/32` |

### Address Type detection

A single label describing the address, checked in priority order:

| Range | Address Type |
|---|---|
| `::/128` | Unspecified |
| `::1/128` | Loopback |
| `::ffff:0:0/96` | IPv4-mapped |
| `64:ff9b::/96` | IPv4-IPv6 translation |
| `100::/64` | Discard-only |
| `2001:db8::/32` | Documentation |
| `2001:20::/28` | ORCHIDv2 |
| `2002::/16` | 6to4 |
| `fc00::/7` | Unique local |
| `fe80::/10` | Link-local |
| `ff00::/8` | Multicast |
| *(everything else)* | Global unicast |

### Reverse DNS Zone

For prefixes divisible by 4, show the corresponding nibble-reversed `ip6.arpa` zone for the network prefix.

Examples:

| CIDR | Reverse DNS Zone |
|---|---|
| `2001:db8::/32` | `8.b.d.0.1.0.0.2.ip6.arpa` |
| `2001:db8:abcd::/48` | `d.c.b.a.8.b.d.0.1.0.0.2.ip6.arpa` |

If the prefix is not divisible by 4, show: `Not aligned on a DNS nibble boundary`.

---

## Layout

- Page title and short privacy-focused description at the top
- Segmented control for input mode
- Input row below the mode selector
- Output info grid below inputs
- Copy All and Clear buttons near the output header
- Empty state: "Enter an IPv6 CIDR block to calculate subnet details."
- No loading state is needed; calculations are synchronous and local

Mobile layout stacks controls, inputs, and output rows vertically. Long IPv6 values should wrap or use horizontal scrolling inside the value area without overflowing the page.

---

## Behaviour

- Results update live as the user types, debounced by about 200 ms.
- Incomplete input clears the output and does not show an error while typing.
- Show validation messages after blur or after pressing Enter with invalid input.
- Normalize output to lowercase hex.
- Preserve the user's raw input while displaying normalized output separately.
- For very large totals, display address counts as formatted decimal strings generated from `BigInt`.
- Do not use JavaScript `number` for 128-bit IPv6 math.

---

## Error Handling

| Condition | Message |
|---|---|
| Invalid IPv6 address | `Invalid IPv6 address. Check the groups, hex characters, and :: shorthand.` |
| More than one `::` shorthand | `IPv6 addresses can only contain one :: shorthand.` |
| Invalid group value | `Each IPv6 group must be 1-4 hexadecimal characters.` |
| Wrong number of groups | `IPv6 addresses must expand to 8 groups.` |
| Prefix length out of range | `Prefix length must be between 0 and 128.` |
| Invalid embedded IPv4 address | `The embedded IPv4 address must contain four octets from 0-255.` |
| Empty input | *(no message - just clear the output)* |

Never show raw stack traces.

---

## Privacy

This tool performs all IPv6 parsing and subnet calculations in the browser. No IP addresses or subnet data are sent to any server.

---

## Accessibility

- All inputs must have visible labels.
- Segmented control buttons must expose selected state with `aria-pressed` or equivalent semantics.
- Validation messages should use `role="alert"` or `aria-live="polite"`.
- Copy buttons need accessible names, e.g. "Copy network address".
- Output rows must remain readable with keyboard focus outlines visible.
- Do not rely on color alone for address type or validation status.

---

## SEO

```ts
useSeoMeta({
  title: 'IPv6 CIDR Calculator - Playground Sunshine',
  description: 'Calculate IPv6 network address, range, prefix details, address type, and reverse DNS zone from any IPv6 CIDR block — directly in your browser.',
})
```

---

## Tool Metadata (`app/data/tools.ts`)

```ts
{
  name: 'IPv6 CIDR Calculator',
  route: '/tools/ipv6-cidr-calculator',
  description: 'Calculate IPv6 network address, range, prefix details, address type, and reverse DNS zone directly in your browser.',
  tags: ['ipv6', 'cidr', 'networking', 'subnet', 'ip', 'calculator'],
  icon: 'Network',
  category: 'Networking',
}
```

---

## Utility Design

Use a new pure utility file:

`app/utils/ipv6CidrCalculator.ts`

Do not add an external dependency unless parsing edge cases become too risky. Native `BigInt` is sufficient for 128-bit arithmetic.

```ts
type Ipv6AddressType =
  | 'Global unicast'
  | 'Unique local'
  | 'Link-local'
  | 'Loopback'
  | 'Unspecified'
  | 'Multicast'
  | 'Documentation'
  | 'IPv4-mapped'
  | 'IPv4-IPv6 translation'
  | 'Discard-only'
  | 'ORCHIDv2'
  | '6to4'

interface Ipv6CidrResult {
  cidr: string
  inputAddress: string
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

function parseIpv6Cidr(input: string): Ipv6CidrResult
function parseIpv6AddressPrefix(address: string, prefixLength: number): Ipv6CidrResult
function expandIpv6(address: string): string
function compressIpv6(expandedAddress: string): string
function ipv6ToBigInt(address: string): bigint
function bigIntToIpv6(value: bigint): string
function cidrToIpv6Mask(prefixLength: number): string
function getIpv6AddressType(address: string): Ipv6AddressType
function getReverseDnsZone(networkAddress: string, prefixLength: number): string
```

### Implementation notes

- Convert IPv6 addresses to `BigInt` for all range math.
- Network address: `address & mask`.
- Last address: `network | wildcard`.
- Total addresses: `1n << BigInt(128 - prefixLength)`.
- `/128` has exactly one address; first and last are the same.
- `/0` covers the full IPv6 address space.
- Compression should follow common IPv6 display rules:
  - Lowercase hex
  - Remove leading zeros in groups
  - Compress the longest run of zero groups with `::`
  - If tied, compress the first longest run
  - Do not compress a single zero group unless it is part of a longer run
- Expansion should always produce 8 groups of 4 lowercase hex characters.
- Reject zone identifiers such as `fe80::1%eth0` for the first version of the tool.

---

## Tests (`tests/ipv6CidrCalculator.test.ts`)

- `parseIpv6Cidr('2001:db8::1/64')` normalizes network to `2001:db8::/64`
- `parseIpv6Cidr('2001:db8::1/64')` returns last address `2001:db8::ffff:ffff:ffff:ffff`
- `parseIpv6Cidr('::1/128')` returns type `Loopback` and total addresses `1`
- `parseIpv6Cidr('::/0')` returns first address `::` and total address count `340282366920938463463374607431768211456`
- `parseIpv6Cidr('fe80::1/64')` returns type `Link-local`
- `parseIpv6Cidr('fc00::1/7')` returns type `Unique local`
- `parseIpv6Cidr('ff02::1/128')` returns type `Multicast`
- `parseIpv6Cidr('::ffff:192.0.2.128/128')` parses embedded IPv4 and returns type `IPv4-mapped`
- `expandIpv6('2001:db8::1')` returns `2001:0db8:0000:0000:0000:0000:0000:0001`
- `compressIpv6('2001:0db8:0000:0000:0000:0000:0000:0001')` returns `2001:db8::1`
- `cidrToIpv6Mask(64)` returns `ffff:ffff:ffff:ffff::`
- `getReverseDnsZone('2001:db8::', 32)` returns `8.b.d.0.1.0.0.2.ip6.arpa`
- Non-nibble-aligned reverse DNS prefix, e.g. `/33`, returns `Not aligned on a DNS nibble boundary`
- Prefix length below `0` or above `128` returns a validation error
- Address with two `::` shorthands returns a validation error
- Address with invalid hex characters returns a validation error
- Address with too many expanded groups returns a validation error

---

## Quality Checklist

- [ ] Works on desktop and mobile
- [ ] Live calculation as user types
- [ ] Copy button per row + Copy All
- [ ] Clear/reset
- [ ] Handles compressed and expanded IPv6 input
- [ ] Handles embedded IPv4 input
- [ ] Handles edge cases: `/0`, `/64`, `/127`, `/128`
- [ ] Uses `BigInt` for all 128-bit arithmetic
- [ ] Address type shown for every defined type
- [ ] Reverse DNS zone shown for nibble-aligned prefixes
- [ ] Validation messages are human-readable
- [ ] No IP data sent to server
- [ ] SEO metadata set
- [ ] Tests cover core utility functions
- [ ] Listed in `app/data/tools.ts` under Networking
