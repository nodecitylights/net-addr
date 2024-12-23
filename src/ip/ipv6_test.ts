import { assert, assertEquals, assertFalse, assertNotEquals } from '@std/assert'
import { Ipv4Addr } from './ipv4.ts'
import { Ipv6Addr } from './ipv6.ts'

Deno.test('special address localhost', () => {
	const localhost = Ipv6Addr.LOCALHOST
	assertEquals(localhost.a, 0)
	assertEquals(localhost.b, 0)
	assertEquals(localhost.c, 0)
	assertEquals(localhost.d, 0)
	assertEquals(localhost.e, 0)
	assertEquals(localhost.f, 0)
	assertEquals(localhost.g, 0)
	assertEquals(localhost.h, 1)
})

Deno.test('special address unspecified', () => {
	const localhost = Ipv6Addr.UNSPECIFIED
	assertEquals(localhost.a, 0)
	assertEquals(localhost.b, 0)
	assertEquals(localhost.c, 0)
	assertEquals(localhost.d, 0)
	assertEquals(localhost.e, 0)
	assertEquals(localhost.f, 0)
	assertEquals(localhost.g, 0)
	assertEquals(localhost.h, 0)
})

Deno.test('segments', () => {
	const addr = Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, 7, 8)
	assert(addr instanceof Ipv6Addr)
	assertEquals(
		addr.segments(),
		new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8]),
	)
})

Deno.test('try new address is ok', () => {
	const addr = Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, 7, 8)
	assert(addr instanceof Ipv6Addr)
	assertEquals(addr.a, 1)
	assertEquals(addr.b, 2)
	assertEquals(addr.c, 3)
	assertEquals(addr.d, 4)
	assertEquals(addr.e, 5)
	assertEquals(addr.f, 6)
	assertEquals(addr.g, 7)
	assertEquals(addr.h, 8)
})

Deno.test('try new address errors if any number is not a u16', () => {
	const notU16 = 2 ** 16
	assertEquals(Ipv6Addr.tryNew(notU16, 2, 3, 4, 5, 6, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, notU16, 3, 4, 5, 6, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, notU16, 4, 5, 6, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, 3, notU16, 5, 6, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, 3, 4, notU16, 6, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, 3, 4, 5, notU16, 7, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, notU16, 8), null)
	assertEquals(Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, 7, notU16), null)
})

Deno.test('try from below range of uint128 returns null', () => {
	const addr = Ipv6Addr.tryFromUint128(-1n)
	assertEquals(addr, null)
})

Deno.test('try from above range of uint128 returns null', () => {
	const addr = Ipv6Addr.tryFromUint128(2n ** 128n)
	assertEquals(addr, null)
})

Deno.test('try from array is ok', () => {
	const addr = Ipv6Addr.tryFromArray([1, 2, 3, 4, 5, 6, 7, 8])
	assert(addr instanceof Ipv6Addr)
	assertEquals(addr.a, 1)
	assertEquals(addr.b, 2)
	assertEquals(addr.c, 3)
	assertEquals(addr.d, 4)
	assertEquals(addr.e, 5)
	assertEquals(addr.f, 6)
	assertEquals(addr.g, 7)
	assertEquals(addr.h, 8)
})

Deno.test('try from array is error', () => {
	const addr = Ipv6Addr.tryFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
	assertEquals(addr, null)
})

// deno-fmt-ignore
Deno.test('try from uint8array is ok', () => {
	const addr = Ipv6Addr.tryFromUint8Array(new Uint8Array([
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff
	])) as Ipv6Addr
	assertEquals(
		addr,
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 0xffff)
	)
})

// deno-fmt-ignore
Deno.test('try from uint8array is error', () => {
	const addr = Ipv6Addr.tryFromUint8Array(new Uint8Array([
		1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
	]))
	assertEquals(addr, null)
})

Deno.test('try from uint16array is ok', () => {
	const addr = Ipv6Addr.tryFromUint16Array(
		new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8]),
	)
	assert(addr instanceof Ipv6Addr)
	assertEquals(addr.a, 1)
	assertEquals(addr.b, 2)
	assertEquals(addr.c, 3)
	assertEquals(addr.d, 4)
	assertEquals(addr.e, 5)
	assertEquals(addr.f, 6)
	assertEquals(addr.g, 7)
	assertEquals(addr.h, 8)
})

