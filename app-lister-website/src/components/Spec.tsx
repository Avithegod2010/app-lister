"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SPEC } from "@/lib/content";

export default function Spec() {
  const reduce = useReducedMotion();

  return (
    <div className="border-2 border-ribbon bg-paper shadow-[6px_6px_0_rgba(21,23,15,0.14)]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ribbon px-4 py-2.5">
        <span className="label text-paper">TABLE 1 — TECHNICAL SPECIFICATION</span>
        <span className="label text-paper/60">EXPO SDK 54 · RN 0.81</span>
      </div>

      <dl className="divide-y divide-ribbon/15">
        {SPEC.map((row, i) => (
          <motion.div
            key={row.key}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
            whileHover={reduce ? undefined : { x: 5 }}
            className={`grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-3 transition-colors hover:bg-bar sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline ${
              i % 2 ? "bg-bar/60" : ""
            }`}
          >
            <dt className="label text-graphite">{row.key}</dt>
            <dd className="flex flex-wrap items-baseline gap-x-3">
              <span
                className={`font-display text-[19px] font-bold uppercase tracking-tight ${
                  row.value === "none" ? "text-stamp" : "text-ribbon"
                }`}
              >
                {row.value}
              </span>
              {row.note ? (
                <span className="text-[14px] italic text-graphite">{row.note}</span>
              ) : null}
            </dd>
          </motion.div>
        ))}
      </dl>

      <div className="border-t-2 border-ribbon bg-paper-deep px-4 py-3">
        <p className="label text-graphite">
          CREDITS — INSPIRED BY THE <span className="text-ink">LIST APPS</span>{" "}
          PAGE OF INURE APP MANAGER · BUILT WITH EXPO AND THE REACT NATIVE
          COMMUNITY
        </p>
      </div>
    </div>
  );
}
