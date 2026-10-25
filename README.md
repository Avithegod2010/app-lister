<div align="center">

<img src="assets/images/icon.png" width="96" alt="App Lister icon" />

# App Lister

**Every app on your phone. One beautiful list. Nothing else.**

[![Release](https://img.shields.io/github/v/release/Avithegod2010/app-lister?style=flat-square&color=3A55E0)](https://github.com/Avithegod2010/app-lister/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-3A55E0?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=flat-square&logo=android&logoColor=white)](https://github.com/Avithegod2010/app-lister/releases/latest)
[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

[📍 Website](https://avithegod2010.github.io/app-lister/) · [⬇ Download APK](https://github.com/Avithegod2010/app-lister/releases/latest) · [ 🛠 Report an issue](https://github.com/Avithegod2010/app-lister/issues)

</div>

---

App Lister does **exactly one thing**: it shows you every app installed on your Android phone — user apps and system apps — in one fast, fluid, gorgeous list. Inspired by the *List apps* page of [Inure App Manager](https://github.com/Hamza417/Inure), but stripped down to its purest form: **no managers, no killers, no analytics, no clutter.**

It is **100% offline** — nothing ever leaves your device.

## ✨ Features

| | Feature | Details |
|---|---|---|
| 📋 | **Complete app list** | Every installed package with its real icon, name, package id and version |
| 🎨 | **Full theming** | Material You dynamic color from your wallpaper, 8 accent palettes, AMOLED black mode, light/dark/auto |
| ⭐ | **Favorites** | Star any app to pin it; a dedicated filter shows your starred set |
| 🖐 | **Multi-select** | Long-press to enter selection mode — batch copy or share many apps at once |
| 🧭 | **A–Z fast-scroller** | Drag the letter rail to fly through a thousand apps |
| 📦 | **Installer filters** | Separate Play Store apps from sideloaded ones in one tap |
| ⏱ | **Usage stats** | Optional "last used" times per app (opt-in permission, stays on-device) |
| 🔍 | **Instant search** | Filter by app name *or* package name as you type |
| ↕️ | **Flexible sorting** | A–Z, Z–A, newest & oldest installs, recently updated, largest APK |
| ▦ | **Two layouts** | Dense list view or a 4-column icon grid |
| ℹ️ | **App details** | Version, version code, category, installer source, min/target Android, install & update dates, APK size and path |
| 📊 | **Live stats** | Total / user / system counts plus combined APK size |
| 🚀 | **Quick actions** | Launch any app, open its Android App Info page, copy the package name |
| 📤 | **Export anywhere** | Share the whole list (or a selection) as **text, CSV or JSON** |
| 🔷 | **Icon shapes** | Rounded, circle or square — match your launcher |
| 🪄 | **Calm, fluid motion** | Subtle springs, shimmer skeletons, haptic feedback — never flashy |
| 💾 | **Sticky preferences** | Theme, filter, sort, favorites and view mode are all remembered |

## ⬇️ Download

Grab the latest APK from the [**Releases**](https://github.com/Avithegod2010/app-lister/releases/latest) page and install it on your phone — no Play Store needed.

- Minimum Android version: **5.0 (Lollipop)**
- Permission requested: **`QUERY_ALL_PACKAGES`** only — required to list the apps, used for nothing else

## 🔒 Privacy

App Lister works entirely offline. It contains **no ads, no trackers, no analytics, and no network access of any kind**. The only permission it holds is used to read the list of installed apps, which never leaves the device. Exported lists go only where *you* share them.

## 🛠 Tech stack

- [Expo SDK 54](https://expo.dev) · React Native 0.81 · TypeScript · expo-router
- **Custom local Expo module** (`modules/installed-apps`, Kotlin) — queries Android's `PackageManager`, caches icons to disk, streams scan progress
- [material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities) — genuine Material You tonal palettes generated from the wallpaper color
- FlashList for 60fps scrolling · Reanimated for motion · expo-image for icons

### Build it yourself

```bash
npm install

# APK via EAS Build (cloud)
eas build -p android --profile preview

# or fully local
npx expo prebuild -p android
cd android && ./gradlew assembleDebug
```

The `preview` profile in [`eas.json`](eas.json) produces an installable **APK**; `production` produces an AAB for the Play Store.

## 🤝 Credits

- Inspired by the [Inure App Manager](https://github.com/Hamza417/Inure) *List apps* page
- Built with [Expo](https://expo.dev) and the React Native community

## 📄 License

[MIT](LICENSE) © 2026 Avithegod2010 — free to use, study, modify and share.
