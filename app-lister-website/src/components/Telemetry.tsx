"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, RefreshCw } from "lucide-react";
import { DrawPath } from "./motion";
import type { RepoFacts, Snapshot } from "@/lib/github";
import { REPO_API, factsFromRepoJson } from "@/lib/github";
import { bytes, num, stamp } from "@/lib/format";

type Metric = "stars" | "sizeKb" | "openIssues";

const METRICS: { id: Metric; label: string }[] = [
  { id: "stars", label: "STARS" },
  { id: "sizeKb", label: "REPO SIZE" },
  { id: "openIssues", label: "OPEN ISSUES" },
];

function useCount(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!run || reduce) return;
    let frame = 0;
    const from = current.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 850);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (target - from) * eased);
      current.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduce]);

  // With reduced motion the figure is simply true, no ticking required.
  return reduce ? target : value;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 640;
  const height = 150;
  const pad = 14;

  const { path, area, points } = useMemo(() => {
    if (values.length === 0) return { path: "", area: "", points: [] as string[] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX =
      values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
    const pts = values.map((v, i) => {
      const x = pad + i * stepX;
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      return [x, y] as const;
    });
    const d = pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    const a = `${d} L${pts[pts.length - 1][0].toFixed(1)},${height - pad} L${pad},${
      height - pad
    } Z`;
    return {
      path: d,
      area: a,
      points: pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`),
    };
  }, [values]);

  if (values.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center border border-dashed border-paper/25">
        <span className="label text-paper/50">NO READINGS RECORDED YET</span>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[150px] w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Repository readings over time"
    >
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={pad + (i * (height - pad * 2)) / 3}
          y2={pad + (i * (height - pad * 2)) / 3}
          stroke="rgba(245,242,233,0.12)"
          strokeWidth={1}
        />
      ))}
      <motion.path
        d={area}
        fill={color}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.16 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <DrawPath d={path} stroke={color} />
      {points.map((p, i) => {
        const [cx, cy] = p.split(",");
        const last = i === points.length - 1;
        return (
          <motion.circle
            key={`${cx}-${cy}-${i}`}
            cx={cx}
            cy={cy}
            r={last ? 4 : 2.2}
            fill={last ? color : "rgba(245,242,233,0.55)"}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.3 + (i / Math.max(points.length - 1, 1)) * 0.9,
              type: "spring",
              stiffness: 420,
              damping: 18,
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
      {/* live pulse on the newest reading */}
      {points.length > 0 ? (
        <motion.circle
          cx={points[points.length - 1].split(",")[0]}
          cy={points[points.length - 1].split(",")[1]}
          r={4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          animate={{ r: [4, 11], opacity: [0.75, 0] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
    </svg>
  );
}

export default function Telemetry({
  initialFacts,
  initialHistory,
}: {
  initialFacts: RepoFacts;
  initialHistory: Snapshot[];
}) {
  const [facts, setFacts] = useState<RepoFacts>(initialFacts);
  const [history, setHistory] = useState<Snapshot[]>(initialHistory);
  const [metric, setMetric] = useState<Metric>("sizeKb");
  const [status, setStatus] = useState<"idle" | "refreshing" | "error">(
    initialFacts.source === "unknown" ? "error" : "idle",
  );
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    let cancelled = false;
    // Static hosting: read the public GitHub API directly from the browser
    // (CORS is allowed) and extend the baked-in history with the fresh point.
    fetch(REPO_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((json) => {
        if (cancelled) return;
        const fresh = factsFromRepoJson(json);
        setFacts(fresh);
        setHistory((prev) => {
          const next = [
            ...prev.filter((h) => h.capturedAt !== fresh.capturedAt),
            {
              capturedAt: fresh.capturedAt,
              stars: fresh.stars,
              forks: fresh.forks,
              watchers: fresh.watchers,
              openIssues: fresh.openIssues,
              sizeKb: fresh.sizeKb,
            },
          ];
          return next.slice(-40);
        });
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setStatus((s) => (s === "idle" ? s : "error"));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stars = useCount(facts.stars, true);
  const forks = useCount(facts.forks, true);
  const issues = useCount(facts.openIssues, true);
  const size = useCount(facts.sizeKb, true);

  const values = history.map((h) =>
    metric === "stars" ? h.stars : metric === "sizeKb" ? h.sizeKb : h.openIssues,
  );
  const latest = history[history.length - 1];

  const cards: [string, string, string][] = [
    ["STARS", num(stars), "stargazers"],
    ["FORKS", num(forks), "network"],
    ["OPEN ISSUES", num(issues), "awaiting triage"],
    ["REPO SIZE", `${num(size)} KB`, "git objects"],
  ];

  const log = [...history].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* counters */}
      <div className="grid grid-cols-2 gap-px bg-paper/15 lg:grid-cols-4">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="bg-ribbon px-4 py-5">
            <div className="label text-paper/50">{label}</div>
            <div className="tnum mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-none text-paper">
              {value}
            </div>
            <div className="label mt-2 text-stamp">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* chart */}
        <div className="border border-paper/25 bg-ribbon/60 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="label flex items-center gap-2 text-paper/70">
              <Activity size={12} strokeWidth={2.5} /> READINGS REGISTER — POSTGRES
            </span>
            <div className="flex gap-1">
              {METRICS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetric(m.id)}
                  className={`label border px-2 py-1 transition-colors ${
                    metric === m.id
                      ? "border-stamp bg-stamp text-paper"
                      : "border-paper/30 text-paper/60 hover:border-paper hover:text-paper"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Sparkline
            values={values}
            color={metric === "stars" ? "#c4361c" : "#8fd6a8"}
          />

          <p className="label mt-3 text-paper/45">
            {history.length < 2
              ? "ONE READING LOGGED — A NEW ONE IS WRITTEN AT MOST EVERY 10 MINUTES"
              : `${history.length} READINGS · ${METRICS.find((m) => m.id === metric)?.label}`}
          </p>
        </div>

        {/* log + status */}
        <div className="border border-paper/25">
          <div className="flex items-center justify-between border-b border-paper/25 px-4 py-2.5">
            <span className="label text-paper/70">REGISTER LOG</span>
            <span className="label flex items-center gap-1.5 text-stamp">
              <span className="inline-block size-1.5 rounded-full bg-stamp" />
              {status === "error" ? "NO LINK" : "LINKED"}
            </span>
          </div>

          {log.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="label text-paper/60">REGISTER EMPTY</p>
              <p className="mt-2 font-mono text-[12.5px] text-paper/40">
                Attempting first sync with api.github.com…
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-paper/20">
                  {["WHEN", "★", "FORK", "ISS"].map((h) => (
                    <th
                      key={h}
                      className="label px-3 py-2 text-left font-semibold text-paper/45"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map((row, i) => (
                  <tr
                    key={row.capturedAt + i}
                    className={i % 2 ? "bg-paper/[0.04]" : ""}
                  >
                    <td className="tnum px-3 py-2 font-mono text-[12px] text-paper/75">
                      {stamp(row.capturedAt).replace(" 2026", "")}
                    </td>
                    <td className="tnum px-3 py-2 font-mono text-[12px] text-paper">
                      {row.stars}
                    </td>
                    <td className="tnum px-3 py-2 font-mono text-[12px] text-paper">
                      {row.forks}
                    </td>
                    <td className="tnum px-3 py-2 font-mono text-[12px] text-paper">
                      {row.openIssues}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="space-y-1.5 border-t border-paper/25 px-4 py-3">
            <p className="label text-paper/45">SOURCE</p>
            <p className="font-mono text-[12.5px] text-paper/80">
              api.github.com/repos/Avithegod2010/app-lister
            </p>
            <p className="label pt-1 text-paper/45">
              {facts.source === "live"
                ? "LIVE RESPONSE · SNAPSHOT WRITTEN"
                : facts.source === "cache"
                  ? "SERVED FROM LOCAL REGISTER"
                  : "OFFLINE — BASELINE FIGURES"}
            </p>
            <p className="label text-paper/45">
              LAST PUSH {facts.pushedAt ? stamp(facts.pushedAt) : "—"} · HEAD{" "}
              {facts.branch}
            </p>
            <p className="label text-paper/45">
              READING CAPTURED {latest ? stamp(latest.capturedAt) : stamp(facts.capturedAt)}
            </p>
            {status === "error" ? (
              <p className="label mt-1 flex items-center gap-1.5 text-stamp">
                <RefreshCw size={11} /> GITHUB UNREACHABLE — SHOWING LAST KNOWN
                VALUES
              </p>
            ) : (
              <p className="label text-paper/45">WORKING TREE SIZE {bytes(facts.sizeKb)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
