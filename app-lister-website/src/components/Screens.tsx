"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SCREENSHOTS } from "@/lib/content";
import { Tilt } from "./motion";

function Shot({
  src,
  alt,
  caption,
  n,
}: {
  src: string;
  alt: string;
  caption: string;
  n: number;
}) {
  const [failed, setFailed] = useState(false);

  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 26, rotate: n % 2 ? -1.2 : 1.2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay: (n - 2) * 0.11, ease: [0.2, 0.75, 0.25, 1] }}
      className="group relative border-2 border-ribbon bg-paper-deep p-2.5 transition-shadow hover:shadow-[6px_6px_0_rgba(21,23,15,0.18)]"
    >
      <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden bg-bar">
        {failed ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="label text-stamp">PLATE NOT LOADED</span>
            <span className="font-mono text-[12px] text-graphite">
              docs/screenshots/
            </span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
      </div>
      <figcaption className="mt-2 flex items-center justify-between">
        <span className="label text-ink">{caption}</span>
        <span className="label text-graphite/70">FIG. {n}</span>
      </figcaption>
    </motion.figure>
  );
}

export default function Screens() {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCREENSHOTS.map((s, i) => (
          <Tilt key={s.caption} max={6}>
            <Shot {...s} n={i + 2} />
          </Tilt>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ribbon/40 pt-4">
        <p className="label text-graphite">
          PLATES COURTESY OF docs/screenshots · SHOT ON DEVICE
        </p>
        <a
          href="https://github.com/Avithegod2010/app-lister/tree/main/docs/screenshots"
          target="_blank"
          rel="noreferrer"
          className="label inline-flex items-center gap-1 text-ink underline decoration-stamp decoration-2 underline-offset-4 hover:text-stamp"
        >
          OPEN ORIGINALS <ArrowUpRight size={12} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
