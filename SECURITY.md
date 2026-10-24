# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |

## Reporting a vulnerability

Please open a **private** security advisory instead of a public issue:
**Security → Report a vulnerability** on this repo, or email the owner via the profile page.
Please include reproduction steps and affected versions. Reports are answered within a few days.

## Security posture

App Lister is a **single-purpose, 100% offline** app. By design:

- **No network access** — no `INTERNET`-dependent feature is used anywhere in the code. Nothing is uploaded, tracked, or shared automatically.
- **Single permission** — `QUERY_ALL_PACKAGES`, required by the app's entire purpose (enumerating installed apps). It is used only for the on-device list.
- **No dynamic code loading** — no `eval`, no remote bundles, no web views.
- **Local data only** — preferences live in AsyncStorage; exported lists are written to the app's private cache and shared only when the user explicitly taps *Share*.

## Known advisories in the dependency tree (2026-10)

A full `npm audit` against the v1.0.0 lockfile reports advisories in the
**development/build toolchain only** (`@expo/cli`, `@expo/metro-config`, `postcss`,
`node-forge`, `image-size`). These packages run on the developer's machine at
build time and are **not present in the shipped APK**.

One advisory reaches the runtime JS bundle: `decode-uri-component`
(GHSA-vcc3-ghjq-m6fr, moderate) via `expo-router`'s dependency `query-string`.
Impact is limited to a **denial of service** — a deliberately malformed
`applister://` deep link could crash the app. There is no data exposure or code
execution path. The upstream fix lands with newer `expo-router` major versions;
this project will pick it up when migrating beyond SDK 54.

## Icon cache and package names

The native module writes app icons to the app's private cache directory
(`cacheDir/app_icons`). Android package names returned by `PackageManager`
cannot contain path separators, so the derived cache filenames are confined to
that directory. `launchApp` and `openAppInfo` only ever receive package names
that originated from the device's own `PackageManager` during the same session.
