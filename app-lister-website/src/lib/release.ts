import { REPO } from "@/lib/links";

export type ApkAsset = {
  tag: string;
  title: string;
  name: string;
  size: number;
  sha256: string;
  downloadUrl: string;
  publishedAt: string;
  githubDownloads: number;
  notes: string[];
  minAndroid: string;
  source: "live" | "baseline";
};

/**
 * Figures verified against the Releases API. Used when GitHub is unreachable
 * or rate-limited so the download button is never dead.
 */
const BASELINE: ApkAsset = {
  tag: "v1.1.0",
  title: "App Lister v1.1.0 — themes, richer details, calmer motion",
  name: "app-lister-v1.1.0.apk",
  size: 85087372,
  sha256: "1ad73f1e5154fc3ce969e6ea2db913c2e55a02f96debe3ef0537598d2b80e677",
  downloadUrl:
    "https://github.com/Avithegod2010/app-lister/releases/download/v1.1.0/app-lister-v1.1.0.apk",
  publishedAt: "2026-10-25T06:29:54Z",
  githubDownloads: 1,
  notes: [
    "8 accent palettes — pick a seed colour and the whole UI regenerates as a true Material You palette",
    "AMOLED black mode — pure black surfaces with a whisper of your accent hue",
    "Light / Dark / Follow system in a dedicated Appearance sheet",
    "App category and installer source on the details screen",
    "Combined APK size stat on the home screen",
    "Entrance animations shortened and de-staggered — calmer, more seamless motion",
  ],
  minAndroid: "5.0",
  source: "baseline",
};

const memo = globalThis as typeof globalThis & {
  __appListerRelease?: { at: number; data: ApkAsset };
};
const TTL = 10 * 60 * 1000;

function parseNotes(body: string): string[] {
  if (!body) return BASELINE.notes;
  const out = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) =>
      l
        .slice(2)
        .replace(/\*\*/g, "")
        .replace(/`/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim(),
    )
    .filter((l) => l.length > 0 && !l.startsWith("http"));
  return out.length ? out.slice(0, 6) : BASELINE.notes;
}

/**
 * Latest APK facts straight from the GitHub Releases API, fetched once at
 * build time (the site is a static export). Falls back to the verified
 * baseline so the download button is never dead.
 */
export async function getLatestApk(): Promise<ApkAsset> {
  const cached = memo.__appListerRelease;
  if (cached && Date.now() - cached.at < TTL) return cached.data;

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "app-lister-dossier",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `https://api.github.com/repos/${REPO.full}/releases/latest`,
      { headers, cache: "no-store" },
    );
    if (!res.ok) throw new Error(String(res.status));

    const json = (await res.json()) as Record<string, any>;
    const assets: Record<string, any>[] = Array.isArray(json.assets)
      ? json.assets
      : [];
    const apk =
      assets.find((a) => String(a.name ?? "").toLowerCase().endsWith(".apk")) ??
      null;
    if (!apk) throw new Error("no apk asset");

    const data: ApkAsset = {
      tag: json.tag_name ?? BASELINE.tag,
      title: json.name ?? BASELINE.title,
      name: apk.name,
      size: apk.size ?? BASELINE.size,
      sha256: String(apk.digest ?? "").replace(/^sha256:/, "") || BASELINE.sha256,
      downloadUrl: apk.browser_download_url ?? BASELINE.downloadUrl,
      publishedAt: json.published_at ?? BASELINE.publishedAt,
      githubDownloads: apk.download_count ?? 0,
      notes: parseNotes(String(json.body ?? "")),
      minAndroid: "5.0",
      source: "live",
    };

    memo.__appListerRelease = { at: Date.now(), data };
    return data;
  } catch {
    return cached?.data ?? BASELINE;
  }
}
