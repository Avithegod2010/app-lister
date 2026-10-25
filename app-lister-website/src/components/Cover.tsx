"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Download, Star } from "lucide-react";
import { useRef } from "react";
import type { RepoFacts } from "@/lib/github";
import { REPO } from "@/lib/links";
import { date, num, stamp } from "@/lib/format";
import { Chips } from "./shell";
import { Count, Magnetic, SplitWord } from "./motion";

const FACT_ROWS = (f: RepoFacts, tag: string): [string, string][] => [
  ["OWNER", REPO.owner],
  ["REPOSITORY", REPO.name],
  ["RELEASE", tag],
  ["BRANCH", f.branch],
  ["HEAD", REPO.head],
  ["LICENSE", "MIT"],
  ["LANGUAGE", f.language],
  ["SIZE", `${num(f.sizeKb)} KB`],
  ["CREATED", date(f.createdAt)],
  ["PUSHED", stamp(f.pushedAt)],
];

export default function Cover({
  facts,
  apkSize,
  tag,
}: {
  facts: RepoFacts;
  apkSize: number;
  tag: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  const rise = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.55,
            delay: 0.06 * i,
            ease: [0.2, 0.75, 0.25, 1] as [number, number, number, number],
          },
        };

  return (
    <section
      ref={ref}
      id="cover"
      className="relative scroll-mt-24 px-4 pt-10 pb-14 sm:px-8 sm:pt-16"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-dashed border-ribbon/35 pb-3">
          <span className="label text-graphite">
            REPOSITORY DOSSIER · FORM No. {num(1432005543)}
          </span>
          <span className="label hidden text-graphite sm:block">
            SHEET 1 OF 8 · PRINTED FROM MAIN
          </span>
          <span className="label flex items-center gap-2 text-ink">
            <motion.span
              className="inline-block size-1.5 rounded-full bg-stamp"
              animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            LIVE
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ------------------------------------------------ left: title */}
          <div className="lg:col-span-7">
            <motion.p {...rise(0)} className="label mb-5 text-stamp">
              ● ANDROID · EXPO SDK 54 · 100% OFFLINE
            </motion.p>

            <motion.h1
              style={reduce ? undefined : { y: titleY, opacity: fade }}
              className="display impact text-[clamp(3.6rem,15vw,11.5rem)] text-ribbon"
            >
              <SplitWord text="APP" className="block" delay={0.1} />
              <SplitWord text="LISTER" className="block text-ink" delay={0.26} />
            </motion.h1>

            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              className="rule-double my-6 max-w-xl origin-left"
            />

            <motion.p
              {...rise(4)}
              className="max-w-[46ch] font-sans text-[clamp(1.15rem,2.2vw,1.6rem)] leading-snug italic text-ink"
            >
              Every app on your phone. One beautiful list. Nothing else.
            </motion.p>

            <motion.p {...rise(5)} className="mt-5 max-w-[58ch] leading-relaxed text-graphite">
              A single-purpose Android app that lists every installed package —
              user and system — with real icons, Material You theming and instant
              search. No managers, no killers, no analytics. It never opens a
              socket: nothing ever leaves the device.
            </motion.p>

            <motion.div {...rise(6)} className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#download"
                  className="label group inline-flex items-center gap-2 border-2 border-stamp bg-stamp px-5 py-3 text-paper transition-shadow hover:shadow-[4px_4px_0_rgba(21,23,15,0.9)]"
                >
                  <motion.span
                    animate={reduce ? undefined : { y: [0, 2.5, 0] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <Download size={14} strokeWidth={2.5} />
                  </motion.span>
                  DOWNLOAD APK · {(apkSize / (1024 * 1024)).toFixed(0)} MB
                </a>
              </Magnetic>

              <Magnetic strength={0.2}>
                <a
                  href={REPO.url}
                  target="_blank"
                  rel="noreferrer"
                  className="label inline-flex items-center gap-2 border-2 border-ribbon px-5 py-3 text-ribbon transition-colors hover:bg-ribbon hover:text-paper"
                >
                  VIEW SOURCE
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </a>
              </Magnetic>

              <span className="label flex items-center gap-1.5 text-graphite">
                <Star size={12} strokeWidth={2.5} />
                <Count to={facts.stars} />
                <span className="mx-1 text-ribbon/30">/</span>
                <Count to={facts.openIssues} /> OPEN ISSUES
              </span>
            </motion.div>

            <motion.p {...rise(7)} className="label mt-6 text-graphite">
              <a
                href={REPO.website}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-stamp decoration-2 underline-offset-4 hover:text-stamp"
              >
                avithegod2010.github.io/app-lister
              </a>
            </motion.p>
          </div>

          {/* -------------------------------------- right: stamped cover block */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="mb-4 flex justify-end pr-1">
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 1.55, rotate: -26 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6 }}
                  transition={{
                    delay: 0.75,
                    duration: 0.45,
                    type: "spring",
                    stiffness: 260,
                    damping: 12,
                  }}
                  className="stamp origin-center px-3 py-2 text-center"
                >
                  <span className="label block text-[13px] leading-tight">
                    NO TRACKERS
                  </span>
                  <span className="label block text-[9px] leading-tight tracking-[0.16em]">
                    NO NETWORK ACCESS
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.2, 0.75, 0.25, 1] }}
                className="border-2 border-ribbon bg-paper-deep/70"
              >
                <div className="border-b-2 border-ribbon bg-ribbon px-4 py-2">
                  <span className="label text-paper">COVER BLOCK</span>
                </div>

                <dl className="divide-y divide-ribbon/15">
                  {FACT_ROWS(facts, tag).map(([k, v], i) => (
                    <motion.div
                      key={k}
                      initial={reduce ? false : { opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.5 + i * 0.045 }}
                      className={`flex items-baseline justify-between gap-3 px-4 py-2.5 ${
                        i % 2 === 1 ? "bg-bar/70" : ""
                      }`}
                    >
                      <dt className="label shrink-0 text-graphite">{k}</dt>
                      <dd className="tnum truncate font-mono text-[13px] font-medium text-ribbon">
                        {v}
                      </dd>
                    </motion.div>
                  ))}
                </dl>

                <div className="border-t-2 border-ribbon px-4 py-3">
                  <p className="label mb-2 text-graphite">TOPICS</p>
                  <Chips
                    items={
                      facts.topics.length
                        ? facts.topics
                        : ["android", "expo", "react-native", "offline-first", "typescript"]
                    }
                  />
                </div>
              </motion.div>

              <p className="label mt-3 text-right text-graphite">
                STATUS:{" "}
                <span className="text-ink">
                  {facts.source === "live"
                    ? "SYNCED WITH GITHUB"
                    : facts.source === "cache"
                      ? "FROM LOCAL REGISTER"
                      : "AWAITING FIRST SYNC"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
