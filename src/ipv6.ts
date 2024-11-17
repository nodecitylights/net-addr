import type { IpAddrValue } from './ip.ts'
import { arrayStartsWith, clampUint16 } from './utils.ts'

/**
 * A representation of an IPv6 address
 */
export class Ipv6Addr implements IpAddrValue {
	/**
	 * A localhost address at ::1, or 0:0:0:0:0:0:0:1
	 */
	// deno-fmt-ignore
	public static LOCALHOST: Ipv6Addr = new Ipv6Addr(
		new Uint16Array([0, 0, 0, 0, 0, 0, 0, 1])
	)

	/**
	 * An unspecified address at ::, or 0:0:0:0:0:0:0:0
	 */
	// deno-fmt-ignore
	public static UNSPECIFIED: Ipv6Addr = new Ipv6Addr(
		new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0])
	)

	/** Eight unsigned 16-bit segments */
	public segments: Uint16Array

	private constructor(segments: Uint16Array) {
		this.segments = segments
	}

	get a(): number {
		return this.segments[0]
	}

	get b(): number {
		return this.segments[1]
	}

	get c(): number {
		return this.segments[2]
	}

	get d(): number {
		return this.segments[3]
	}

	get e(): number {
		return this.segments[4]
	}

	get f(): number {
		return this.segments[5]
	}

	get g(): number {
		return this.segments[6]
	}

	get h(): number {
		return this.segments[7]
	}

	/**
	 * Creates a new IPv6 address, where each number is
	 * clamped to the range of an unsigned 16-bit integer.
	 */
	public static newAddr(
		a: number,
		b: number,
		c: number,
		d: number,
		e: number,
		f: number,
		g: number,
		h: number,
	): Ipv6Addr {
		return new Ipv6Addr(
			new Uint16Array([
				clampUint16(a),
				clampUint16(b),
				clampUint16(c),
				clampUint16(d),
				clampUint16(e),
				clampUint16(f),
				clampUint16(g),
				clampUint16(h),
			]),
		)
	}

	/**
	 * Attempts to create an Ipv6Addr from an array of numbers.
	 * Returns undefined if the array length is not equal to 8,
	 * otherwise returns an Ipv6Addr.
	 */
	public static tryFromArray(array: number[]): Ipv6Addr | undefined {
		if (array.length !== 8) {
			return undefined
		}

		return Ipv6Addr.newAddr(
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
	 * Fails and returns `undefined` if the array length is not equal to 8,
	 * otherwise returns an `Ipv6Addr`.
	 */
	public static tryFromUint16Array(array: Uint16Array): Ipv6Addr | undefined {
		return (array.length === 8) ? new Ipv6Addr(array) : undefined
	}

	/**
	 * Attempts to create an `Ipv6Addr` from a `DataView`.
	 * Fails and returns `undefined` if the view is not 16 bytes long,
	 * otherwise returns an `Ipv6Addr`.
	 */
	public static tryFromDataView(view: DataView): Ipv6Addr | undefined {
		if (view.byteLength !== 16) {
			return undefined
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

	public toString(): string {
		return `${this.a}:${this.b}:${this.c}:${this.d}:${this.e}:${this.f}:${this.g}:${this.h}`
	}

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

	public isBenchmarking(): boolean {
		return this.a === 0x2001 &&
			this.b === 0x2 &&
			this.c === 0
	}

	public isDocumentation(): boolean {
		return this.a === 0x2001 && this.b === 0xdb8
	}

	public isGlobal(): boolean {
		throw new Error()
	}

	public isIpv4Mapped(): boolean {
		return arrayStartsWith(
			this.segments,
			new Uint16Array([0, 0, 0, 0, 0, 0xffff]),
		)
	}

	public isLoopback(): boolean {
		return this.equals(Ipv6Addr.LOCALHOST)
	}

	public isMulticast(): boolean {
		return (this.a & 0xff00) === 0xff00
	}

	public isUnicast(): boolean {
		return !this.isMulticast()
	}

	public isUnicastGlobal(): boolean {
		return this.isUnicast() &&
			!this.isLoopback() &&
			!this.isUnicastLinkLocal() &&
			!this.isUniqueLocal() &&
			!this.isUnspecified() &&
			!this.isDocumentation() &&
			!this.isBenchmarking()
	}

	public isUnicastLinkLocal(): boolean {
		return (this.a & 0xffc0) === 0xfe80
	}

	public isUniqueLocal(): boolean {
		return (this.a & 0xfe00) === 0xfc00
	}

	public isUnspecified(): boolean {
		return this.equals(Ipv6Addr.UNSPECIFIED)
	}

	public multicastScope(): MulticastScope | undefined {
		if (!this.isMulticast()) {
			return undefined
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
				return undefined
		}
	}
}

export type MulticastScope =
	| 'InterfaceLocal'
	| 'LinkLocal'
	| 'RealmLocal'
	| 'AdminLocal'
	| 'SiteLocal'
	| 'OrganizationLocal'
	| 'Global'