Deno.test('try from uint16array is error', () => {
	const addr = Ipv6Addr.tryFromUint16Array(
		new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
	)
	assertEquals(addr, null)
})

Deno.test('try from dataview is ok', () => {
	const addr = Ipv6Addr.tryFromDataView(new DataView(new ArrayBuffer(16)))
	assert(addr instanceof Ipv6Addr)
})

Deno.test('try from dataview is error', () => {
	const addr = Ipv6Addr.tryFromDataView(new DataView(new ArrayBuffer(17)))
	assertEquals(addr, null)
})

Deno.test('to uint128 from ::', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 0)
	assert(addr instanceof Ipv6Addr)
	assertEquals(addr.toUint128(), 0n)
})

Deno.test('to uint128 from ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff', () => {
	const addr = Ipv6Addr.tryNew(
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
	)
	assertEquals(addr?.toUint128(), (2n ** 128n) - 1n)
})

Deno.test('unspecified to string', () => {
	const unspecified = Ipv6Addr.UNSPECIFIED
	assertEquals(unspecified.toString(), '::')
})

Deno.test('localhost to string', () => {
	const localhost = Ipv6Addr.LOCALHOST
	assertEquals(localhost.toString(), '::1')
})

Deno.test('address to string with ipv4-mapped address', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc000, 0x280)
	assertEquals(addr?.toString(), '::ffff:192.0.2.128')
})

Deno.test('address to string with ipv4-compatible address', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0xc000, 0x280)
	assertEquals(addr?.toString(), '::c000:280')
})

Deno.test('address to string, remove a single set of zeroes', () => {
	const addr = Ipv6Addr.tryNew(0xae, 0, 0, 0, 0, 0xffff, 0x0102, 0x0304)
	assertEquals(addr?.toString(), 'ae::ffff:102:304')
})

Deno.test('address to string, ends in zeroes', () => {
	const addr = Ipv6Addr.tryNew(1, 0, 0, 0, 0, 0, 0, 0)
	assertEquals(addr?.toString(), '1::')
})

Deno.test('address to string with two runs of zeros, second one is longer', () => {
	const addr = Ipv6Addr.tryNew(1, 0, 0, 4, 0, 0, 0, 8)
	assertEquals(addr?.toString(), '1:0:0:4::8')
})

Deno.test('address to string with two runs of zeros, equal length', () => {
	const addr = Ipv6Addr.tryNew(1, 0, 0, 4, 5, 0, 0, 8)
	assertEquals(addr?.toString(), '1::4:5:0:0:8')
})

Deno.test('address to string, longest possible', () => {
	const addr = Ipv6Addr.tryNew(
		0x1234,
		0x5678,
		0x9abc,
		0xdef0,
		0x1234,
		0x5678,
		0x9abc,
		0xdef0,
	)
	assertEquals(addr?.toString(), '1234:5678:9abc:def0:1234:5678:9abc:def0')
})

Deno.test('previous: :: -> null', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 0)
	assertEquals(addr?.previous(), null)
})

Deno.test('previous: before max segment', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 65535)
	assertEquals(
		addr?.previous(),
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 65534),
	)
})

Deno.test('previous: underflow to previous segment', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 1, 0)
	assertEquals(addr?.previous(), Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 65535))
})

Deno.test('next: max ipv6 address -> null', () => {
	const addr = Ipv6Addr.tryNew(
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
		0xffff,
	)
	assertEquals(addr?.next(), null)
})

Deno.test('next: :: -> ::1', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 0)
	assertEquals(
		addr?.next(),
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 1),
	)
})

Deno.test('next: ::ffff -> ::1:0', () => {
	const addr = Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 0xffff)
	assertEquals(
		addr?.next(),
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 1, 0),
	)
})

