import { describe, expect, it } from 'vitest'
import {
  cidrToMask,
  getAddressType,
  intToIp,
  ipToInt,
  maskToBinary,
  maskToCidr,
  parseCidr,
  parseIpMask,
} from '~/utils/cidrCalculator'

describe('ipToInt', () => {
  it('returns unsigned integer for high-octet IPs', () => {
    expect(ipToInt('192.168.1.0')).toBe(3232235776)
    expect(ipToInt('255.255.255.255')).toBe(4294967295)
    expect(ipToInt('128.0.0.0')).toBe(2147483648)
  })

  it('never returns a negative number', () => {
    const ips = ['128.0.0.0', '192.168.0.0', '200.0.0.0', '255.0.0.0']
    for (const ip of ips) {
      expect(ipToInt(ip)).toBeGreaterThanOrEqual(0)
    }
  })

  it('round-trips through intToIp', () => {
    const ips = ['0.0.0.0', '10.0.0.1', '192.168.1.45', '255.255.255.255']
    for (const ip of ips) {
      expect(intToIp(ipToInt(ip))).toBe(ip)
    }
  })
})

describe('maskToCidr / cidrToMask', () => {
  it('maskToCidr converts dotted mask to prefix length', () => {
    expect(maskToCidr('255.255.255.0')).toBe(24)
    expect(maskToCidr('255.255.0.0')).toBe(16)
    expect(maskToCidr('255.0.0.0')).toBe(8)
    expect(maskToCidr('0.0.0.0')).toBe(0)
    expect(maskToCidr('255.255.255.255')).toBe(32)
  })

  it('cidrToMask converts prefix length to dotted mask', () => {
    expect(cidrToMask(24)).toBe('255.255.255.0')
    expect(cidrToMask(16)).toBe('255.255.0.0')
    expect(cidrToMask(8)).toBe('255.0.0.0')
    expect(cidrToMask(0)).toBe('0.0.0.0')
    expect(cidrToMask(32)).toBe('255.255.255.255')
  })
})

describe('maskToBinary', () => {
  it('converts dotted mask to binary dot-notation', () => {
    expect(maskToBinary('255.255.255.0')).toBe('11111111.11111111.11111111.00000000')
    expect(maskToBinary('255.0.0.0')).toBe('11111111.00000000.00000000.00000000')
  })
})

describe('parseCidr', () => {
  it('calculates correct result for 192.168.1.0/24', () => {
    const r = parseCidr('192.168.1.0/24')!
    expect(r.networkAddress).toBe('192.168.1.0')
    expect(r.broadcastAddress).toBe('192.168.1.255')
    expect(r.subnetMask).toBe('255.255.255.0')
    expect(r.wildcardMask).toBe('0.0.0.255')
    expect(r.firstHost).toBe('192.168.1.1')
    expect(r.lastHost).toBe('192.168.1.254')
    expect(r.usableHosts).toBe(254)
    expect(r.totalAddresses).toBe(256)
    expect(r.ipClass).toBe('C')
    expect(r.addressType).toBe('Private')
    expect(r.cidr).toBe('192.168.1.0/24')
  })

  it('normalises host bits (192.168.1.45/24 → 192.168.1.0)', () => {
    const r = parseCidr('192.168.1.45/24')!
    expect(r.networkAddress).toBe('192.168.1.0')
    expect(r.cidr).toBe('192.168.1.0/24')
  })

  it('returns class A and Private for 10.0.0.1/8', () => {
    const r = parseCidr('10.0.0.1/8')!
    expect(r.networkAddress).toBe('10.0.0.0')
    expect(r.ipClass).toBe('A')
    expect(r.addressType).toBe('Private')
  })

  it('handles /0 default route', () => {
    const r = parseCidr('0.0.0.0/0')!
    expect(r.networkAddress).toBe('0.0.0.0')
    expect(r.totalAddresses).toBe(4294967296)
    expect(r.addressType).toBe('Default route')
  })

  it('handles /32 single host', () => {
    const r = parseCidr('192.168.1.1/32')!
    expect(r.totalAddresses).toBe(1)
    expect(r.usableHosts).toBe(0)
    expect(r.networkAddress).toBe('192.168.1.1')
    expect(r.broadcastAddress).toBe('192.168.1.1')
  })

  it('handles /31 point-to-point', () => {
    const r = parseCidr('10.0.0.0/31')!
    expect(r.totalAddresses).toBe(2)
    expect(r.usableHosts).toBe(0)
  })

  it('returns null for invalid CIDR', () => {
    expect(parseCidr('not-an-ip')).toBeNull()
    expect(parseCidr('256.0.0.0/24')).toBeNull()
    expect(parseCidr('192.168.1.0/33')).toBeNull()
    expect(parseCidr('')).toBeNull()
  })
})

describe('parseIpMask', () => {
  it('matches parseCidr for equivalent input', () => {
    const a = parseCidr('192.168.1.0/24')!
    const b = parseIpMask('192.168.1.0', '255.255.255.0')!
    expect(b).toEqual(a)
  })

  it('returns null for invalid mask', () => {
    expect(parseIpMask('192.168.1.0', '255.255.1.0')).toBeNull() // non-contiguous
    expect(parseIpMask('192.168.1.0', '256.0.0.0')).toBeNull()
  })
})

describe('getAddressType', () => {
  const cases: [string, string][] = [
    ['192.168.1.0', 'Private'],
    ['10.0.0.1', 'Private'],
    ['172.16.0.1', 'Private'],
    ['8.8.8.8', 'Public'],
    ['1.1.1.1', 'Public'],
    ['127.0.0.1', 'Loopback'],
    ['169.254.0.1', 'Link-local'],
    ['224.0.0.1', 'Multicast'],
    ['240.0.0.1', 'Reserved'],
    ['100.64.0.1', 'Carrier-grade NAT'],
    ['192.0.2.1', 'Documentation / Test-Net'],
    ['198.51.100.1', 'Documentation / Test-Net'],
    ['203.0.113.1', 'Documentation / Test-Net'],
    ['255.255.255.255', 'Limited broadcast'],
    ['0.0.0.0', 'Default route'],
  ]

  it.each(cases)('getAddressType(%s) === %s', (ip, expected) => {
    expect(getAddressType(ip)).toBe(expected)
  })
})
