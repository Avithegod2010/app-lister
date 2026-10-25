export { REPO } from "@/lib/links";
import { REPO } from "@/lib/links";

export type RepoFacts = {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  sizeKb: number;
  language: string;
  branch: string;
  pushedAt: string;
  createdAt: string;
  topics: string[];
  source: "live" | "cache" | "unknown";
  capturedAt: string;
};

export type Snapshot = {
  capturedAt: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  sizeKb: number;
};

export const REPO_API = `https://api.github.com/repos/${REPO.full}`;

/** Turns the raw GitHub repo object into the facts this site displays. */
export function factsFromRepoJson(json: Record<string, any>): RepoFacts {
  return {
    stars: json.stargazers_count ?? 0,
    forks: json.forks_count ?? 0,
    watchers: json.subscribers_count ?? 0,
    openIssues: json.open_issues_count ?? 0,
    sizeKb: json.size ?? 0,
    language: json.language ?? "TypeScript",
    branch: json.default_branch ?? "main",
    pushedAt: json.pushed_at ?? "",
    createdAt: json.created_at ?? "",
    topics: Array.isArray(json.topics) ? json.topics : [],
    source: "live",
    capturedAt: new Date().toISOString(),
  };
}

const memo = globalThis as typeof globalThis & {
  __appListerRepo?: { at: number; data: Record<string, any> | null };
};
const MEMO_TTL_MS = 10 * 60 * 1000;

async function requestJson(): Promise<Record<string, any> | null> {
  const cached = memo.__appListerRepo;
  if (cached && Date.now() - cached.at < MEMO_TTL_MS && cached.data) {
    return cached.data;
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "app-lister-dossier",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(REPO_API, { headers, cache: "no-store" });
    if (!res.ok) return cached?.data ?? null;
    const data = (await res.json()) as Record<string, any>;
    memo.__appListerRepo = { at: Date.now(), data };
    return data;
  } catch {
    // Rate limited or offline: hand back the last good body if we have one.
    return cached?.data ?? null;
  }
}

/**
 * Repo facts read once at build time from the public GitHub API. On a static
 * export there is no server to write snapshots with, so the client refreshes
 * from the same public endpoint directly (CORS is allowed).
 */
export async function getRepoFacts(): Promise<RepoFacts> {
  const json = await requestJson();
  if (json) return factsFromRepoJson(json);

  return {
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    sizeKb: 1628,
    language: "TypeScript",
    branch: "main",
    pushedAt: "",
    createdAt: "2026-10-24T09:08:55Z",
    topics: [],
    source: "unknown",
    capturedAt: new Date().toISOString(),
  };
}

/** Single-point history: the client extends it with live readings. */
export async function getHistory(): Promise<Snapshot[]> {
  const facts = await getRepoFacts();
  if (facts.source !== "live") return [];
  return [
    {
      capturedAt: facts.capturedAt,
      stars: facts.stars,
      forks: facts.forks,
      watchers: facts.watchers,
      openIssues: facts.openIssues,
      sizeKb: facts.sizeKb,
    },
  ];
}
