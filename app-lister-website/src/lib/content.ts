/** Everything on the page that comes from the repository's own documentation. */

export type Row = {
  t: "FILE" | "DIR";
  p: string;
  s?: number;
  n?: string;
};

/** Real paths and byte sizes read off the `main` tree at commit 14ee7d4. */
export const MANIFEST: Row[] = [
  { t: "DIR", p: "app/", n: "expo-router routes" },
  { t: "FILE", p: "app/_layout.tsx", s: 1455, n: "root layout · theme provider" },
  { t: "FILE", p: "app/index.tsx", s: 17759, n: "the list screen" },
  { t: "FILE", p: "app/pkg.tsx", s: 10369, n: "app details screen" },
  {
    t: "DIR",
    p: "modules/installed-apps/",
    n: "custom local Expo module",
  },
  {
    t: "FILE",
    p: "modules/installed-apps/src/index.ts",
    s: 1617,
    n: "TypeScript surface of the native API",
  },
  {
    t: "FILE",
    p: "modules/installed-apps/expo-module.config.json",
    s: 117,
  },
  { t: "FILE", p: "modules/installed-apps/package.json", s: 182 },
  {
    t: "DIR",
    p: "modules/installed-apps/android/src/",
    n: "Kotlin · PackageManager · icon cache",
  },
  { t: "FILE", p: "modules/installed-apps/android/build.gradle", s: 246 },
  { t: "FILE", p: "app.json", s: 1434, n: "Expo config · QUERY_ALL_PACKAGES" },
  { t: "FILE", p: "eas.json", s: 365, n: "preview → APK · production → AAB" },
  { t: "FILE", p: "README.md", s: 4609 },
  { t: "FILE", p: "CONTEXT.md", s: 2165, n: "project context notes" },
  { t: "FILE", p: "SECURITY.md", s: 2249 },
  { t: "FILE", p: "LICENSE", s: 1070, n: "MIT" },
  { t: "FILE", p: "docs/index.html", s: 43720, n: "GitHub Pages site" },
  { t: "DIR", p: "docs/screenshots/", n: "3 shots" },
  { t: "FILE", p: "docs/screenshots/home-light.jpg", s: 85879 },
  { t: "FILE", p: "docs/screenshots/home-dark.jpg", s: 58299 },
  { t: "FILE", p: "docs/screenshots/details.jpg", s: 64260 },
  { t: "DIR", p: "assets/images/", n: "6 icons + splash" },
  { t: "FILE", p: "assets/images/icon.png", s: 59810 },
  { t: "FILE", p: "eslint.config.js", s: 237 },
  { t: "FILE", p: ".gitignore", s: 826 },
  { t: "FILE", p: ".vscode/settings.json", s: 152 },
  { t: "FILE", p: ".vscode/extensions.json", s: 50 },
];

export type Feature = {
  icon: string;
  title: string;
  detail: string;
};

/** The README feature table, re-set. */
export const FEATURES: Feature[] = [
  {
    icon: "list",
    title: "Complete app list",
    detail:
      "Every installed package with its real icon, name, package id and version.",
  },
  {
    icon: "palette",
    title: "Full theming",
    detail:
      "Material You dynamic color from your wallpaper, 8 accent palettes, AMOLED black mode, light / dark / auto.",
  },
  {
    icon: "search",
    title: "Instant search",
    detail: "Filter by app name or package name as you type.",
  },
  {
    icon: "tag",
    title: "Filter chips",
    detail: "Switch between All / User / System apps in one tap.",
  },
  {
    icon: "sort",
    title: "Flexible sorting",
    detail:
      "A–Z, Z–A, newest & oldest installs, recently updated, largest APK.",
  },
  {
    icon: "heading",
    title: "Section headers",
    detail: "Alphabetical grouping with sticky letter headers.",
  },
  {
    icon: "grid",
    title: "Two layouts",
    detail: "Dense list view or a 4-column icon grid.",
  },
  {
    icon: "info",
    title: "App details",
    detail:
      "Version code, category, installer source, min / target Android, install & update dates, APK size and path.",
  },
  {
    icon: "chart",
    title: "Live stats",
    detail: "Total / user / system counts plus combined APK size.",
  },
  {
    icon: "rocket",
    title: "Quick actions",
    detail:
      "Launch any app, open its Android App Info page, copy the package name.",
  },
  {
    icon: "share",
    title: "Export anywhere",
    detail: "Share the whole list as text, CSV or JSON — share sheet or clipboard.",
  },
  {
    icon: "wand",
    title: "Calm, fluid motion",
    detail: "Subtle springs, shimmer skeletons, haptic feedback — never flashy.",
  },
  {
    icon: "save",
    title: "Sticky preferences",
    detail: "Theme, filter, sort order and view mode are all remembered.",
  },
];