Deno.test('octets', () => {
	const addr = Ipv6Addr.tryNew(0xff00, 0, 0, 0, 0, 0, 0, 0)
	assertEquals(
		addr?.octets(),
		new Uint8Array([255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
	)
})

Deno.test('equals', () => {
	const addr1 = Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, 7, 8)
	const addr2 = Ipv6Addr.tryNew(1, 2, 3, 4, 5, 6, 7, 8)
	assertEquals(addr1, addr2)
})

// deno-fmt-ignore
Deno.test('is benchmarking', () => {
	assertFalse(Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc613, 0x0)?.isBenchmarking())
	assert(Ipv6Addr.tryNew(0x2001, 0x2, 0, 0, 0, 0, 0, 0)?.isBenchmarking())
})

// deno-fmt-ignore
Deno.test('is documentation', () => {
	assertFalse(Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.isDocumentation())
	assert(Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)?.isDocumentation())
})

Deno.test('is discard-only', () => {
	assertFalse(Ipv6Addr.tryNew(0x1001, 0, 0, 0, 1, 2, 3, 4)?.isDiscardOnly())
	assert(Ipv6Addr.tryNew(0x100, 0, 0, 0, 1, 2, 3, 4)?.isDiscardOnly())
})

// deno-fmt-ignore
Deno.test('is global: unspecified is not', () => {
	assertFalse(Ipv6Addr.UNSPECIFIED.isGlobal())
})

Deno.test('is global: localhost is not', () => {
	assertFalse(Ipv6Addr.LOCALHOST.isGlobal())
})

Deno.test('is global: ipv4 mapped is not', () => {
	assertFalse(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.isGlobal(),
	)
})

Deno.test('is global: benchmarking is not', () => {
	assertFalse(Ipv6Addr.tryNew(0x2001, 2, 0, 0, 0, 0, 0, 1)?.isGlobal())
})

Deno.test('is global: documentation is not', () => {
	assertFalse(Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)?.isGlobal())
	assertFalse(Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 1)?.isGlobal())
})

Deno.test('is global: yes', () => {
	assert(Ipv6Addr.tryNew(0x26, 0, 0x1c9, 0, 0, 0xafc8, 0x10, 0x1)?.isGlobal())
})

Deno.test('is global: unicast address with link-local scope is not', () => {
	assertFalse(Ipv6Addr.tryNew(0xfe80, 0, 0, 0, 0, 0, 0, 0)?.isGlobal())
	assertFalse(Ipv6Addr.tryNew(0xfe81, 0, 0, 0, 0, 0, 0, 1)?.isGlobal())
})

Deno.test('is global: unique local address is not', () => {
	assertFalse(Ipv6Addr.tryNew(0xfc00, 0, 0, 0, 0, 0, 0, 0)?.isGlobal())
	assertFalse(Ipv6Addr.tryNew(0xfc02, 0, 0, 0, 0, 0, 0, 1)?.isGlobal())
})

Deno.test('is global: 1st hextet as 0x2002 is not', () => {
	assertFalse(Ipv6Addr.tryNew(0x2002, 0, 0, 0, 0, 0, 0, 0)?.isGlobal())
})

Deno.test('is ipv4-mapped', () => {
	assert(Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 1, 2)?.isIpv4Mapped())
	assertFalse(Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xfffe, 1, 2)?.isIpv4Mapped())
})

Deno.test('is ipv4-translated', () => {
	assert(Ipv6Addr.tryNew(0x64, 0xff9b, 1, 2, 3, 4, 5, 6)?.isIpv4Translated())
	assertFalse(Ipv6Addr.tryNew(0x64, 0, 1, 2, 3, 4, 5, 6)?.isIpv4Translated())
})

Deno.test('is loopback', () => {
	assertFalse(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.isLoopback(),
	)
	assert(Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 1)?.isLoopback())
})

Deno.test('is multicast', () => {
	assert(Ipv6Addr.tryNew(0xff00, 0, 0, 0, 0, 0, 0, 0)?.isMulticast())
	assertFalse(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.isMulticast(),
	)
})

Deno.test('is unicast', () => {
	assert(Ipv6Addr.LOCALHOST.isUnicast())
	assert(Ipv6Addr.UNSPECIFIED.isUnicast())
	assert(Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)?.isUnicast())
	assertFalse(Ipv6Addr.tryNew(0xff00, 0, 0, 0, 0, 0, 0, 0)?.isUnicast())
})

