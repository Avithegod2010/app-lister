"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MANIFEST } from "@/lib/content";
import { bytes, num } from "@/lib/format";
import { REPO } from "@/lib/links";

const files = MANIFEST.filter((r) => r.t === "FILE");
const dirs = MANIFEST.filter((r) => r.t === "DIR");
const listedBytes = files.reduce((sum, r) => sum + (r.s ?? 0), 0);

export default function Manifest() {
  const reduce = useReducedMotion();

  return (
    <div className="relative border-2 border-ribbon bg-paper shadow-[6px_6px_0_rgba(21,23,15,0.14)]">
      {/* printer head sweep, once */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ top: "0%", opacity: 0.85 }}
          whileInView={{ top: "100%", opacity: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.35, ease: "linear" }}
          className="pointer-events-none absolute inset-x-0 z-20 h-px bg-stamp"
        />
      )}

      {/* run header */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-ribbon px-4 py-2.5">
        <span className="label text-paper">
          LISTING 1 — REPOSITORY MANIFEST
        </span>
        <span className="label hidden text-paper/60 sm:block">
          {REPO.full} · main · {REPO.head} · {MANIFEST.length} ENTRIES
        </span>
        <span className="label text-paper/60 sm:hidden">
          {MANIFEST.length} ENTRIES ▸ SWIPE
        </span>
      </div>

      <div className="flex items-stretch">
        {/* tractor strip */}
        <div className="sprocket w-7 shrink-0 border-r border-ribbon/25 bg-paper-deep" />

        <div className="thin-scroll min-w-0 flex-1 overflow-x-auto">
          <div className="greenbar min-w-[880px]">
            {/* column heads */}
            <div className="grid grid-cols-[3rem_3.2rem_minmax(0,1fr)_5.5rem_15rem] items-center border-b border-ribbon/40 px-3 py-0 h-11">
              <span className="label text-graphite">LN</span>
              <span className="label text-graphite">TY</span>
              <span className="label text-graphite">PATH</span>
              <span className="label text-right text-graphite">SIZE</span>
              <span className="label pl-5 text-graphite">ANNOTATION</span>
            </div>

            {MANIFEST.map((row, i) => (
              <motion.div
                key={row.p}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.16,
                  delay: Math.min(i * 0.032, 1.1),
                  ease: "easeOut",
                }}
                whileHover={reduce ? undefined : { x: 5 }}
                className="group grid h-11 grid-cols-[3rem_3.2rem_minmax(0,1fr)_5.5rem_15rem] items-center border-b border-ribbon/10 px-3 transition-colors hover:bg-paper/70"
              >
                <span className="tnum font-mono text-[11px] text-graphite/80">
                  {String(i + 1).padStart(3, "0")}
                </span>

                <span
                  className={`label text-[9px] ${
                    row.t === "DIR" ? "text-stamp" : "text-ink/70"
                  }`}
                >
                  {row.t}
                </span>

                <span className="truncate font-mono text-[12.5px] text-ribbon transition-colors group-hover:text-stamp">
                  {row.t === "DIR" ? (
                    <span className="text-ink">{row.p}</span>
                  ) : (
                    <>
                      <span className="text-graphite/70">
                        {row.p.slice(0, row.p.lastIndexOf("/") + 1)}
                      </span>
                      {row.p.slice(row.p.lastIndexOf("/") + 1)}
                    </>
                  )}
                </span>

                <span className="tnum text-right font-mono text-[12px] text-graphite">
                  {row.t === "DIR" ? "—dir—" : bytes(row.s)}
                </span>

                <span className="truncate pl-5 font-mono text-[12px] italic text-ink/80">
                  {row.n ?? ""}
                </span>
              </motion.div>
            ))}

            <div className="flex h-11 items-center gap-3 border-t border-ribbon/40 px-3">
              <span className="label text-ink">END OF LISTING</span>
              <span className="h-px flex-1 bg-ribbon/25" />
              <span className="label text-graphite">▮</span>
            </div>
          </div>
        </div>

        <div className="sprocket w-7 shrink-0 border-l border-ribbon/25 bg-paper-deep" />
      </div>

      {/* totals */}
      <div className="grid grid-cols-2 border-t-2 border-ribbon bg-paper-deep sm:grid-cols-4">
        {[
          ["ENTRIES", num(MANIFEST.length)],
          ["FILES", num(files.length)],
          ["DIRECTORIES", num(dirs.length)],
          ["BYTES LISTED", bytes(listedBytes)],
        ].map(([k, v]) => (
          <div
            key={k}
            className="border-r border-b border-ribbon/20 px-4 py-3 last:border-r-0 [&:nth-child(2)]:border-r-0 sm:border-b-0 sm:[&:nth-child(2)]:border-r"
          >
            <div className="label text-graphite">{k}</div>
            <div className="tnum mt-1 font-display text-2xl font-bold text-ribbon">
              {v}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
