# Contributing to App Lister

Thanks for your interest! App Lister is a deliberately small, single-purpose app —
contributions that keep it that way are the best fit.

## Getting started

```bash
npm install
npx tsc --noEmit   # typecheck
npm test           # unit tests (pure utils)
```

- **Do not** edit the `android/` or `ios/` folders — they are generated
  (`npx expo prebuild -p android`). All native work happens in
  `modules/installed-apps`.
- Run `npx tsc --noEmit` before pushing; CI does the same and fails fast.
- Keep the app **100% offline**: no new permissions, no network calls, no
  analytics. Changes that add tracking of any kind will be rejected.

## Good first contributions

- Bug fixes and edge cases (weird package names, empty icons, RTL names)
- Small UX polish that does not add screens or permissions
- Translations

## Releases

Maintainers tag releases on GitHub; APKs are built by CI
(`.github/workflows/apk.yml`) and attached automatically to the release.
