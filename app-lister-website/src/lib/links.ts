export const REPO_URL_FALLBACK = "https://github.com/Avithegod2010/app-lister";

/** Client-safe facts about the repository (no server-only imports here). */
export const REPO = {
  owner: "Avithegod2010",
  name: "app-lister",
  full: "Avithegod2010/app-lister",
  url: "https://github.com/Avithegod2010/app-lister",
  cloneUrl: "https://github.com/Avithegod2010/app-lister.git",
  releases: "https://github.com/Avithegod2010/app-lister/releases/latest",
  issues: "https://github.com/Avithegod2010/app-lister/issues",
  website: "https://avithegod2010.github.io/app-lister/",
  head: "14ee7d4",
} as const;

export const NAV = [
  { id: "cover", label: "Cover" },
  { id: "download", label: "Download" },
  { id: "manifest", label: "Manifest" },
  { id: "brief", label: "Brief" },
  { id: "screens", label: "Screens" },
  { id: "spec", label: "Spec" },
  { id: "telemetry", label: "Telemetry" },
  { id: "build", label: "Build" },
];

export const TICKER = [
  "EVERY APP ON YOUR PHONE",
  "ONE BEAUTIFUL LIST",
  "NOTHING ELSE",
  "100% OFFLINE",
  "ZERO TRACKERS",
  "MATERIAL YOU",
  "MIT LICENSED",
  "EXPO SDK 54",
];