Deno.test('is globally unicast', () => {
	assertFalse(
		Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)?.isUnicastGlobal(),
	)
	assert(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)
			?.isUnicastGlobal(),
	)
})

Deno.test('is link-local unicast', () => {
	assertFalse(Ipv6Addr.LOCALHOST.isUnicastLinkLocal())
	assertFalse(
		Ipv6Addr.tryNew(0x2001, 0xdb8, 0, 0, 0, 0, 0, 0)?.isUnicastLinkLocal(),
	)
	assert(Ipv6Addr.tryNew(0xfe80, 0, 0, 0, 0, 0, 0, 0)?.isUnicastLinkLocal())
	assert(Ipv6Addr.tryNew(0xfe80, 0, 0, 1, 0, 0, 0, 0)?.isUnicastLinkLocal())
	assert(Ipv6Addr.tryNew(0xfe81, 0, 0, 0, 0, 0, 0, 0)?.isUnicastLinkLocal())
})

Deno.test('is unique local', () => {
	assertFalse(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.isUniqueLocal(),
	)
	assert(Ipv6Addr.tryNew(0xfc02, 0, 0, 0, 0, 0, 0, 0)?.isUniqueLocal())
})

Deno.test('is unspecified', () => {
	assert(Ipv6Addr.UNSPECIFIED.isUnspecified())
	assertFalse(Ipv6Addr.LOCALHOST.isUnspecified())
})

Deno.test('multicast scope: interface local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff01, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'InterfaceLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff1, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'InterfaceLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff02, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'InterfaceLocal',
	)
})

Deno.test('multicast scope: link local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff02, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'LinkLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff2, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'LinkLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff05, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'LinkLocal',
	)
})

Deno.test('multicast scope: realm local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff03, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'RealmLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff3, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'RealmLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff04, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'RealmLocal',
	)
})

Deno.test('multicast scope: admin local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff4, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'AdminLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff4, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'AdminLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff05, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'AdminLocal',
	)
})

Deno.test('multicast scope: site local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff05, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'SiteLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff5, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'SiteLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff08, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'SiteLocal',
	)
})

Deno.test('multicast scope: organization local', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff08, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'OrganizationLocal',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfff8, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'OrganizationLocal',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xff0e, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'OrganizationLocal',
	)
})

Deno.test('multicast scope: global', () => {
	// min hextet
	assertEquals(
		Ipv6Addr.tryNew(0xff0e, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'Global',
	)
	// max hextet
	assertEquals(
		Ipv6Addr.tryNew(0xfffe, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'Global',
	)
	// outside of range
	assertNotEquals(
		Ipv6Addr.tryNew(0xffff, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		'Global',
	)
})

Deno.test('multicast scope: unknown', () => {
	assertEquals(
		Ipv6Addr.LOCALHOST.multicastScope(),
		null,
	)
	assertEquals(
		Ipv6Addr.tryNew(0xffff, 0, 0, 0, 0, 0, 0, 0)?.multicastScope(),
		null,
	)
})

Deno.test('to ipv4 address', () => {
	assertEquals(Ipv6Addr.tryNew(0xff00, 0, 0, 0, 0, 0, 0, 0)?.toIpv4(), null)
	assertEquals(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.toIpv4(),
		Ipv4Addr.tryNew(192, 10, 2, 255) as Ipv4Addr,
	)
	assertEquals(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 1)?.toIpv4(),
		Ipv4Addr.tryNew(0, 0, 0, 1) as Ipv4Addr,
	)
})

Deno.test('to ipv4 mapped address', () => {
	assertEquals(
		Ipv6Addr.tryNew(0xff00, 0, 0, 0, 0, 0, 0, 0)?.toIpv4Mapped(),
		null,
	)
	assertEquals(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0xffff, 0xc00a, 0x2ff)?.toIpv4Mapped(),
		Ipv4Addr.tryNew(192, 10, 2, 255) as Ipv4Addr,
	)
	assertEquals(
		Ipv6Addr.tryNew(0, 0, 0, 0, 0, 0, 0, 1)?.toIpv4Mapped(),
		null,
	)
})
