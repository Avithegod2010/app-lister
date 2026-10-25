"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download as DownloadIcon,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import type { ApkAsset } from "@/lib/release";
import { Count, Magnetic, Reveal } from "./motion";
import { useCopy } from "./shell";
import { date } from "@/lib/format";

type Phase =
  | { k: "idle" }
  | { k: "run"; got: number; total: number; bps: number }
  | { k: "done"; ms: number }
  | { k: "fail"; why: string };

const MB = 1024 * 1024;
const mb = (n: number) => (n / MB).toFixed(1);

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------- the slip */

export default function Download({
  asset,
  qrSvg,
  initialLocal,
}: {
  asset: ApkAsset;
  qrSvg: string;
  initialLocal: number;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [local, setLocal] = useState(initialLocal);
  const [copied, copy] = useCopy();
  const abort = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      abort.current?.abort();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  /** Streams the APK straight from the GitHub release asset, with byte progress. */
  const start = useCallback(async () => {
    if (phase.k === "run") return;

    const controller = new AbortController();
    abort.current = controller;
    const t0 = performance.now();
    setPhase({ k: "run", got: 0, total: asset.size, bps: 0 });

    try {
      const res = await fetch(asset.downloadUrl, {
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("stream unavailable");

      const total =
        Number(res.headers.get("Content-Length")) || asset.size || 0;
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let got = 0;
      let lastPaint = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value as unknown as BlobPart);
          got += value.byteLength;
          const now = performance.now();
          if (now - lastPaint > 90) {
            lastPaint = now;
            const secs = (now - t0) / 1000;
            setPhase({ k: "run", got, total, bps: secs > 0 ? got / secs : 0 });
          }
        }
      }

      const blob = new Blob(chunks, {
        type: "application/vnd.android.package-archive",
      });
      const url = URL.createObjectURL(blob);
      objectUrl.current = url;

      const a = document.createElement("a");
      a.href = url;
      a.download = asset.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        objectUrl.current = null;
      }, 60_000);

      setLocal((n) => n + 1);
      setPhase({ k: "done", ms: performance.now() - t0 });
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setPhase({ k: "idle" });
        return;
      }
      // Streaming blocked: fall back to a plain navigation download.
      try {
        window.location.href = asset.downloadUrl;
        setPhase({ k: "done", ms: 0 });
      } catch {
        setPhase({ k: "fail", why: "Transfer failed. Use the GitHub mirror." });
      }
    }
  }, [asset.downloadUrl, asset.name, asset.size, phase.k]);

  const pct =
    phase.k === "run" && phase.total > 0
      ? Math.min(100, (phase.got / phase.total) * 100)
      : phase.k === "done"
        ? 100
        : 0;
  const eta =
    phase.k === "run" && phase.bps > 0
      ? (phase.total - phase.got) / phase.bps
      : NaN;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      {/* ------------------------------------------------ dispatch docket */}
      <Reveal className="relative border-2 border-ribbon bg-paper shadow-[8px_8px_0_rgba(21,23,15,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-ribbon px-4 py-2.5">
          <span className="label text-paper">DISPATCH DOCKET — ANDROID PACKAGE</span>
          <span className="label text-paper/60">
            {asset.source === "live" ? "VERIFIED AGAINST GITHUB" : "LAST KNOWN BUILD"}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="label text-stamp">LATEST RELEASE</span>
              <h3 className="display impact mt-1 text-[clamp(2.4rem,6vw,4rem)] text-ribbon">
                {asset.tag}
              </h3>
            </div>
            <div className="text-right">
              <div className="label text-graphite">PACKAGE SIZE</div>
              <div className="tnum font-display text-3xl font-bold text-ink">
                <Count to={Number(mb(asset.size))} format={(n) => n.toFixed(0)} />
                <span className="ml-1 text-lg">MB</span>
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-graphite">
            {asset.title.replace(/^App Lister\s*/i, "")}
          </p>

          {/* ---------------------------------------------- transfer bay */}
          <div className="mt-6 border-2 border-ribbon bg-bar/60 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  type="button"
                  onClick={start}
                  disabled={phase.k === "run"}
                  className="label group relative inline-flex items-center gap-2.5 overflow-hidden border-2 border-stamp bg-stamp px-6 py-4 text-[12px] text-paper transition-shadow hover:shadow-[5px_5px_0_rgba(21,23,15,0.9)] disabled:cursor-wait"
                >
                  <motion.span
                    animate={
                      reduce || phase.k !== "idle"
                        ? undefined
                        : { y: [0, 2.5, 0] }
                    }
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <DownloadIcon size={16} strokeWidth={2.6} />
                  </motion.span>
                  {phase.k === "run"
                    ? "TRANSFERRING…"
                    : phase.k === "done"
                      ? "DOWNLOAD AGAIN"
                      : "DOWNLOAD APK"}
                </button>
              </Magnetic>

              {phase.k === "run" ? (
                <button
                  type="button"
                  onClick={() => abort.current?.abort()}
                  className="label inline-flex items-center gap-1.5 border-2 border-ribbon px-3 py-4 text-ribbon transition-colors hover:bg-ribbon hover:text-paper"
                >
                  <X size={13} strokeWidth={2.6} /> STOP
                </button>
              ) : null}

              <span className="label text-graphite">
                {asset.name}
              </span>
            </div>

            {/* feed bar */}
            <div className="mt-4">
              <div className="relative h-7 overflow-hidden border border-ribbon/50 bg-paper">
                {/* sprocket ticks */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent 0 15px, rgba(21,23,15,0.35) 15px 16px)",
                  }}
                />
                <motion.div
                  className="relative h-full bg-ink"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {phase.k === "run" && !reduce ? (
                    <motion.div
                      className="absolute inset-0 opacity-45"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(245,242,233,0.55) 0 8px, transparent 8px 16px)",
                      }}
                      animate={{ backgroundPositionX: ["0px", "32px"] }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                </motion.div>

                <span className="tnum absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold tracking-widest text-ribbon mix-blend-difference">
                  {pct.toFixed(1)}%
                </span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  [
                    "RECEIVED",
                    phase.k === "run"
                      ? `${mb(phase.got)} / ${mb(phase.total)} MB`
                      : phase.k === "done"
                        ? `${mb(asset.size)} MB`
                        : `0.0 / ${mb(asset.size)} MB`,
                  ],
                  [
                    "RATE",
                    phase.k === "run" && phase.bps > 0
                      ? `${(phase.bps / MB).toFixed(1)} MB/S`
                      : "—",
                  ],
                  [
                    "REMAINING",
                    phase.k === "run" ? clock(eta) : phase.k === "done" ? "00:00" : "--:--",
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="label text-graphite/80">{k}</div>
                    <div className="tnum font-mono text-[12.5px] text-ribbon">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* status line */}
            <AnimatePresence mode="wait">
              <motion.p
                key={phase.k}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className={`label mt-3 flex items-center gap-2 ${
                  phase.k === "fail"
                    ? "text-stamp"
                    : phase.k === "done"
                      ? "text-ink"
                      : "text-graphite"
                }`}
                role="status"
                aria-live="polite"
              >
                {phase.k === "idle" ? (
                  <>▸ STREAMED FROM THIS SITE · NO REDIRECT · NO SIGN-IN</>
                ) : phase.k === "run" ? (
                  <>
                    <span className="inline-block size-1.5 animate-pulse rounded-full bg-stamp" />
                    PULLING BYTES FROM THE RELEASE ASSET…
                  </>
                ) : phase.k === "done" ? (
                  <>
                    <Check size={12} strokeWidth={3} /> SAVED TO YOUR DEVICE
                    {phase.ms > 0 ? ` IN ${(phase.ms / 1000).toFixed(1)}S` : ""} — OPEN IT
                    TO INSTALL
                  </>
                ) : (
                  <>{phase.why}</>
                )}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------ file facts */}
          <dl className="mt-6 divide-y divide-ribbon/15 border-t border-ribbon/25">
            {[
              ["FILE", asset.name],
              ["BYTES", asset.size.toLocaleString("en-US")],
              ["PUBLISHED", date(asset.publishedAt)],
              ["MIN ANDROID", `${asset.minAndroid} (LOLLIPOP)`],
              ["TYPE", "application/vnd.android.package-archive"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-baseline justify-between gap-4 px-1 py-2 ${
                  i % 2 ? "bg-bar/50" : ""
                }`}
              >
                <dt className="label shrink-0 text-graphite">{k}</dt>
                <dd className="tnum truncate font-mono text-[12.5px] text-ribbon">
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          {/* checksum */}
          <div className="mt-4 border-2 border-ink/30 bg-ink/[0.06] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="label flex items-center gap-1.5 text-ink">
                <ShieldCheck size={13} strokeWidth={2.5} /> SHA-256 CHECKSUM
              </span>
              <button
                type="button"
                onClick={() => copy(asset.sha256)}
                className="label inline-flex items-center gap-1.5 border border-ink/40 px-2 py-1 text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {copied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <p className="mt-2 break-all font-mono text-[11.5px] leading-relaxed text-graphite">
              {asset.sha256}
            </p>
            <p className="label mt-2 text-graphite/70">
              VERIFY WITH: sha256sum {asset.name}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------- side rail */}
      <div className="space-y-6">
        {/* QR */}
        <Reveal delay={0.08} className="border-2 border-ribbon bg-paper p-5">
          <span className="label flex items-center gap-2 text-ink">
            <Smartphone size={13} strokeWidth={2.5} /> SEND IT TO THE HANDSET
          </span>
          <p className="mt-2 text-[14.5px] leading-relaxed text-graphite">
            On a desktop? Scan this with the phone you want it on — the code
            points at this site’s own download route.
          </p>
          <motion.div
            className="mt-4 flex justify-center border-2 border-ribbon bg-paper p-3"
            whileHover={reduce ? undefined : { scale: 1.03, rotate: -0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <div
              className="w-full max-w-[190px] [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </motion.div>
          <p className="label mt-3 text-center text-graphite">
            POINTS TO THE GITHUB RELEASE ASSET
          </p>
        </Reveal>

        {/* counters */}
        <Reveal delay={0.14} className="border-2 border-ribbon">
          <div className="bg-ink px-4 py-2.5">
            <span className="label text-paper">DISPATCH COUNTER</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-ribbon/20 bg-paper">
            <div className="px-4 py-4">
              <div className="label text-graphite">FROM THIS SITE</div>
              <div className="tnum mt-1 font-display text-3xl font-bold text-stamp">
                <Count to={local} />
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="label text-graphite">FROM GITHUB</div>
              <div className="tnum mt-1 font-display text-3xl font-bold text-ribbon">
                <Count to={asset.githubDownloads} />
              </div>
            </div>
          </div>
        </Reveal>

        {/* install steps */}
        <Reveal delay={0.2} className="border-2 border-ribbon bg-bar/60 p-5">
          <span className="label text-stamp">INSTALL IN THREE MOVES</span>
          <ol className="mt-3 space-y-3">
            {[
              "Open the downloaded .apk on your phone.",
              "Allow installs from this source if Android asks.",
              "Tap Install — upgrades keep your preferences.",
            ].map((step, i) => (
              <motion.li
                key={step}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.09, duration: 0.4 }}
                className="flex gap-3"
              >
                <span className="tnum shrink-0 font-mono text-[11px] font-bold text-stamp">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14.5px] leading-snug text-graphite">
                  {step}
                </span>
              </motion.li>
            ))}
          </ol>
          <a
            href="https://github.com/Avithegod2010/app-lister/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="label mt-4 block border border-ribbon/40 px-3 py-2.5 text-center text-ribbon transition-colors hover:bg-ribbon hover:text-paper"
          >
            GITHUB MIRROR ↗
          </a>
        </Reveal>

        {/* notes */}
        <Reveal delay={0.26} className="border-2 border-ribbon p-5">
          <span className="label text-ink">IN THIS BUILD</span>
          <ul className="mt-3 space-y-2">
            {asset.notes.map((n, i) => (
              <motion.li
                key={n}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="flex gap-2.5 border-b border-ribbon/12 pb-2 text-[14px] leading-snug text-graphite last:border-0"
              >
                <span className="text-stamp" aria-hidden>
                  ▸
                </span>
                {n}
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
