import type { IpAddrValue } from './ip/ip.ts'
import type { Ipv4Addr } from './ip/ipv4.ts'
import type { Ipv6Addr } from './ip/ipv6.ts'
import { parseSocketAddrV4 } from './parser.ts'
import { isValidUint16, isValidUint32 } from './utils.ts'

/**
 * An unsigned 16-bit integer which represents
 * a unique identifier for a network connection.
 */
export class Port {
	/** An unsigned 16-bit integer */
	public readonly value: number

	/** The smallest possible system port number */
	public static SYSTEM_MIN: number = 0
	/** The largest possible system port number */
	public static SYSTEM_MAX: number = 1023

	/** The smallest possible user port number */
	public static USER_MIN: number = 1024
	/** The largest possible user port number */
	public static USER_MAX: number = 49151

	/** The smallest possible user port number */
	public static DYNAMIC_MIN: number = 49152
	/** The largest possible user port number */
	public static DYNAMIC_MAX: number = 65535

	/**
	 * Creates a new `Port` from an unsigned 16-bit integer.
	 *
	 * **NOTE**: It is the caller's responsibility to check
	 * that the port number is;
	 *  - an integer (not `NaN`, `Infinity`, or `-Infinity`)
	 *  - within the range of an unsigned 16-bit integer
	 */
	public constructor(value: number) {
		this.value = value
	}

	/**
	 * Attempts to create a new `Port` from a number.
	 *
	 * This returns `null` if the number is not a valid
	 * unsigned 16-bit integer.
	 */
	public static tryNew(value: number): Port | null {
		return !isValidUint16(value) ? null : new Port(value)
	}

	/**
	 * Parse a port number given a string.
	 *
	 * This returns `null` if:
	 *  - the given string is not a number,
	 *  - the given string is a number, but not a valid
	 *    unsigned 16-bit integer
	 */
	public static parse(s: string): Port | null {
		return Port.tryNew(Number.parseInt(s, 10))
	}

	/**
	 * Checks if the port number is a reserved port.
	 *
	 * This range is defined  in [IETF RFC 6535][rfc6535]
	 * as values at the edge of each range (user port,
	 * system port, and dynamic port), which must be
	 * either 0, 1023, 1024, 49151, 49152, or 65535.
	 *
	 * [rfc6535]: https://datatracker.ietf.org/doc/html/rfc6335
	 */
	public get isReserved(): boolean {
		return this.value === Port.SYSTEM_MIN ||
			this.value === Port.SYSTEM_MAX ||
			this.value === Port.USER_MIN ||
			this.value === Port.USER_MAX ||
			this.value === Port.DYNAMIC_MIN ||
			this.value === Port.DYNAMIC_MAX
	}

	/**
	 * Checks if the port number is a system port, also known
	 * as a "well-known" port.
	 *
	 * This range is defined by [IETF RFC 6535][rfc6535]
	 * as between 0 and 1023, inclusively.
	 *
	 * [rfc6535]: https://datatracker.ietf.org/doc/html/rfc6335
	 */
	public get isSystem(): boolean {
		return this.value >= Port.SYSTEM_MIN && this.value <= Port.SYSTEM_MAX
	}

	/**
	 * Checks if the port number is a user port, also known
	 * as a "registered" port.
	 *
	 * This range is defined by [IETF RFC 6535][rfc6535]
	 * as between 1024 and 49151, inclusively.
	 *
	 * [rfc6535]: https://datatracker.ietf.org/doc/html/rfc6335
	 */
	public get isUser(): boolean {
		return this.value >= Port.USER_MIN && this.value <= Port.USER_MAX
	}

	/**
	 * Checks if the port number is a dynamic port, also known
	 * as a "private" or "ephemeral" port.
	 *
	 * This range is defined by [IETF RFC 6535][rfc6535]
	 * as between 49152 and 65535, inclusively.
	 *
	 * [rfc6535]: https://datatracker.ietf.org/doc/html/rfc6335
	 */
	public get isDyanmic(): boolean {
		return this.value >= Port.DYNAMIC_MIN && this.value <= Port.DYNAMIC_MAX
	}

	/**
	 * Checks if the port can be considered as an ephemeral port
	 * that's suitable for selection algorithms.
	 *
	 * This range is defined by [IETF RFC 6056][rfc6056] as
	 * between 1024 and 65535, inclusively. This is equivalent
	 * to checking if this is either a user port or dynamic port.
	 *
	 * [rfc6056]: https://datatracker.ietf.org/doc/html/rfc6056
	 */
	public get isSelectableEphemeral(): boolean {
		return this.value >= Port.USER_MIN && this.value <= Port.DYNAMIC_MAX
	}

	/**
	 * Returns the port number as a string
	 */
	public toString(): string {
		return this.value.toString()
	}
}

/**
 * A representation of a socket address.
 */
export interface SocketAddrValue {
	/** The IP address associated with this socket address */
	get addr(): IpAddrValue
	/** The port number associated with this socket address */
	get port(): Port
	/** The socket representation of the socket address */
	toString(): string
}

