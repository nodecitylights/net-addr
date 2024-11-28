import type { IpAddrValue } from './ip.ts'
import { Ipv4Addr } from './ipv4.ts'
import { arrayStartsWith, isValidUint128, isValidUint16 } from '../utils.ts'

/**
 * A representation of an IPv6 address
 */
export class Ipv6Addr implements IpAddrValue {
	/**
	 * A localhost address at `::1`, or `0:0:0:0:0:0:0:1`
	 */
	public static LOCALHOST: Ipv6Addr = new Ipv6Addr(
		new Uint16Array([0, 0, 0, 0, 0, 0, 0, 1]),
	)

	/**
	 * An unspecified address at `::`, or `0:0:0:0:0:0:0:0`
	 */
	public static UNSPECIFIED: Ipv6Addr = new Ipv6Addr(
		new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0]),
	)

	/** A fixed-size array of 8 unsigned 16-bit integers */
	private readonly _segments: Uint16Array

	private constructor(segments: Uint16Array) {
		this._segments = segments
	}

	/**
	 * A fixed-size array of 8 unsigned 16-bit integers.
	 */
	public segments(): Uint16Array {
		return this._segments
	}

	/**
	 * The first segment of the IPv6 address in network byte order,
	 * from bits 0-15.
	 */
	public get a(): number {
		return this._segments[0]
	}

	/**
	 * The second segment of the IPv6 address in network byte order,
	 * from bits 16-31.
	 */
	public get b(): number {
		return this._segments[1]
	}

	/**
	 * The third segment of the IPv6 address in network byte order,
	 * from bits 32-47.
	 */
	public get c(): number {
		return this._segments[2]
	}

	/**
	 * The fourth segment of the IPv6 address in network byte order,
	 * from bits 48-63.
	 */
	public get d(): number {
		return this._segments[3]
	}

	/**
	 * The fifth segment of the IPv6 address in network byte order,
	 * from bits 64-79.
	 */
	public get e(): number {
		return this._segments[4]
	}

	/**
	 * The sixth segment of the IPv6 address in network byte order,
	 * from bits 80-95.
	 */
	public get f(): number {
		return this._segments[5]
	}

	/**
	 * The seventh segment of the IPv6 address in network byte order,
	 * from bits 96-111.
	 */
	public get g(): number {
		return this._segments[6]
	}

	/**
	 * The eighth segment of the IPv6 address in network byte order,
	 * from bits 112-127.
	 */
	get h(): number {
		return this._segments[7]
	}

	/**
	 * Creates a new IPv6 address from 8 numbers.
	 *
	 * This returns `null` if any given number is not an unsigned 16-bit integer.
	 */
	public static tryNew(
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
		h: number,
	): Ipv6Addr | null {
		if (
			!isValidUint16(a) ||
			!isValidUint16(b) ||
			!isValidUint16(c) ||
			!isValidUint16(d) ||
			!isValidUint16(e) ||
			!isValidUint16(f) ||
			!isValidUint16(g) ||
			!isValidUint16(h)
		) {
			return null
		}

		return new Ipv6Addr(
			new Uint16Array([
				a,
				b,
				c,
				d,
				e,
				f,
				g,
				h,
			]),
		)
	}

	/**
	 * Creates an IPv6 address from an unsigned 128-bit integer
	 * (via `bigint`).
	 *
	 * This returns `null` if the given number is not a valid
	 * unsigned 128-bit integer (0 to (2^128)-1).
	 */
	public static tryFromUint128(u128: bigint): Ipv6Addr | null {
		if (!isValidUint128(u128)) {
			return null
		}

		return new Ipv6Addr(
			new Uint16Array([
				Number((u128 >> 112n) & 65_535n),
				Number((u128 >> 96n) & 65_535n),
				Number((u128 >> 80n) & 65_535n),
				Number((u128 >> 64n) & 65_535n),
				Number((u128 >> 48n) & 65_535n),
				Number((u128 >> 32n) & 65_535n),
				Number((u128 >> 16n) & 65_535n),
				Number(u128 & 65_535n),
			]),
		)
	}

	/**
	 * Attempts to create an `Ipv6Addr` from an array of numbers.
	 *
	 * This returns `null` if:
	 *  - the array length is not equal to 8,
	 *  - any of the numbers are not a valid unsigned 16-bit integer.
	 */
	public static tryFromArray(array: number[]): Ipv6Addr | null {
		if (array.length !== 8) {
			return null
		}

		return Ipv6Addr.tryNew(
			array[0],
			array[1],
			array[2],
			array[3],
			array[4],
			array[5],
			array[6],
			array[7],
		)
	}

	/**
	 * Attempts to create an `Ipv6Addr` from a `Uint16Array`.
	 *
	 * This returns `null` if the array length is not equal to 8,
	 * otherwise returns an `Ipv6Addr`.
	 */
	public static tryFromUint16Array(array: Uint16Array): Ipv6Addr | null {
		return (array.length === 8) ? new Ipv6Addr(array) : null
	}

	/**
	 * Attempts to create an `Ipv6Addr` from a `DataView`.
	 *
	 * This returns `null` if the view is not 16 bytes long,
	 * otherwise returns an `Ipv6Addr`.
	 */
	public static tryFromDataView(view: DataView): Ipv6Addr | null {
		if (view.byteLength !== 16) {
			return null
		}

		return new Ipv6Addr(
			new Uint16Array([
				view.getUint16(0),
				view.getUint16(1),
				view.getUint16(2),
				view.getUint16(3),
				view.getUint16(4),
				view.getUint16(5),
				view.getUint16(6),
				view.getUint16(7),
			]),
		)
	}

	/**
	 * Returns this IPv6 address as an unsigned 128-bit integer
	 * (via `bigint`).
	 */
	public toUint128(): bigint {
		return uint16ArrayToUint128(this._segments)
	}

	/**
	 * Returns the IPv6 address that comes before this current
	 * IPv6 address.
	 *
	 * This returns `null` if the current IPv6 address is `::`.
	 */
	public previous(): Ipv6Addr | null {
		return Ipv6Addr.tryFromUint128(this.toUint128() - 1n)
	}

	/**
	 * Returns the IPv6 address that comes after this current
	 * IPv6 address.
	 *
	 * This returns `null` if the current IPv6 address is
	 * `ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff`.
	 */
	public next(): Ipv6Addr | null {
		return Ipv6Addr.tryFromUint128(this.toUint128() + 1n)
	}

	/**
	 * This returns an IPv6 address as a fully uncompressed string,
	 * as `aaaa:bbbb:cccc:dddd:eeee:ffff:gggg:hhhh`.
	 */
	public toString(): string {
		const hextets = []
		for (const segment of this._segments) {
			hextets.push(segment.toString(16).padStart(4, '0'))
		}
		return hextets.join(':')
	}

	/**
	 * A fixed-size array of 16 unsigned 8-bit integers
	 */
	public octets(): Uint8Array {
		const uint8Array = new Uint8Array(16)
		for (let i = 0; i < 8; i++) {
			const idx = i * 2
			const hextet = this._segments[i]
			uint8Array[idx] = (hextet >> 8) & 0xff // Upper 8 bits
			uint8Array[idx + 1] = hextet & 0xff // Lower 8 bits
		}
		return uint8Array
	}

	/**
	 * Checks if this IPv6 address is equal to another IPv6 address.
	 */
	public equals(other: Ipv6Addr): boolean {
		return this.a === other.a &&
			this.b === other.b &&
			this.c === other.c &&
			this.d === other.d &&
			this.e === other.e &&
			this.f === other.f &&
			this.g === other.g &&
			this.h === other.h
	}

	/**
	 * Checks if this IPv6 address is a benchmarking address.
	 *
	 * This range is defined in [IETF RFC Errata 1752][errata1572]
	 * as `2000:0002::/48`.
	 *
	 * [errata1572]: https://www.rfc-editor.org/errata/eid1752
	 */
	public isBenchmarking(): boolean {
		return this.a === 0x2001 &&
			this.b === 0x2 &&
			this.c === 0
	}

	/**
	 * Checks if this IPv6 address is a documentation address.
	 *
	 * This range is defined in [IETF RFC 3849][rfc3849]
	 * as `2001:db8::/32`.
	 *
	 * [rfc3849]: https://datatracker.ietf.org/doc/html/rfc3849
	 */
	public isDocumentation(): boolean {
		return this.a === 0x2001 && this.b === 0xdb8
	}

	/**
	 * Checks if this IPv6 address is a discard-only address.
	 *
	 * This range is defined in [IETF RFC 6666][rfc6666] as
	 * `100::/64`.
	 *
	 * [rfc6666]: https://datatracker.ietf.org/doc/html/rfc6666
	 */
	public isDiscardOnly(): boolean {
		return arrayStartsWith(
			this._segments,
			new Uint16Array([0x100, 0, 0, 0]),
		)
	}

	/**
	 * Checks if this IPv6 address is a global address as specified
	 * by the [IANA IPv6 Special-Purpose Address Registry][registry].
	 *
	 * [registry]: https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml
	 */
	// deno-fmt-ignore
	public isGlobal(): boolean {
		return !(this.isUnspecified()
			|| this.isLoopback()
			|| this.isIpv4Mapped()
			|| this.isIpv4Translated()
			|| this.isDiscardOnly()
			|| (
				(this.a === 0x2001 && this.b < 0x200) && !(
					uint16ArrayToUint128(this._segments) === BigInt("0x20010001000000000000000000000001")
					|| uint16ArrayToUint128(this._segments) === BigInt("0x20010001000000000000000000000002")
					|| arrayStartsWith(this._segments, new Uint16Array([0x2001, 0x3]))
					|| arrayStartsWith(this._segments, new Uint16Array([0x2001, 4, 0x112]))
					|| (this.a === 0x2001 && (this.b >= 0x10 && this.b <= 0x3f))
				)
			)
			|| this.a === 0x2002
			|| this.isDocumentation()
			|| this.isUniqueLocal()
			|| this.isUnicastLinkLocal())
	}

	/**
	 * Checks if this IPv6 address is an IPv4-mapped address.
	 *
	 * This is defined in [IETF RFC 4291][rfc4291] as
	 * `::ffff:0:0/96`.
	 *
	 * [rfc4291]: https://datatracker.ietf.org/doc/html/rfc4291
	 */
	public isIpv4Mapped(): boolean {
		return arrayStartsWith(
			this._segments,
			new Uint16Array([0, 0, 0, 0, 0, 0xffff]),
		)
	}

	/**
	 * Checks if this IPv6 address is an IPv4-translated address.
	 *
	 * This is defined in [IETF RFC 8215][rfc8215] as`64:ff9b:1::/48`.
	 *
	 * [rfc8215]: https://datatracker.ietf.org/doc/html/rfc8215
	 */
	public isIpv4Translated(): boolean {
		return arrayStartsWith(
			this._segments,
			new Uint16Array([0x64, 0xff9b, 1]),
		)
	}

	/**
	 * Checks if this IPv6 address is a loopback address.
	 *
	 * This is defined in [IETF RFC 4291 § 2.5.3][rfc4291] as `::1`.
	 *
	 * [rfc4291]: https://datatracker.ietf.org/doc/html/rfc4291
	 */
	public isLoopback(): boolean {
		return this.equals(Ipv6Addr.LOCALHOST)
	}

	/**
	 * Checks if this IPv6 address is a multicast address.
	 *
	 * This is defined in [IETF RFC 4291][rfc4291] as `ff00::/8`.
	 *
	 * [rfc4291]: https://datatracker.ietf.org/doc/html/rfc4291
	 */
	public isMulticast(): boolean {
		return (this.a & 0xff00) === 0xff00
	}

	/**
	 * Checks if this IPv6 address is a unique local address.
	 *
	 * This is defined in [IETF RFC 4193][rfc4193] as any address
	 * that is not a multicast address.
	 *
	 * [rfc4193]: https://datatracker.ietf.org/doc/html/rfc4193
	 */
	public isUnicast(): boolean {
		return !this.isMulticast()
	}

	/**
	 * Checks if this IPv6 address is a globally routable unicast address.
	 *
	 * This checks if:
	 * - The address is a unicast address
	 * - The address is not a loopback address
	 * - The address is not a link-local address
	 * - The address is not a unique local address
	 * - The address is not an unspecified address
	 * - The address is not a documentation address
	 * - The address is not a benchmarking address
	 */
	public isUnicastGlobal(): boolean {
		return this.isUnicast() &&
			!this.isLoopback() &&
			!this.isUnicastLinkLocal() &&
			!this.isUniqueLocal() &&
			!this.isUnspecified() &&
			!this.isDocumentation() &&
			!this.isBenchmarking()
	}

	/**
	 * Checks if this IPv6 address is a link-local unicast address.
	 *
	 * This is defined in [IETF RFC 4291 § 2.5.6][rfc4921] as `fe80::/10`.
	 *
	 * [rfc4921]: https://datatracker.ietf.org/doc/html/rfc4291
	 */
	public isUnicastLinkLocal(): boolean {
		return (this.a & 0xffc0) === 0xfe80
	}

	/**
	 * Checks if this IPv6 address is a unique local address.
	 *
	 * This is defined in [IETF RFC 4193][rfc4193] as `fc00::/7`.
	 *
	 * [rfc4193]: https://datatracker.ietf.org/doc/html/rfc4193
	 */
	public isUniqueLocal(): boolean {
		return (this.a & 0xfe00) === 0xfc00
	}

	/**
	 * Checks if this IPv6 address is an unspecified address.
	 *
	 * This is defined in [IETF RFC 4291 § 2.5.2][rfc4921] as `::`.
	 *
	 * [rfc4921]: https://datatracker.ietf.org/doc/html/rfc4291
	 */
	public isUnspecified(): boolean {
		return this.equals(Ipv6Addr.UNSPECIFIED)
	}

	/**
	 * Checks if this IPv6 address is a multicast address,
	 * and if so returns the multicast scope (the range of addresses
	 * for multicasting traffic).
	 *
	 * Multicast scopes are defined in [IETF RFC 7346 § 2][rfc7346].
	 *
	 * [rfc7346]: https://datatracker.ietf.org/doc/html/rfc7346#section-2
	 */
	public multicastScope(): MulticastScope | null {
		if (!this.isMulticast()) {
			return null
		}

		switch (this.a & 0x000f) {
			case 1:
				return 'InterfaceLocal'
			case 2:
				return 'LinkLocal'
			case 3:
				return 'RealmLocal'
			case 4:
				return 'AdminLocal'
			case 5:
				return 'SiteLocal'
			case 8:
				return 'OrganizationLocal'
			case 14:
				return 'Global'
			default:
				return null
		}
	}

	public toIpv4(): Ipv4Addr | null {
		const segments = this.segments()
		if (
			arrayStartsWith(segments, [0, 0, 0, 0, 0]) &&
			(segments[5] === 0 || segments[5] === 0xffff)
		) {
			const [a, b] = uint16ToUint8Array(segments[6])
			const [c, d] = uint16ToUint8Array(segments[7])
			return Ipv4Addr.tryFromUint8Array(new Uint8Array([a, b, c, d]))
		}

		return null
	}

	public toIpv4Mapped(): Ipv4Addr | null {
		const octets = this.octets()
		const mapped = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff]
		if (!arrayStartsWith(octets, mapped)) {
			return null
		}

		return Ipv4Addr.tryNew(octets[12], octets[13], octets[14], octets[15])
	}
}

/**
 * Different ranges of addresses for multicasting traffic.
 *
 * These are defined in [IETF RFC 7346 § 2][rfc7346].
 *
 * [rfc7346]: https://datatracker.ietf.org/doc/html/rfc7346#section-2
 */
export type MulticastScope =
	| 'InterfaceLocal'
	| 'LinkLocal'
	| 'RealmLocal'
	| 'AdminLocal'
	| 'SiteLocal'
	| 'OrganizationLocal'
	| 'Global'

function uint16ArrayToUint128(array: Uint16Array): bigint {
	let result = BigInt(0)
	for (let i = 0; i < array.length; i++) {
		result = (result << BigInt(16)) | BigInt(array[i])
	}
	return result
}

function uint16ToUint8Array(value: number): Uint8Array {
	const lowByte = value & 0xff
	const highByte = (value >> 8) & 0xff
	return new Uint8Array([lowByte, highByte])
}
