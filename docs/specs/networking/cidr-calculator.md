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

### Special network notes

Display a subtle badge/note for well-known ranges:

- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` → **Private (RFC 1918)**
- `127.0.0.0/8` → **Loopback**
- `169.254.0.0/16` → **Link-local (APIPA)**
- `0.0.0.0/0` → **Default route**
- `255.255.255.255/32` → **Limited broadcast**

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
  binaryMask: string
  isPrivate: boolean
  specialNote: string | null
}

function parseCidr(input: string): CidrResult   // "192.168.1.0/24"
function parseIpMask(ip: string, mask: string): CidrResult
function ipToInt(ip: string): number
function intToIp(n: number): string
function maskToCidr(mask: string): number        // "255.255.255.0" → 24
function cidrToMask(prefix: number): string      // 24 → "255.255.255.0"
function maskToBinary(mask: string): string      // "255.255.255.0" → "11111111.11111111.11111111.00000000"
```

---

## Tests (`tests/cidrCalculator.test.ts`)

- `parseCidr('192.168.1.0/24')` returns correct network, broadcast, hosts, mask
- `parseCidr('10.0.0.1/8')` normalises to `10.0.0.0`, returns class A, private
- `parseCidr('0.0.0.0/0')` handles default route (0 usable hosts edge case)
- `parseCidr('192.168.1.1/32')` handles /32 (single host: 1 total, 0 usable)
- `parseCidr('10.0.0.0/31')` handles /31 (point-to-point: 2 total, 0 usable)
- `maskToCidr('255.255.255.0')` returns `24`
- `cidrToMask(24)` returns `'255.255.255.0'`
- `maskToBinary('255.255.255.0')` returns `'11111111.11111111.11111111.00000000'`
- Invalid CIDR throws or returns null
- `parseIpMask('192.168.1.0', '255.255.255.0')` matches `parseCidr('192.168.1.0/24')`
- Special note detected for private, loopback, link-local ranges

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
- [ ] Detects private / special ranges
- [ ] Shows IP class
- [ ] Validation messages are human-readable
- [ ] No IP data sent to server
- [ ] SEO metadata set
- [ ] Tests cover core utility functions
- [ ] Listed in `data/tools.ts` under Networking
