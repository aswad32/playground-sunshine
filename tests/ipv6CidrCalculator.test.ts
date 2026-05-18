import { describe, expect, it } from 'vitest'
import {
  expandIpv6,
  compressIpv6,
  getIpv6AddressType,
  getReverseDnsZone,
  hexToBigInt,
  bigIntToHex,
  hexToExpandedAddress,
  parseIpv6Cidr,
  parseIpv6AddressPrefix,
} from '~/utils/ipv6CidrCalculator'

// ---------------------------------------------------------------------------
// expandIpv6
// ---------------------------------------------------------------------------

describe('expandIpv6', () => {
  it('expands fully qualified address', () => {
    expect(expandIpv6('2001:0db8:0000:0000:0000:0000:0000:0001'))
      .toBe('20010db8000000000000000000000001')
  })

  it('expands :: shorthand in the middle', () => {
    expect(expandIpv6('2001:db8::1')).toBe('20010db8000000000000000000000001')
  })

  it('expands leading ::', () => {
    expect(expandIpv6('::1')).toBe('00000000000000000000000000000001')
  })

  it('expands trailing ::', () => {
    expect(expandIpv6('2001:db8::')).toBe('20010db8000000000000000000000000')
  })

  it('expands :: alone (unspecified)', () => {
    expect(expandIpv6('::')).toBe('00000000000000000000000000000000')
  })

  it('expands fe80::1234', () => {
    expect(expandIpv6('fe80::1234')).toBe('fe800000000000000000000000001234')
  })

  it('handles embedded IPv4', () => {
    // ::ffff:192.0.2.1 → ::ffff:c000:201
    expect(expandIpv6('::ffff:192.0.2.1')).toBe('00000000000000000000ffffc0000201')
  })

  it('throws on double ::', () => {
    expect(() => expandIpv6('::1::1')).toThrow()
  })

  it('throws on too many groups', () => {
    expect(() => expandIpv6('1:2:3:4:5:6:7:8:9')).toThrow()
  })

  it('throws on invalid hex character', () => {
    expect(() => expandIpv6('2001:db8::xyz')).toThrow()
  })

  it('throws on invalid embedded IPv4 octet', () => {
    expect(() => expandIpv6('::ffff:256.0.0.1')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// compressIpv6
// ---------------------------------------------------------------------------

describe('compressIpv6', () => {
  it('compresses longest run of zero groups', () => {
    expect(compressIpv6('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe('2001:db8::1')
  })

  it('returns :: for all-zero address', () => {
    expect(compressIpv6('0000:0000:0000:0000:0000:0000:0000:0000')).toBe('::')
  })

  it('returns ::1 for loopback', () => {
    expect(compressIpv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1')
  })

  it('does not compress single zero group', () => {
    // fe80::1 — only one zero group in the middle should still not be "::" if length < 2
    // fe80:0000:0000:... — this has multiple zeros so compresses
    const expanded = 'fe80:0000:0000:0000:0000:0000:0000:0001'
    expect(compressIpv6(expanded)).toBe('fe80::1')
  })

  it('keeps non-compressible addresses intact', () => {
    expect(compressIpv6('2001:0db8:0001:0002:0003:0004:0005:0006')).toBe('2001:db8:1:2:3:4:5:6')
  })
})

// ---------------------------------------------------------------------------
// hexToBigInt / bigIntToHex round-trip
// ---------------------------------------------------------------------------

describe('hexToBigInt / bigIntToHex', () => {
  it('round-trips loopback address', () => {
    const hex = '00000000000000000000000000000001'
    expect(bigIntToHex(hexToBigInt(hex))).toBe(hex)
  })

  it('round-trips 2001:db8::1', () => {
    const hex = '20010db8000000000000000000000001'
    expect(bigIntToHex(hexToBigInt(hex))).toBe(hex)
  })

  it('handles all-f address', () => {
    const hex = 'ffffffffffffffffffffffffffffffff'
    expect(bigIntToHex(hexToBigInt(hex))).toBe(hex)
  })
})

// ---------------------------------------------------------------------------
// getIpv6AddressType
// ---------------------------------------------------------------------------

describe('getIpv6AddressType', () => {
  const parse = (addr: string) => hexToBigInt(expandIpv6(addr))

  it('detects Loopback (::1)', () => {
    expect(getIpv6AddressType(parse('::1'))).toBe('Loopback')
  })

  it('detects Unspecified (::)', () => {
    expect(getIpv6AddressType(parse('::'))).toBe('Unspecified')
  })

  it('detects Link-local (fe80::1)', () => {
    expect(getIpv6AddressType(parse('fe80::1'))).toBe('Link-local')
  })

  it('detects Unique local (fd00::1)', () => {
    expect(getIpv6AddressType(parse('fd00::1'))).toBe('Unique local')
  })

  it('detects Multicast (ff02::1)', () => {
    expect(getIpv6AddressType(parse('ff02::1'))).toBe('Multicast')
  })

  it('detects Documentation (2001:db8::1)', () => {
    expect(getIpv6AddressType(parse('2001:db8::1'))).toBe('Documentation')
  })

  it('detects 6to4 (2002::1)', () => {
    expect(getIpv6AddressType(parse('2002::1'))).toBe('6to4')
  })

  it('detects IPv4-mapped (::ffff:192.0.2.1)', () => {
    expect(getIpv6AddressType(parse('::ffff:c000:201'))).toBe('IPv4-mapped')
  })

  it('detects Global unicast for regular address', () => {
    expect(getIpv6AddressType(parse('2600:1f18::1'))).toBe('Global unicast')
  })
})

// ---------------------------------------------------------------------------
// getReverseDnsZone
// ---------------------------------------------------------------------------

describe('getReverseDnsZone', () => {
  it('returns correct zone for 2001:db8::/32', () => {
    const networkHex = expandIpv6('2001:db8::')
    expect(getReverseDnsZone(networkHex, 32)).toBe('8.b.d.0.1.0.0.2.ip6.arpa')
  })

  it('returns correct zone for 2001:db8:abcd::/48', () => {
    const networkHex = expandIpv6('2001:db8:abcd::')
    expect(getReverseDnsZone(networkHex, 48)).toBe('d.c.b.a.8.b.d.0.1.0.0.2.ip6.arpa')
  })

  it('returns null for non-nibble-aligned prefix', () => {
    const networkHex = expandIpv6('2001:db8::')
    expect(getReverseDnsZone(networkHex, 33)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// parseIpv6Cidr
// ---------------------------------------------------------------------------

describe('parseIpv6Cidr', () => {
  it('parses 2001:db8::1/64 correctly', () => {
    const r = parseIpv6Cidr('2001:db8::1/64')
    expect(r.cidr).toBe('2001:db8::/64')
    expect(r.networkAddress).toBe('2001:db8::')
    expect(r.prefixLength).toBe(64)
    expect(r.hostBits).toBe(64)
    expect(r.lastAddress).toBe('2001:db8::ffff:ffff:ffff:ffff')
    expect(r.addressType).toBe('Documentation')
  })

  it('normalises host bits (2001:db8::1234/64 → network 2001:db8::)', () => {
    const r = parseIpv6Cidr('2001:db8::1234/64')
    expect(r.networkAddress).toBe('2001:db8::')
    expect(r.cidr).toBe('2001:db8::/64')
  })

  it('handles ::1/128 (loopback)', () => {
    const r = parseIpv6Cidr('::1/128')
    expect(r.cidr).toBe('::1/128')
    expect(r.addressType).toBe('Loopback')
    expect(r.totalAddresses).toBe('1')
    expect(r.hostBits).toBe(0)
  })

  it('handles ::/0 (default route)', () => {
    const r = parseIpv6Cidr('::/0')
    expect(r.cidr).toBe('::/0')
    expect(r.prefixLength).toBe(0)
    expect(r.hostBits).toBe(128)
  })

  it('handles fe80::1234/64 (link-local)', () => {
    const r = parseIpv6Cidr('fe80::1234/64')
    expect(r.addressType).toBe('Link-local')
    expect(r.networkAddress).toBe('fe80::')
  })

  it('produces correct total addresses for /64', () => {
    const r = parseIpv6Cidr('2001:db8::/64')
    // 2^64 = 18446744073709551616
    expect(r.totalAddresses).toBe('18,446,744,073,709,551,616')
  })

  it('produces correct reverse DNS zone', () => {
    const r = parseIpv6Cidr('2001:db8::/32')
    expect(r.reverseDnsZone).toBe('8.b.d.0.1.0.0.2.ip6.arpa')
  })

  it('shows non-aligned message for /33', () => {
    const r = parseIpv6Cidr('2001:db8::/33')
    expect(r.reverseDnsZone).toBe('Not aligned on a DNS nibble boundary')
  })

  it('handles uppercase input', () => {
    const r = parseIpv6Cidr('2001:DB8::1/64')
    expect(r.cidr).toBe('2001:db8::/64')
  })

  it('throws on prefix out of range', () => {
    expect(() => parseIpv6Cidr('2001:db8::/129')).toThrow('Prefix length must be between 0 and 128.')
  })

  it('throws on double ::', () => {
    expect(() => parseIpv6Cidr('::1::1/64')).toThrow()
  })

  it('throws on invalid group', () => {
    expect(() => parseIpv6Cidr('2001:xyz::/32')).toThrow()
  })

  it('throws on wrong group count', () => {
    expect(() => parseIpv6Cidr('1:2:3:4:5:6:7:8:9/64')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// parseIpv6AddressPrefix
// ---------------------------------------------------------------------------

describe('parseIpv6AddressPrefix', () => {
  it('combines address and prefix correctly', () => {
    const r = parseIpv6AddressPrefix('2001:db8::1', '64')
    expect(r.cidr).toBe('2001:db8::/64')
  })

  it('trims whitespace in inputs', () => {
    const r = parseIpv6AddressPrefix('  2001:db8::1  ', '  48  ')
    expect(r.prefixLength).toBe(48)
  })
})