/**
 * A concrete representation of a socket address,
 * which can either contain a `SocketAddrV4` or `SocketAddrV6`.
 */
export class SocketAddr implements SocketAddrValue {
	/** The socket address */
	public socket: SocketAddrValue

	/** Creates a new socket address */
	public constructor(socket: SocketAddrValue) {
		this.socket = socket
	}

	/** The IP address associated with this socket address */
	public get addr(): IpAddrValue {
		return this.socket.addr
	}

	/** The port number associated with this socket address */
	public get port(): Port {
		return this.socket.port
	}

	/** The string representation of the socket address */
	public toString(): string {
		return this.socket.toString()
	}
}

/**
 * A socket address, containing an IPv4 address and a port number.
 */
export class SocketAddrV4 implements SocketAddrValue {
	/** The IPv4 address of the socket */
	public readonly addr: Ipv4Addr
	/** The unsigned 16-bit port number of the address */
	public readonly port: Port

	/**
	 * Creates a new socket address from an IPv4 address and a port number.
	 *
	 * @param addr The IPv4 address of the socket
	 * @param port The unsigned 16-bit port number of the address
	 */
	public constructor(addr: Ipv4Addr, port: Port) {
		this.addr = addr
		this.port = port
	}

	/**
	 * Attempts to create a new `SocketAddrV4`.
	 *
	 * This returns `null` if the port is not a valid unsigned 16-bit integer.
	 */
	public static tryNew(addr: Ipv4Addr, portNum: number): SocketAddrV4 | null {
		const port = Port.tryNew(portNum)
		if (port === null) {
			return null
		}

		return new SocketAddrV4(addr, port)
	}

	/**
	 * Parses a string in the format of `"ipv4:port"`,
	 * where the port is an unsigned 16-bit integer.
	 *
	 * This returns `null` if:
	 * - The IPv4 address cannot be parsed.
	 * - The IPV4 address can be parsed, but there's no `:` delimiter.
	 * - The port number can't be parsed, or is out of bounds of an unsigned
	 *   16-bit integer (0 to 65,535).
	 */
	public static parse(s: string): SocketAddrV4 | null {
		const [socket, _] = parseSocketAddrV4(s)
		return socket
	}

	/**
	 * Returns the socket address as a string in the format of
	 * `<ipaddr4>:<port>`
	 */
	public toString(): string {
		return `${this.addr}:${this.port}`
	}
}

/**
 * A socket address, containing an IPv6 address and a port number.
 */
export class SocketAddrV6 implements SocketAddrValue {
	/** The IPv6 address of the socket */
	public readonly addr: Ipv6Addr
	/** The port number associated with the address as an unsigned 16-bit integer */
	public readonly port: Port
	/** The flow info associated with this address as an unsigned 32-bit integer */
	public readonly flowInfo: number
	/** The scope ID associated with this address as an unsigned 32-bit integer */
	public readonly scopeId: number

	/**
	 * Creates a new socket address from an IPv6 address, port number,
	 * flow info, and scope ID.
	 *
	 * **NOTE**: It is the caller's responsibility to validate the following:
	 * 	- the port is a valid unsigned 16-bit integer.
	 *  - the flow info is a valid unsigned 32-bit integer.
	 *  - the scope ID is a valid unsigned 32-bit integer.
	 */
	public constructor(
		addr: Ipv6Addr,
		port: Port,
		flowInfo: number,
		scopeId: number,
	) {
		this.addr = addr
		this.port = port
		this.flowInfo = flowInfo
		this.scopeId = scopeId
	}

	/**
	 * Attempts to create a new `SocketAddrV6`.
	 *
	 * This returns `null` if:
	 *  - the port is not a valid unsigned 16-bit integer.
	 *  - the flow info is not a valid unsigned 32-bit integer.
	 *  - the scope ID is not a valid unsigned 32-bit integer.
	 */
	public static tryNew(
		addr: Ipv6Addr,
		portNum: number,
		flowInfo: number,
		scopeId: number,
	): SocketAddrV6 | null {
		const port = Port.tryNew(portNum)
		if (
			port === null ||
			!isValidUint32(flowInfo) ||
			!isValidUint32(scopeId)
		) {
			return null
		}

		return new SocketAddrV6(addr, port, flowInfo, scopeId)
	}

	/**
	 * Parses a string in the format of `"[ipv6]:port"`,
	 * where the port is an unsigned 16-bit integer.
	 *
	 * TODO: Finish this implementation. This will currently
	 * throw an error since it is not implemented yet.
	 */
	public static parse(_s: string): SocketAddrV6 | null {
		throw new Error('Not implemented yet')
	}

	/**
	 * Returns the socket address as a string, in the format of either:
	 *  - `[<ipv6addr>]:<port>`, if the scope ID is 0
	 *  - `[<ipv6addr>%<scopeid>]:<port>`, if the scope ID is not 0
	 */
	public toString(): string {
		if (this.scopeId === 0) {
			return `[${this.addr}]:${this.port}`
		} else {
			return `[${this.addr}%${this.scopeId}]:${this.port}`
		}
	}
}