export type SpecRow = { key: string; value: string; note?: string };

export const SPEC: SpecRow[] = [
  { key: "Runtime", value: "Expo SDK 54", note: "React Native 0.81" },
  { key: "Language", value: "TypeScript", note: "strict" },
  { key: "Routing", value: "expo-router", note: "2 screens: index, pkg" },
  {
    key: "Native layer",
    value: "modules/installed-apps",
    note: "local Expo module, Kotlin",
  },
  {
    key: "Android API",
    value: "PackageManager",
    note: "icon disk cache · streamed scan progress",
  },
  {
    key: "Color engine",
    value: "material-color-utilities",
    note: "tonal palettes from the wallpaper color",
  },
  { key: "List", value: "FlashList", note: "60 fps scrolling" },
  { key: "Motion", value: "Reanimated", note: "expo-image for icons" },
  { key: "Minimum OS", value: "Android 5.0", note: "Lollipop" },
  {
    key: "Permissions",
    value: "QUERY_ALL_PACKAGES",
    note: "the only one, used to read the list and nothing else",
  },
  { key: "Network", value: "none", note: "no ads · no trackers · no analytics" },
  { key: "License", value: "MIT", note: "© 2026 Avithegod2010" },
];

export const SCREENSHOTS = [
  {
    src: "https://raw.githubusercontent.com/Avithegod2010/app-lister/main/docs/screenshots/home-light.jpg",
    alt: "App Lister home screen in light theme showing the alphabetical app list",
    caption: "HOME · LIGHT",
  },
  {
    src: "https://raw.githubusercontent.com/Avithegod2010/app-lister/main/docs/screenshots/home-dark.jpg",
    alt: "App Lister home screen in the AMOLED dark theme",
    caption: "HOME · AMOLED",
  },
  {
    src: "https://raw.githubusercontent.com/Avithegod2010/app-lister/main/docs/screenshots/details.jpg",
    alt: "App details screen with version code, installer source and APK path",
    caption: "DETAILS",
  },
];

export const APP_ICON =
  "https://raw.githubusercontent.com/Avithegod2010/app-lister/main/assets/images/icon.png";

export const BUILD_SCRIPT: { lines: { prompt?: string; text: string }[]; label: string }[] =
  [
    {
      label: "01 · CLONE",
      lines: [
        { prompt: "$", text: "git clone https://github.com/Avithegod2010/app-lister.git" },
        { prompt: "$", text: "cd app-lister" },
        { prompt: "$", text: "npm install" },
      ],
    },
    {
      label: "02 · APK VIA EAS BUILD (CLOUD)",
      lines: [{ prompt: "$", text: "eas build -p android --profile preview" }],
    },
    {
      label: "03 · FULLY LOCAL",
      lines: [
        { prompt: "$", text: "npx expo prebuild -p android" },
        { prompt: "$", text: "cd android && ./gradlew assembleDebug" },
      ],
    },
  ];

export const NAV = [
  { id: "cover", label: "Cover" },
  { id: "manifest", label: "Manifest" },
  { id: "brief", label: "Brief" },
  { id: "screens", label: "Screens" },
  { id: "spec", label: "Spec" },
  { id: "telemetry", label: "Telemetry" },
  { id: "build", label: "Build" },
];
