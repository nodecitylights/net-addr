# Changelog

## 0.8.0

### Breaking changes
- `IpAddr` no longer has the methods `isIpv4()` and `isIpv6()`, as they are not usable as type guards in their current state. These methods may be re-introduced in the future.

### Bug fixes
Two edge cases were fixed:
- `IpAddr` can no longer recursively contain another `IpAddr`. It can now only contain either `Ipv4Addr` or `Ipv6Addr`.
- `SocketAddr` can no longer recursively contain another `SocketAddr`. It can now only contain either `SocketAddrV4` or `SocketAddrV6`.

### Internal changes
- `IpAddr` now has unit tests.

## 0.7.7

### Features
- `IPv6Addr` now returns its canonical string representation. This TypeScript implementation is ported over from Rust's implementation (`impl fmt::Display for Ipv6Addr`).

### Internal changes
- `Ipv4Addr.tryNew()` now has more extensive unit tests.

## 0.7.6

### Features
- `Ipv6Addr` now has 3 new instance methods, `tryFromUint8Array()`, `toIpv4()` and `toIpv4Mapped()`. Their implementation and documentation are also ported from Rust's `std::net` module to TypeScript.
- `Ipv4Addr` now has 2 new instance methods, `toIpv6Compatible()` and `toIpv6Mapped()`. Like above, these implementations are also ported from Rust's standard library.

## 0.7.5

### Documentation
- The root module-level documentation now uses `README.md` which includes examples, instead of documentation in `./src/mod.ts` (now removed).
- Minor documentation fixes for `SocketAddr`, `SocketAddrValue`, `SocketAddrV4`, and `SocketAddrV6`.
- Minor module-level documentation fixes for `/socket` and `/ip` for consistency.

## 0.7.4

### Documentation
- Hack-fix links to method names referenced in `IpAddr` and `IpAddrValue`.

### Internal changes
- CI: The commands in the main CI workflow no longer has to be manually synced. They now use custom command aliases under `deno task`, including:
  - `deno task check`
  - `deno task test`
  - `deno task htmldocs`
  - `deno task lintdocs`

## 0.7.3

### Bug fixes
- Renames a typo in a Port method name, changing `Port.isDyanmic()` to `Port.isDynamic()`.
- Renames the current `MulticastScope` type to `Ipv6MulticastScope`, since it only describes IPv6 addresses.

### Documentation
- Classes now have top-level code block examples of how they work.
- Module files and the `README.md` file now have some brief, top-level documentation describing what they contain.
- Symbols now have more internal links between each other, which should make it easier to navigate.
- Documentation style and formatting is generally more consistent.

### Internal changes
- CI: The main CI workflow now also runs tests in all documentation code examples, not just in the README.md file.
- CI: Fixes a minor typo in a step name of a GitHub Actions CI workflow.

## 0.7.2

### Features
- It is now possible to iterate through a range of IP addresses via `Ipv4AddrIterator` and `Ipv6AddrIterator`. This provides a slightly more optimized way of iterating versus calling `Ipv4Addr.next()`/`Ipv6Addr.next()`. Instead of having to constantly convert to/from a single integer to create a new IP address, the iterator stores that integer internally as a mutable state.

## 0.7.1

### Features
- The `Ipv6Addr` class now exposes 2 instance methods, `isDiscardOnly()` and `isIpv4Translated()`.

### Documentation
- The documentation for the `Ipv6Addr.isIpv4Mapped()` method now mentions its relevant RFC (RFC 4291).
- The code example in `README.md` is now fixed.
- The syntax highlighting in the install section is now fixed.

### Internal changes
- This also adds some unit tests for pre-existing methods, `Ipv6Addr.tryNew()` and `Ipv6Addr.isIpv4Mapped()`.
- `.git-blame-ignore-revs` file is now setup.
- The CI workflow will now also run tests for any code examples set in `README.md`.

## 0.7.0

### Breaking changes
- Exports `/ipv4` and `/ipv6` were removed in favor of a new export, `/ip`. This exports all currently existing IP-related types: `Ipv4Addr`, `Ipv6Addr`, `IpAddr`, `IpAddrValue`, and `MulticastScope`.

## 0.6.2

### Features
- Introduced a new `SocketAddrValue` interface, which defines an `addr` getter, a `port` getter, and a `toString()` method.
  - Note that `Ipv6Addr` does not yet have a way of converting to a string in its most compressed format. This means that `SocketAddrV6.toString()` will write out the inner IPv6 address in its uncompressed format, and the same goes the same for a `SocketAddr` if it contains a `SocketAddrV6`. Both issues will be addressed in an upcoming version.
- Introduced a new `SocketAddr` class, which implements `SocketAddrValue`.
- `SocketAddrV4` class now implements the `SocketAddrValue` interface.
- `SocketddrV6` class now implemens the `SocketAddrValue` interface.

### Bug fixes
- `SocketAddrV6` now correctly also contains a `flowInfo` property and `scopeId` property. (**NOTE**: This is technically considered a breaking change, but is classified as a bugfix instead since the original implementation before this version was incorrect.)
- The constructor of `SocketAddrV6` is now considered "unchecked"; library users must take to check that all given numbers are within their valid range.

