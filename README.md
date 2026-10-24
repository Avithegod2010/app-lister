# App Lister

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![Platform](https://img.shields.io/badge/platform-Android-green)

A beautiful, single-purpose Android app that lists **every app installed on your phone** — user apps and system apps alike, in one fluid Material You list. Inspired by the *List apps* page of [Inure App Manager](https://github.com/Hamza417/Inure).

> **This app does one thing: it lists your apps.** No managers, no killers, no clutter.

<!-- Screenshots: drop PNGs into docs/screenshots/ (light-list, dark-list, details) -->

## Features

- **Complete app list** — every installed package with its real icon, name, package id and version
- **Instant search** — filter by app name or package name as you type
- **Filter chips** — All / User / System apps
- **Flexible sorting** — name A–Z / Z–A, newest or oldest installs, recently updated, largest APK
- **App details** — version, version code, min/target OS, install & update dates, APK size and path, plus quick actions: launch the app, open Android's App Info, copy the package name
- **Export & share** — the whole list as formatted text, CSV or JSON; share via any app or copy to clipboard
- **Stats at a glance** — total / user / system counters
- **List & grid views** — dense list or a 4-column icon grid
- **Material You** — dynamic color extracted from your wallpaper (Android 8.1+), full light & dark themes, fluid spring animations and haptics
- **Preferences stick** — theme, filter, sort and view mode are remembered

## Build

### APK with EAS Build

```bash
npm install
eas build -p android --profile preview
```

The `preview` profile produces an installable **APK**.

### Locally

```bash
npm install
npx expo prebuild -p android
cd android && ./gradlew assembleDebug
```

The debug APK lands in `android/app/build/outputs/apk/debug/`.

## Tech stack

- [Expo SDK 54](https://expo.dev) · React Native 0.81 · TypeScript · expo-router
- **Local Expo native module** (`modules/installed-apps`, Kotlin) — queries Android's `PackageManager`, caches icons on disk, reports scan progress
- [@material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities) — true Material You tonal palettes from the wallpaper color
- FlashList, Reanimated, expo-image

## Privacy

App Lister works **100% offline**. Nothing ever leaves your device. The `QUERY_ALL_PACKAGES` permission is used solely to enumerate installed apps.

## License

[MIT](LICENSE) © 2026 Avithegod2010