## 0.6.1

### Features
- The `Port` class now exposes a getter, `isSelectableEphemeral`. This matches the definition of [IETF RFC 6056](https://datatracker.ietf.org/doc/html/rfc6056) for what can be considered an okay port number that's suitable for selection algorithms.

## 0.6.0

### Breaking changes
- The `port` property of `SocketAddrV4` and `SocketAddrV6` is now `Port` (instead of `number`).

### Features
- There is a new class representing a port, conveniently called `Port`. This comes with a few getters that checks for special properties of the port number (checking if it is a user port, system port, dynamic port, and/or a reserved port).
- The constructors of `SocketAddrV4` and `SocketAddrV6` are now generally considered "safe" to call; the responsibility of validating a port number is now up to the `Port` class.
  - Note that it is still possible to create a new `Port` instance with its public constructor, which is documented as unchecked. To ensure that a port number is valid (an unsigned 16-bit integer), library users can call `Port.tryNew()` instead.


## 0.5.1

### Documentation
- This fixes a minor documentation issue for `Ipv6Addr.tryFromArray()`. This now correctly mentions that the method will return `null` if any of the numbers are not a valid unsigned 16-bit integer.

## 0.5.0
This version focuses on making the library's behavior for handling numbers/integers more consistent.

The API now consistenly returns `null` for invalid numbers passed as an argument (floats, NaN, Infinity, +Infinity, etc), instead of automatically clamping and/or truncating the number by default.

### Breaking changes
- `Ipv4Addr.fromUint32()` is now renamed to `Ipv4Addr.tryFromUint32()`. This now returns null if the number is not a valid unsigned 32-bit integer, instead of clamping to that range.
- `Ipv6Addr.fromUint128()` is now renamed to `Ipv6Addr.tryFromUint128()`. This now returns null if the number is not a valid unsigned 128-bit integer, instead of clamping to that range.

### Documentation
- The writing style is now generally more consistent.

## 0.4.0

### Features
- `Ipv4Addr` now exposes an instance method named `toUint32()`.
- `Ipv6Addr` now exposes 4 new instance methods:
  - `toUint128()`
  - `fromUint128()`, for constructing a new `Ipv6Addr` from a `bigint`
  - `previous()`, for getting the previous IPv6 address
  - `next()`, for getting the next IPv6 address

## 0.3.0

### Breaking changes
- `SocketAddrV4.tryNew()` and `SocketAddrV6.tryNew()` will now return `null` if the port number is outside of the unsigned 16-bit integer range, instead of truncating + clamping.

### Features
- `Ipv4Addr` can now be created from a `Uint8ClampedArray` with `Ipv4Addr.tryFromUint8ClampedArray()`.

### Bug fixes
- The implementation behavior of `IPv4Addr.parse()` no longer leaks the internal behavior of `parseIpv4Addr()`. While `parseIpv4Addr()` is designed to only accept as much input as necessary and ignore extra input (for combining parsers consecutively), `IPv4Addr.parse()` will error out on extra input.
- The implementation behavior of `SocketAddrV6`'s constructor is now consistent with how it is documented; it no longer clamps the port number. The caller must be responsible for checking that the port number is valid.

### Internal changes
- `parseSocketAddrV4()` now simply parses, and does not validate. Instead, it calls `SocketAddrV4.tryNew()` to validate.
- There is now slightly more extensive unit testing and code coverage for various classes and methods.

## 0.2.1 (2024-11-18)

### Documentation
- Fixes a link to IETF RFC 3849 in `Ipv6Addr.isDocumentation()`.
- Fixes internal typo to link references for `IPv6Addr.isLoopback()` and  `IPv6Addr.isMulticast()`.

## 0.2.0 (2024-11-18)

### Breaking changes
- The interface `IpAddrValue` now exposes an `octets()` method that returns a `Uint8Array`.
- The properties of `Ipv4Addr` and `Ipv6Addr` are now readonly.
- The properties of `SocketAddrV4` and `SocketAddrV6` are now readonly.
- `SocketAddrV6.fromString()` is renamed to `SocketAddrV6.parse()` to be consistent with `SocketAddrV4.parse()`. (**Note**: This method is not currently implemented yet, and will throw an error when called)

### Features
- `SocketAddrV4` and `SocketAddrV6` now exposes a static `tryNew()` method. This method will check if the port number is a valid, unsigned 16-bit integer.
- `SocketAddrV4` and `SocketAddrV6` now have a note on their constructors which states that the caller is responsible for checking that the port is a valid, unsigned 16-bit integer.

## 0.1.1 (2024-11-18)
- The parser for IPv4 addresses and socket addresses no longer takes as many ASCII digits as possible.
  - IPv4Addr: the parser will now only take 1 to 3 digits for each octet
  - SocketAddrV4: the parser will now only take 1 to 5 digits for the port number

## 0.1.0 (2024-11-17)
- Initial unstable release of library
